
/**
 * JASON BUSINESS — Configuration administrateur
 * Fichier : backend/admin-config.js
 */

const password = process.env.ADMIN_PASSWORD;
const tokenSigningKey = process.env.ADMIN_TOKEN_SECRET;

if (!password || !tokenSigningKey) {
    throw new Error(
        "Configure ADMIN_PASSWORD et ADMIN_TOKEN_SECRET dans Vercel."
    );
}

module.exports = {
    password,
    tokenSigningKey
};
