package com.jasonbusiness.messenger
import android.Manifest
import android.app.AlertDialog
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.LinearLayoutManager
import com.google.firebase.database.*
import com.jasonbusiness.messenger.databinding.ActivityMainBinding
import org.jitsi.meet.sdk.JitsiMeetConferenceOptions
import java.net.URL

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding
    private lateinit var db: DatabaseReference
    private var myPhone="0847500590"
    private var activeChat:String?=null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding=ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        db=FirebaseDatabase.getInstance().reference.child("jasonBusiness")
        checkPermissions()
        setupClicks()
        binding.peopleList.layoutManager=LinearLayoutManager(this)
        binding.messagesList.layoutManager=LinearLayoutManager(this)
        listenCalls()
    }

    fun checkPermissions(){
        val perms=arrayOf(Manifest.permission.CAMERA,Manifest.permission.RECORD_AUDIO,Manifest.permission.POST_NOTIFICATIONS,Manifest.permission.ACCESS_FINE_LOCATION,Manifest.permission.READ_CONTACTS,Manifest.permission.READ_MEDIA_IMAGES)
        val need=perms.filter{ContextCompat.checkSelfPermission(this,it)!=PackageManager.PERMISSION_GRANTED}
        if(need.isNotEmpty()) ActivityCompat.requestPermissions(this,need.toTypedArray(),100)
    }

    fun setupClicks(){
        binding.sendBtn.setOnClickListener{
            val txt=binding.messageInput.text.toString().trim()
            if(txt.isEmpty()||activeChat==null) return@setOnClickListener
            val chatId=FirebaseHelper.getChatId(myPhone,activeChat!!)
            val ref=db.child("messages").child(chatId).push()
            ref.setValue(mapOf("sender" to myPhone,"text" to txt,"createdAt" to System.currentTimeMillis()))
            binding.messageInput.text.clear()
        }
        binding.voiceCallBtn.setOnClickListener{
            if(activeChat==null){Toast.makeText(this,"Choisis contact",Toast.LENGTH_SHORT).show();return@setOnClickListener}
            startActivity(Intent(this,VoiceCallActivity::class.java).apply{putExtra("otherPhone",activeChat);putExtra("myPhone",myPhone)})
        }
        binding.videoCallBtn.setOnClickListener{
            if(activeChat==null){Toast.makeText(this,"Choisis contact",Toast.LENGTH_SHORT).show();return@setOnClickListener}
            startActivity(Intent(this,VideoCallActivity::class.java).apply{putExtra("otherPhone",activeChat);putExtra("myPhone",myPhone)})
        }
        // Test ouvre Dorcas
        binding.chatTitle.setOnClickListener{
            activeChat="0890597871"
            binding.chatTitle.text="Dorcas esambo"
            binding.chatSubtitle.text=activeChat
        }
    }

    fun listenCalls(){
        db.child("calls").child(FirebaseHelper.normalizePhone(myPhone)).addChildEventListener(object:ChildEventListener{
            override fun onChildAdded(s:DataSnapshot,p:String?){
                val from=s.child("from").value.toString()
                val type=s.child("type").value.toString()
                val room=s.child("room").value.toString()
                AlertDialog.Builder(this@MainActivity).setTitle(if(type=="video")"Appel vidéo" else "Appel vocal").setMessage("$from t'appelle")
                    .setPositiveButton("Répondre"){_,_->
                        val opt=JitsiMeetConferenceOptions.Builder().setServerURL(URL("https://meet.jit.si")).setRoom(room).setVideoMuted(type=="voice").build()
                        org.jitsi.meet.sdk.JitsiMeetActivity.launch(this@MainActivity,opt)
                        s.ref.removeValue()
                    }.setNegativeButton("Refuser"){_,_->s.ref.removeValue()}.show()
            }
            override fun onChildChanged(s:DataSnapshot,p:String?){}
            override fun onChildRemoved(s:DataSnapshot){}
            override fun onChildMoved(s:DataSnapshot,p:String?){}
            override fun onCancelled(e:DatabaseError){}
        })
    }
}
