
package com.jasonbusiness.messenger;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.media.MediaPlayer;
import android.media.MediaRecorder;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import java.io.File;

public class MainActivity extends Activity {

    private final int BG = Color.rgb(5, 9, 20);
    private final int PANEL = Color.rgb(11, 20, 37);
    private final int CYAN = Color.rgb(0, 212, 255);

    private LinearLayout messages;
    private EditText messageInput;
    private ScrollView messageScroll;
    private Button micButton;

    private MediaRecorder recorder;
    private File audioFile;
    private boolean recording = false;

    private static final int REQ_AUDIO = 101;
    private static final int REQ_MEDIA = 102;
    private static final int REQ_FILE = 103;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        getWindow().setStatusBarColor(BG);
        getWindow().setNavigationBarColor(BG);

        messages = findViewById(R.id.messagesContainer);
        messageInput = findViewById(R.id.messageInput);
        messageScroll = findViewById(R.id.messageScroll);

        Button sendButton = findViewById(R.id.sendButton);
        Button photoButton = findViewById(R.id.photoButton);
        Button fileButton = findViewById(R.id.fileButton);
        micButton = findViewById(R.id.micButton);

        sendButton.setOnClickListener(v -> sendText());
        photoButton.setOnClickListener(v -> chooseMedia());
        fileButton.setOnClickListener(v -> chooseFile());
        micButton.setOnClickListener(v -> toggleRecording());

        addMessage("JASON BUSINESS",
                "Bienvenue ! Tu peux écrire un message ou choisir un média.");
    }

    private void sendText() {
        String text = messageInput.getText().toString().trim();

        if (text.isEmpty()) {
            Toast.makeText(this, "Écris un message.", Toast.LENGTH_SHORT).show();
            return;
        }

        addMessage("Moi", text);
        messageInput.setText("");
    }

    private void addMessage(String sender, String text) {
        TextView bubble = new TextView(this);

        bubble.setText(sender + "\n" + text);
        bubble.setTextSize(15);
        bubble.setTextColor(Color.WHITE);
        bubble.setPadding(14, 10, 14, 10);

        GradientDrawable shape = new GradientDrawable();
        shape.setColor(sender.equals("Moi")
                ? Color.rgb(12, 48, 66) : PANEL);
        shape.setCornerRadius(18);
        shape.setStroke(1, CYAN);
        bubble.setBackground(shape);

        LinearLayout.LayoutParams params =
                new LinearLayout.LayoutParams(
                        LinearLayout.LayoutParams.WRAP_CONTENT,
                        LinearLayout.LayoutParams.WRAP_CONTENT);

        params.setMargins(0, 5, 0, 5);
        params.gravity = sender.equals("Moi")
                ? Gravity.END : Gravity.START;

        messages.addView(bubble, params);

        messageScroll.post(() ->
                messageScroll.fullScroll(View.FOCUS_DOWN));
    }

    private void chooseMedia() {
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("*/*");
        intent.putExtra(Intent.EXTRA_MIME_TYPES,
                new String[]{"image/*", "video/*"});

        startActivityForResult(intent, REQ_MEDIA);
    }

    private void chooseFile() {
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("*/*");

        startActivityForResult(intent, REQ_FILE);
    }

    @Override
    protected void onActivityResult(
            int requestCode, int resultCode, Intent data) {

        super.onActivityResult(requestCode, resultCode, data);

        if (resultCode != RESULT_OK || data == null) return;

        Uri uri = data.getData();
        if (uri == null) return;

        if (requestCode == REQ_MEDIA) {
            addMessage("Moi", "Média sélectionné :\n" + uri);
            Toast.makeText(this,
                    "Média choisi. Il reste à l'envoyer avec Firebase.",
                    Toast.LENGTH_LONG).show();

        } else if (requestCode == REQ_FILE) {
            addMessage("Moi", "Document sélectionné :\n" + uri);
            Toast.makeText(this,
                    "Document choisi. Il reste à l'envoyer avec Firebase.",
                    Toast.LENGTH_LONG).show();
        }
    }

    private void toggleRecording() {
        if (recording) {
            stopRecording();
            return;
        }

        if (checkSelfPermission(Manifest.permission.RECORD_AUDIO)
                != PackageManager.PERMISSION_GRANTED) {

            requestPermissions(
                    new String[]{Manifest.permission.RECORD_AUDIO},
                    REQ_AUDIO);
            return;
        }

        startRecording();
    }

    private void startRecording() {
        try {
            audioFile = new File(getCacheDir(),
                    "vocal_" + System.currentTimeMillis() + ".m4a");

            if (Build.VERSION.SDK_INT >= 31) {
                recorder = new MediaRecorder(this);
            } else {
                recorder = new MediaRecorder();
            }

            recorder.setAudioSource(MediaRecorder.AudioSource.MIC);
            recorder.setOutputFormat(MediaRecorder.OutputFormat.MPEG_4);
            recorder.setAudioEncoder(MediaRecorder.AudioEncoder.AAC);
            recorder.setOutputFile(audioFile.getAbsolutePath());

            recorder.prepare();
            recorder.start();

            recording = true;
            micButton.setText("⏹ Arrêter");

            Toast.makeText(this,
                    "Enregistrement vocal en cours...",
                    Toast.LENGTH_SHORT).show();

        } catch (Exception e) {
            releaseRecorder();

            Toast.makeText(this,
                    "Impossible de démarrer le microphone.",
                    Toast.LENGTH_LONG).show();
        }
    }

    private void stopRecording() {
        try {
            recorder.stop();
            recorder.release();
            recorder = null;
            recording = false;
            micButton.setText("🎙");

            addMessage("Moi",
                    "Vocal enregistré localement : "
                            + audioFile.getName());

            Toast.makeText(this,
                    "Vocal enregistré. Envoi réseau à ajouter.",
                    Toast.LENGTH_LONG).show();

        } catch (Exception e) {
            Toast.makeText(this,
                    "Enregistrement interrompu.",
                    Toast.LENGTH_SHORT).show();
            releaseRecorder();
        }
    }

    private void releaseRecorder() {
        recording = false;

        if (recorder != null) {
            try {
                recorder.release();
            } catch (Exception ignored) {
            }
            recorder = null;
        }

        if (micButton != null) {
            micButton.setText("🎙");
        }
    }

    @Override
    public void onRequestPermissionsResult(
            int requestCode,
            String[] permissions,
            int[] grantResults) {

        super.onRequestPermissionsResult(
                requestCode, permissions, grantResults);

        if (requestCode == REQ_AUDIO
                && grantResults.length > 0
                && grantResults[0] == PackageManager.PERMISSION_GRANTED) {

            startRecording();

        } else if (requestCode == REQ_AUDIO) {
            Toast.makeText(this,
                    "Autorise le microphone pour enregistrer un vocal.",
                    Toast.LENGTH_LONG).show();
        }
    }

    @Override
    protected void onDestroy() {
        if (recording && recorder != null) {
            try {
                recorder.stop();
            } catch (Exception ignored) {
            }
        }

        releaseRecorder();
        super.onDestroy();
    }
}
