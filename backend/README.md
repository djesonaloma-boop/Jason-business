# Backend Firebase (Admin SDK)

## Installation (sans variables d'environnement)

1. Installez Node.js LTS.
2. Depuis le dossier du projet, exécutez `npm install`.
3. Dans Firebase Console > Paramètres du projet > Comptes de service, générez une clé privée pour le compte de service.
4. Enregistrez le JSON téléchargé sous `backend/serviceAccountKey.json`.
5. Lancez `npm start`.

**Ne partagez jamais** `serviceAccountKey.json`, ne le placez pas dans le dossier public du site et ne le commitez pas. Le fichier est ignoré par `.gitignore`.

## Important

Le serveur utilise Firebase Admin SDK et vérifie les jetons Firebase côté serveur. Les exemples disponibles sont `/api/health`, `/api/me/profile` et `/api/admin/stats`.

Ce backend est une base sécurisée, pas encore une migration complète de l'interface existante : les pages HTML et `app.js` d'origine contiennent encore des imports Firebase Web SDK et des accès directs à Realtime Database. Il faut migrer chaque opération de lecture/écriture vers des routes API vérifiées avant de considérer Firebase comme entièrement retiré du navigateur. Ne supprimez pas les anciens blocs Firebase avant cette migration, sinon certaines pages cesseront de fonctionner.

Le rôle `users/<uid>/role = "admin"` est utilisé dans l'exemple; adaptez-le à votre structure réelle et protégez l'attribution de ce rôle. Les règles Realtime Database doivent aussi interdire les accès directs non autorisés.
