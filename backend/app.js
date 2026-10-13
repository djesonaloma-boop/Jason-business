const express = require("express");
const crypto = require("node:crypto");
const adminConfig = require("./admin-config");
const app = express();
app.use(express.json({ limit: "100kb" }));

function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}
function signToken(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", adminConfig.tokenSigningKey).update(body).digest("base64url");
  return `${body}.${sig}`;
}
function verifyAdminToken(req, res, next) {
  const header = req.headers.authorization || "";
  const match = header.match(/^Bearer ([^.]+\.[^.]+)$/);
  if (!match) return res.status(401).json({ error: "Authentification administrateur requise." });
  const [body, signature] = match[1].split(".");
  const expected = crypto.createHmac("sha256", adminConfig.tokenSigningKey).update(body).digest("base64url");
  if (!safeEqual(signature, expected)) return res.status(401).json({ error: "Jeton administrateur invalide." });
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (payload.role !== "admin" || !Number.isFinite(payload.exp) || payload.exp < Date.now()) {
      return res.status(401).json({ error: "Session administrateur expirée." });
    }
    req.admin = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Jeton administrateur invalide." });
  }
}

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "Jason backend" }));

// Mot de passe vérifié uniquement côté serveur; aucune valeur attendue n'est envoyée au navigateur.
app.post("/api/admin/login", (req, res) => {
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (!safeEqual(password, adminConfig.password)) {
    return res.status(401).json({ error: "Mot de passe incorrect." });
  }
  const token = signToken({ role: "admin", exp: Date.now() + 8 * 60 * 60 * 1000 });
  return res.json({ ok: true, token, expiresIn: 28800 });
});

app.get("/api/admin/session", verifyAdminToken, (_req, res) => res.json({ ok: true, role: "admin" }));

// Firebase Admin est chargé uniquement pour les routes qui en ont besoin.
app.get("/api/me/profile", async (req, res) => {
  const header = req.headers.authorization || "";
  const match = header.match(/^Bearer (.+)$/);
  if (!match) return res.status(401).json({ error: "Authentification Firebase requise." });
  try {
    const { auth, database } = require("./firebase");
    const user = await auth.verifyIdToken(match[1], true);
    const snap = await database.ref(`users/${user.uid}`).get();
    return res.json({ uid: user.uid, profile: snap.val() });
  } catch (err) {
    return res.status(401).json({ error: "Session Firebase invalide ou backend Firebase non configuré." });
  }
});

app.get("/api/admin/stats", verifyAdminToken, async (_req, res) => {
  try {
    const { database } = require("./firebase");
    const [users, commands] = await Promise.all([
      database.ref("users").get(),
      database.ref("commands").get()
    ]);
    res.json({ users: users.exists() ? Object.keys(users.val()).length : 0,
      commands: commands.exists() ? Object.keys(commands.val()).length : 0 });
  } catch {
    res.status(503).json({ error: "Firebase Admin n'est pas configuré sur ce déploiement." });
  }
});

module.exports = app;
