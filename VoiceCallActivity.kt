package com.jasonbusiness.messenger
import android.os.Bundle
import org.jitsi.meet.sdk.JitsiMeetActivity
import org.jitsi.meet.sdk.JitsiMeetConferenceOptions
import java.net.URL
class VoiceCallActivity:VideoCallActivity(){
    override fun onCreate(savedInstanceState:Bundle?){
        val other=intent.getStringExtra("otherPhone")?:""
        val me=intent.getStringExtra("myPhone")?:""
        val room=FirebaseHelper.getChatId(me,other)
        val db=com.google.firebase.database.FirebaseDatabase.getInstance().getReference("jasonBusiness/calls")
        db.child(FirebaseHelper.normalizePhone(other)).push().setValue(mapOf("from" to me,"type" to "voice","room" to room,"time" to System.currentTimeMillis()))
        val opt=JitsiMeetConferenceOptions.Builder().setServerURL(URL("https://meet.jit.si")).setRoom(room).setAudioMuted(false).setVideoMuted(true).build()
        JitsiMeetActivity.launch(this,opt)
        finish()
    }
}
