package com.jasonbusiness.messenger
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.google.firebase.database.FirebaseDatabase
import org.jitsi.meet.sdk.JitsiMeetActivity
import org.jitsi.meet.sdk.JitsiMeetConferenceOptions
import java.net.URL
open class VideoCallActivity:AppCompatActivity(){
    override fun onCreate(savedInstanceState:Bundle?){
        super.onCreate(savedInstanceState)
        val other=intent.getStringExtra("otherPhone")?:""
        val me=intent.getStringExtra("myPhone")?:""
        val room=FirebaseHelper.getChatId(me,other)
        val db=FirebaseDatabase.getInstance().getReference("jasonBusiness/calls")
        db.child(FirebaseHelper.normalizePhone(other)).push().setValue(mapOf("from" to me,"type" to "video","room" to room,"time" to System.currentTimeMillis()))
        val opt=JitsiMeetConferenceOptions.Builder().setServerURL(URL("https://meet.jit.si")).setRoom(room).setAudioMuted(false).setVideoMuted(false).build()
        JitsiMeetActivity.launch(this,opt)
        finish()
    }
}
