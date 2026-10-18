
dependencies {
    // Firebase : version commune des bibliothèques
    implementation(platform("com.google.firebase:firebase-bom:33.7.0"))

    // Comptes des utilisateurs
    implementation("com.google.firebase:firebase-auth")

    // Messages et conversations en temps réel
    implementation("com.google.firebase:firebase-database")

    // Photos, vidéos et messages vocaux
    implementation("com.google.firebase:firebase-storage")
}
