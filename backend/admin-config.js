// Mot de passe administrateur : conservé côté serveur uniquement.
// Ne pas recopier cette valeur dans les pages HTML ou app.js.
module.exports = Object.freeze({
  password: "10092007",
  // Clé de signature du jeton d'accès administrateur, côté serveur uniquement.
  // Pour un déploiement public, remplacez-la par une valeur aléatoire privée.
  tokenSigningKey: "jason-business-admin-token-signing-key-change-before-public-deploy-2026"
});
