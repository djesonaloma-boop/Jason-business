
package com.jasonbusiness.messenger

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.media.MediaRecorder
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.widget.*
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.content.Context
import android.view.ViewGroup
import java.io.File

class MainActivity : Activity() {

    private val bg = Color.rgb(5, 9, 20)
    private val panel = Color.rgb(11, 20, 37)
    private val cyan = Color.rgb(0, 212, 255)
    private var recorder: MediaRecorder? = null
    private var audioFile: File? = null
    private var recording = false
    private lateinit var messages: LinearLayout
    private lateinit var input: EditText
    private lateinit var sendButton: Button
    private lateinit var micButton: Button

    private val audioPermission = 101
    private val pickMedia = 102
    private val pickFile = 103

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.statusBarColor = bg
        window.navigationBarColor = bg
        window.decorView.setBackgroundColor(bg)

        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(14, 12, 14, 12)
            setBackgroundColor(bg)
        }

        val header = TextView(this).apply {
            text = "JB   JASON BUSINESS\nMessenger • Messagerie"
            textSize = 20f
            setTextColor(cyan)
            typeface = Typeface.DEFAULT_BOLD
            setPadding(8, 12, 8, 18)
        }
        root.addView(header)

        val scroll = ScrollView(this)
        messages = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(4, 8, 4, 8)
        }
        scroll.addView(messages)
        root.addView(
            scroll,
            LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f
            )
        )

        val mediaRow = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
        }

        val photoButton = makeButton("🖼 Photo / vidéo")
        photoButton.setOnClickListener { chooseMedia() }

        val fileButton = makeButton("📎 Fichier")
        fileButton.setOnClickListener { chooseFile() }

        mediaRow.addView(photoButton, weightedParams())
        mediaRow.addView(fileButton, weightedParams())
        root.addView(mediaRow)

        val composer = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(0, 8, 0, 4)
        }

        input = EditText(this).apply {
            hint = "Écrire un message..."
            setHintTextColor(Color.LTGRAY)
            setTextColor(Color.WHITE)
            textSize = 15f
            setPadding(14, 8, 14, 8)
            background = rounded(panel, 18)
            minHeight = 48
        }

        micButton = makeButton("🎙")
        micButton.setOnClickListener { toggleRecording() }

        sendButton = makeButton("Envoyer")
        sendButton.setOnClickListener { sendText() }

        composer.addView(input, LinearLayout.LayoutParams(0, -2, 1f))
        composer.addView(micButton)
        composer.addView(sendButton)
        root.addView(composer)

        setContentView(root)
        addMessage("JASON BUSINESS", "Bienvenue ! Choisis un contact et connecte le serveur pour échanger avec d'autres utilisateurs.")
    }

    private fun makeButton(label: String): Button {
        return Button(this).apply {
            text = label
            textSize = 12f
            setTextColor(cyan)
            isAllCaps = false
            background = rounded(panel, 14)
            setPadding(8, 4, 8, 4)
        }
    }

    private fun rounded(color: Int, radius: Int): GradientDrawable {
        return GradientDrawable().apply {
            setColor(color)
            cornerRadius = radius.toFloat()
            setStroke(1, cyan)
        }
    }

    private fun weightedParams() =
        LinearLayout.LayoutParams(0, 48, 1f).apply {
            setMargins(3, 3, 3, 3)
        }

    private fun sendText() {
        val text = input.text.toString().trim()
        if (text.isEmpty()) return
        addMessage("Moi", text)
        input.setText("")
    }

    private fun addMessage(sender: String, text: String) {
        val bubble = TextView(this).apply {
            this.text = "$sender\n$text"
            textSize = 15f
            setTextColor(Color.WHITE)
            setPadding(14, 10, 14, 10)
            background = rounded(
                if (sender == "Moi") Color.rgb(12, 48, 66) else panel,
                16
            )
        }
        val params = LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.WRAP_CONTENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        )
        params.setMargins(0, 5, 0, 5)
        params.gravity =
            if (sender == "Moi") Gravity.END else Gravity.START
        messages.addView(bubble, params)
    }

    private fun chooseMedia() {
        val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = "*/*"
            putExtra(
                Intent.EXTRA_MIME_TYPES,
                arrayOf("image/*", "video/*")
            )
        }
        startActivityForResult(intent, pickMedia)
    }

    private fun chooseFile() {
        val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = "*/*"
        }
        startActivityForResult(intent, pickFile)
    }

    @Deprecated("Handled for compatibility with simple Android projects")
    override fun onActivityResult(
        requestCode: Int, resultCode: Int, data: Intent?
    ) {
        super.onActivityResult(requestCode, resultCode, data)
        if (resultCode != RESULT_OK) return
        val uri: Uri = data?.data ?: return
        val name = uri.lastPathSegment ?: "fichier sélectionné"

        when (requestCode) {
            pickMedia -> addMessage("Moi", "Média sélectionné : $name\n$uri")
            pickFile -> addMessage("Moi", "Document sélectionné : $name\n$uri")
        }
        Toast.makeText(
            this,
            "Fichier sélectionné. L'envoi nécessite le serveur.",
            Toast.LENGTH_LONG
        ).show()
    }

    private fun toggleRecording() {
        if (recording) {
            try {
                recorder?.stop()
                recorder?.release()
                recorder = null
                recording = false
                micButton.text = "🎙"
                audioFile?.let {
                    addMessage("Moi", "Note vocale enregistrée : ${it.name}")
                    Toast.makeText(
                        this,
                        "Audio enregistré localement. L'envoi nécessite le serveur.",
                        Toast.LENGTH_LONG
                    ).show()
                }
            } catch (e: Exception) {
                recording = false
                recorder?.release()
                recorder = null
                micButton.text = "🎙"
                Toast.makeText(this, "Enregistrement interrompu.", Toast.LENGTH_SHORT).show()
            }
            return
        }

        if (checkSelfPermission(Manifest.permission.RECORD_AUDIO)
            != PackageManager.PERMISSION_GRANTED
        ) {
            requestPermissions(
                arrayOf(Manifest.permission.RECORD_AUDIO),
                audioPermission
            )
            return
        }
        startRecording()
    }

    private fun startRecording() {
        try {
            audioFile = File(cacheDir, "vocal_${System.currentTimeMillis()}.m4a")
            recorder = if (Build.VERSION.SDK_INT >= 31) {
                MediaRecorder(this)
            } else {
                @Suppress("DEPRECATION")
                MediaRecorder()
            }

            recorder?.apply {
                setAudioSource(MediaRecorder.AudioSource.MIC)
                setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
                setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
                setOutputFile(audioFile!!.absolutePath)
                prepare()
                start()
            }
            recording = true
            micButton.text = "⏹ Arrêter"
            Toast.makeText(this, "Enregistrement en cours…", Toast.LENGTH_SHORT).show()
        } catch (e: Exception) {
            recorder?.release()
            recorder = null
            recording = false
            Toast.makeText(this, "Impossible d'utiliser le microphone.", Toast.LENGTH_LONG).show()
        }
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == audioPermission &&
            grantResults.isNotEmpty() &&
            grantResults[0] == PackageManager.PERMISSION_GRANTED
        ) {
            startRecording()
        } else {
            Toast.makeText(
                this, "Autorise le microphone pour enregistrer un vocal.",
                Toast.LENGTH_LONG
            ).show()
        }
    }

    override fun onDestroy() {
        try {
            if (recording) recorder?.stop()
            recorder?.release()
        } catch (_: Exception) { }
        recorder = null
        super.onDestroy()
    }
}
