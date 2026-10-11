# Déploiement Vercel — Jason Business

## Déploiement du site

1. Importez ce dossier dans un dépôt Git et choisissez ce dépôt dans Vercel.
2. Vercel détecte `vercel.json`; laissez le répertoire racine à la racine du projet.
3. Déployez. Les pages HTML sont servies comme fichiers statiques et `/api/*` est dirigé vers la fonction serverless.

## Important — clé privée Firebase requise pour les routes backend

Le site web contient actuellement des appels directs au Firebase Web SDK dans les pages HTML. Le backend Admin ajouté n'est pas encore une migration complète de toutes ces opérations. Les routes backend qui importent `backend/firebase.js` ont besoin du fichier privé `backend/serviceAccountKey.json` du compte de service Firebase. Ce fichier n'est pas fourni, car il n'existe pas dans les fichiers reçus et il ne faut pas fabriquer ni publier une clé privée.

En conséquence, le déploiement des pages peut être effectué, mais le backend Firebase Admin ne sera pas opérationnel tant que la clé du compte de service n'est pas fournie de façon sécurisée. Il est impossible de garantir une version entièrement fonctionnelle et sécurisée « sans rien ajouter » sans cette clé. Ne commitez jamais cette clé dans un dépôt public.


## Authentification administrateur
Le mot de passe administrateur existant a été déplacé dans `backend/admin-config.js`; la page `admin.html` appelle désormais `/api/admin/login` et ne contient plus ce mot de passe en clair. Le serveur délivre un jeton de session limité dans le temps.

**Important :** la configuration Firebase fournie par l'utilisateur est une configuration Web publique, pas une clé de compte de service Firebase Admin. Les opérations backend privilégiées (statistiques/profils) nécessitent encore un compte de service Firebase privé. Les autres opérations existantes du panneau utilisent encore le SDK Firebase côté navigateur; ce changement ne constitue donc pas une migration complète ni une garantie de sécurité des données. Avant un déploiement public, changez également `tokenSigningKey` dans `backend/admin-config.js` pour une valeur aléatoire privée.
