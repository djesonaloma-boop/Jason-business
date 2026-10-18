
package com.jasonbusiness.messenger;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.media.MediaRecorder;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.Gravity;
import android.view.ViewGroup;
import android.widget.*;

import java.io.File;

public class MainActivity extends Activity {

    private final int BG = Color.rgb(5, 9, 20);
    private final int PANEL = Color.rgb(11, 20, 37);
    private final int CYAN = Color.rgb(0, 212, 255);

    private LinearLayout messages;
    private EditText input;
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

        getWindow().setStatusBarColor(BG);
        getWindow().setNavigationBarColor(BG);

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(14, 12, 14, 12);
        root.setBackgroundColor(BG);

        TextView header = new TextView(this);
        header.setText("JB   JASON BUSINESS\nMessenger • Messagerie");
        header.setTextSize(20);
        header.setTextColor(CYAN);
        header.setTypeface(null, Typeface.BOLD);
        header.setPadding(8, 12, 8, 18);
        root.addView(header);

        ScrollView scroll = new ScrollView(this);
        messages = new LinearLayout(this);
        messages.setOrientation(LinearLayout.VERTICAL);
        messages.setPadding(4, 8, 4, 8);
        scroll.addView(messages);

        root.addView(scroll, new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f));

        LinearLayout mediaRow = new LinearLayout(this);
        mediaRow.setOrientation(LinearLayout.HORIZONTAL);

        Button photoButton = makeButton("🖼 Photo / vidéo");
        photoButton.setOnClickListener(v -> chooseMedia());

        Button fileButton = makeButton("📎 Fichier");
        fileButton.setOnClickListener(v -> chooseFile());

        mediaRow.addView(photoButton, weightedParams());
        mediaRow.addView(fileButton, weightedParams());
        root.addView(mediaRow);

        LinearLayout composer = new LinearLayout(this);
        composer.setGravity(Gravity.CENTER_VERTICAL);

        input = new EditText(this);
        input.setHint("Écrire un message...");
        input.setHintTextColor(Color.LTGRAY);
        input.setTextColor(Color.WHITE);
        input.setTextSize(15);
        input.setPadding(14, 8, 14, 8);
        input.setBackground(rounded(PANEL));
        input.setMinHeight(48);

        micButton = makeButton("🎙");
        micButton.setOnClickListener(v -> toggleRecording());

        Button sendButton = makeButton("Envoyer");
        sendButton.setOnClickListener(v -> sendText());

        composer.addView(input, new LinearLayout.LayoutParams(0,
                ViewGroup.LayoutParams.WRAP_CONTENT, 1f));
        composer.addView(micButton);
        composer.addView(sendButton);
        root.addView(composer);

        setContentView(root);

        addMessage("JASON BUSINESS",
                "Bienvenue ! Les messages s'affichent ici. Connecte Firebase pour communiquer avec d'autres utilisateurs.");
    }

    private Button makeButton(String label) {
        Button button = new Button(this);
        button.setText(label);
        button.setTextSize(12);
        button.setTextColor(CYAN);
        button.setAllCaps(false);
        button.setBackground(rounded(PANEL));
        return button;
    }

    private GradientDrawable rounded(int color) {
        GradientDrawable shape = new GradientDrawable();
        shape.setColor(color);
        shape.setCornerRadius(18);
        shape.setStroke(1, CYAN);
        return shape;
    }

    private LinearLayout.LayoutParams weightedParams() {
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
                0, 48, 1f);
        params.setMargins(3, 3, 3, 3);
        return params;
    }

    private void sendText() {
        String text = input.getText().toString().trim();
        if (text.isEmpty()) return;

        addMessage("Moi", text);
        input.setText("");
    }

    private void addMessage(String sender, String text) {
        TextView bubble = new TextView(this);
        bubble.setText(sender + "\n" + text);
        bubble.setTextSize(15);
        bubble.setTextColor(Color.WHITE);
        bubble.setPadding(14, 10, 14, 10);
        bubble.setBackground(rounded(
                sender.equals("Moi") ? Color.rgb(12, 48, 66) : PANEL));

        LinearLayout.LayoutParams params =
                new LinearLayout.LayoutParams(
                        ViewGroup.LayoutParams.WRAP_CONTENT,
                        ViewGroup.LayoutParams.WRAP_CONTENT);
        params.setMargins(0, 5, 0, 5);
        params.gravity = sender.equals("Moi") ? Gravity.END : Gravity.START;
        messages.addView(bubble, params);
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
    protected void onActivityResult(int requestCode, int resultCode,
                                    Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        if (resultCode != RESULT_OK || data == null) return;

        Uri uri = data.getData();
        if (uri == null) return;

        if (requestCode == REQ_MEDIA) {
            addMessage("Moi", "Média sélectionné : " + uri);
        } else if (requestCode == REQ_FILE) {
            addMessage("Moi", "Document sélectionné : " + uri);
        }

        Toast.makeText(this,
                "Fichier choisi. Envoi réseau à connecter.",
                Toast.LENGTH_LONG).show();
    }

    private void toggleRecording() {
        if (recording) {
            try {
                recorder.stop();
                recorder.release();
                recorder = null;
                recording = false;
                micButton.setText("🎙");
                addMessage("Moi", "Vocal enregistré : " + audioFile.getName());
                Toast.makeText(this,
                        "Vocal enregistré localement.",
                        Toast.LENGTH_LONG).show();
            } catch (Exception e) {
                releaseRecorder();
                Toast.makeText(this, "Enregistrement interrompu.",
                        Toast.LENGTH_SHORT).show();
            }
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
            Toast.makeText(this, "Enregistrement en cours...",
                    Toast.LENGTH_SHORT).show();

        } catch (Exception e) {
            releaseRecorder();
            Toast.makeText(this, "Impossible d'utiliser le microphone.",
                    Toast.LENGTH_LONG).show();
        }
    }

    private void releaseRecorder() {
        recording = false;
        try {
            if (recorder != null) recorder.release();
        } catch (Exception ignored) { }
        recorder = null;
        if (micButton != null) micButton.setText("🎙");
    }

    @Override
    public void onRequestPermissionsResult(int requestCode,
            String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(
                requestCode, permissions, grantResults);

        if (requestCode == REQ_AUDIO && grantResults.length > 0
                && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
            startRecording();
        } else if (requestCode == REQ_AUDIO) {
            Toast.makeText(this, "Autorise le microphone.",
                    Toast.LENGTH_LONG).show();
        }
    }

    @Override
    protected void onDestroy() {
        if (recording) {
            try {
                recorder.stop();
            } catch (Exception ignored) { }
        }
        releaseRecorder();
        super.onDestroy();
    }
}
