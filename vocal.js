// vocal.js - fichier à part, pas de module Firebase dedans
let isRecording = false;
let mediaRecorder = null;
let audioChunks = [];
let recordStream = null;
let timerInt = null;
let recSec = 0;

function fmt(s){ const m=String(Math.floor(s/60)).padStart(2,'0'); const sec=String(s%60).padStart(2,'0'); return `${m}:${sec}` }

window.toggleVocalChat = async function() {
  const btn = document.getElementById("recordBtn");
  const hint = document.getElementById("hint");
  const recTime = document.getElementById("recTime");
  const recBar = document.getElementById("recBar");

  if(!window.activeChat){ alert("Ouvre d'abord un chat"); return }

  if(!isRecording){
    try{
      hint.textContent="Micro...";
      recordStream = await navigator.mediaDevices.getUserMedia({audio:true});
      let mime="audio/webm;codecs=opus";
      if(!MediaRecorder.isTypeSupported(mime)) mime="audio/webm";
      if(!MediaRecorder.isTypeSupported(mime)) mime="audio/mp4";
      if(!MediaRecorder.isTypeSupported(mime)) mime="";
      mediaRecorder = mime ? new MediaRecorder(recordStream,{mimeType:mime}) : new MediaRecorder(recordStream);
      audioChunks=[]; recSec=0;

      mediaRecorder.ondataavailable=e=>{ if(e.data.size>0) audioChunks.push(e.data) };
      mediaRecorder.onstop=async()=>{
        clearInterval(timerInt);
        recBar.classList.remove("show");
        btn.classList.remove("hold");
        btn.textContent="🎤";
        const blob=new Blob(audioChunks,{type:mediaRecorder.mimeType||"audio/webm"});
        if(blob.size<500){ hint.textContent="Trop court"; return }
        
        hint.textContent="⏳ Envoi...";
        // Appelle la fonction Firebase qui est dans chat.html
        if(window.uploadVocalToFirebase){
          await window.uploadVocalToFirebase(blob);
        }
        try{recordStream.getTracks().forEach(t=>t.stop())}catch{};
        isRecording=false;
      };

      mediaRecorder.start(100);
      isRecording=true;
      recBar.classList.add("show");
      btn.classList.add("hold");
      btn.textContent="⏹️";
      recTime.textContent="00:00";
      hint.textContent="🔴 Enregistrement... Re-clique ⏹️";
      timerInt=setInterval(()=>{ recSec++; recTime.textContent=fmt(recSec); if(recSec>=20){ try{mediaRecorder.stop()}catch{}} },1000);

    }catch(err){
      alert("Micro bloqué: "+err.message);
      isRecording=false;
    }
  }else{
    try{ mediaRecorder.stop() }catch{}
  }
}
