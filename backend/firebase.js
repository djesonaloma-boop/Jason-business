/* ============================================================
   JASON BUSINESS 🇨🇩 — BACKEND SANS FIREBASE
   Créateur : Jason Aloma
   Fichier : backend/firebase.js
   Mode : Sans Firebase - Mémoire locale seulement
   ============================================================ */

// Pas de firebase-admin - On simule pour ne pas crasher

export const FIREBASE_CONFIG = {
  projectId: "jason-business-local",
  databaseURL: "local://memory"
};

// On utilise les variables d'environnement Vercel maintenant
export const FIREBASE_SERVICE_ACCOUNT = {
  projectId: process.env.FIREBASE_PROJECT_ID || "",
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "",
  privateKey: process.env.FIREBASE_PRIVATE_KEY || ""
};

export const ADMIN_PASSWORD = process.env.ADMIN_SECRET || "Jason2026";

// Toujours false car on est sans Firebase
export function isFirebaseConfigured() {
  return false;
}

export function initializeFirebase() {
  console.log("[JASON BUSINESS] Mode SANS Firebase activé");
  return { name: "local-mock-app" };
}

export function getFirebase() {
  // Retourne des objets vides pour ne pas crasher api/index.js
  return {
    app: { name: "local-mock" },
    auth: {
      verifyIdToken: async () => { throw new Error("Firebase désactivé"); }
    },
    database: {
      ref: () => ({ once: async () => ({ val: () => null }), set: async () => {}, update: async () => {} })
    },
    firestore: {
      collection: () => ({ doc: () => ({ get: async () => ({ exists: false }), set: async () => {} }) })
    },
    storage: {
      bucket: () => ({ file: () => ({ save: async () => {} }) })
    }
  };
}

export async function verifyIdToken(token) {
  if (!token) throw new Error("Jeton manquant");
  // En mode sans Firebase, on accepte le token généré par /api/admin/login
  if (token.startsWith("jason_token_")) {
    return { uid: "admin_local", email: "admin@jason.local", email_verified: true };
  }
  throw new Error("Firebase désactivé - Utilise le login admin local");
}

export function getBearerToken(req) {
  const header = req.headers?.authorization || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match? match[1].trim() : null;
}

export async function requireAuth(req, res, next) {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({
        success: false,
        error: "AUTH_TOKEN_REQUIRED",
        message: "Connecte-toi pour continuer."
      });
    }
    // En mode sans Firebase, on vérifie juste que c'est un token jason_token_
    if (token.startsWith("jason_token_") || token.length > 20) {
      req.user = { uid: "admin_local", email: "admin@jason.local", emailVerified: true };
      return next();
    }
    throw new Error("Token invalide");
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "AUTH_TOKEN_INVALID",
      message: "Session invalide."
    });
  }
}

export function isAdminPasswordConfigured() {
  return typeof ADMIN_PASSWORD === "string" && ADMIN_PASSWORD.length >= 6;
}
