package com.jasonbusiness.messenger;
import com.google.firebase.database.DataSnapshot;
public class FirebaseHelper {
    public static String getUserPhoto(DataSnapshot s){
        if(s.child("photo").exists()) return s.child("photo").getValue(String.class);
        if(s.child("photoProfil").exists()) return s.child("photoProfil").getValue(String.class);
        if(s.child("avatar").exists()) return s.child("avatar").getValue(String.class);
        return "";
    }
    public static String normalizePhone(String v){
        String p=v.replaceAll("\\D","");
        if(p.startsWith("243")) p="0"+p.substring(3);
        if(p.length()==9 && !p.startsWith("0")) p="0"+p;
        return p;
    }
    public static String getChatId(String a,String b){
        String na=normalizePhone(a), nb=normalizePhone(b);
        return na.compareTo(nb)<0 ? na+"_"+nb : nb+"_"+na;
    }
}
