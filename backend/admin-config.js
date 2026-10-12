// ============================================================
// JASON BUSINESS - ADMIN-CONFIG.JS
// Mot de passe administrateur : conservé côté serveur uniquement.
// Ne pas recopier cette valeur dans les pages HTML ou app.js.
// ============================================================
const crypto = require('crypto');

const CONFIG = Object.freeze({
  password: "10092007",
  // Clé de signature du jeton d'accès administrateur, côté serveur uniquement.
  // Pour un déploiement public, remplacez-la par une valeur aléatoire privée.
  tokenSigningKey: "jason-business-admin-token-signing-key-change-before-public-deploy-2026",
  tokenDurationMs: 24 * 60 * 60 * 1000 // 24 heures
});

function signToken(payload) {
  const json = JSON.stringify(payload);
  const data = Buffer.from(json).toString('base64url');
  const signature = crypto
    .createHmac('sha256', CONFIG.tokenSigningKey)
    .update(data)
    .digest('base64url');
  return `${data}.${signature}`;
}

function verifyToken(token) {
  try {
    if (!token || typeof token !== 'string') return null;
    const [data, signature] = token.split('.');
    if (!data || !signature) return null;

    const expected = crypto
      .createHmac('sha256', CONFIG.tokenSigningKey)
      .update(data)
      .digest('base64url');

    if (signature.length !== expected.length) return null;
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(data, 'base64url').toString());
    
    // Vérifie expiration
    if (!payload.t || Date.now() - payload.t > CONFIG.tokenDurationMs) {
      return null;
    }

    return payload;
  } catch (e) {
    return null;
  }
}

function checkPassword(input) {
  if (typeof input !== 'string') return false;
  return input === CONFIG.password;
}

function createAdminToken() {
  return signToken({ role: 'admin', t: Date.now() });
}

function login(password) {
  if (!checkPassword(password)) {
    return { success: false, error: 'Mot de passe incorrect' };
  }
  return { success: true, token: createAdminToken() };
}

module.exports = Object.freeze({
  password: CONFIG.password,
  tokenSigningKey: CONFIG.tokenSigningKey,
  tokenDurationMs: CONFIG.tokenDurationMs,
  signToken,
  verifyToken,
  checkPassword,
  createAdminToken,
  login
});
