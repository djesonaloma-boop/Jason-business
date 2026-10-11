const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// --- DATABASE PERSISTANTE data/database.json ---
const DB_PATH = path.join(__dirname, '..', 'data', 'database.json');

function ensureDB() {
  if (!fs.existsSync(path.dirname(DB_PATH))) fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    const init = {
      clients: [
        { id: "client_demo", name: "Client Demo", email: "demo@jasonbusiness.cd", phone: "0847500590", password: "demo123", balance: 0, status: "active", createdAt: new Date().toISOString() }
      ],
      deposits: [],
      withdrawals: [],
      vip_users: {},
      prices: [
        { service: "chatbot", amount: 5000, currency: "FC", category: "api" },
        { service: "image", amount: 3000, currency: "FC", category: "api" },
        { service: "facebook_followers", amount: 5000, currency: "FC", category: "smm" },
        { service: "facebook_likes", amount: 2500, currency: "FC", category: "smm" },
        { service: "facebook_views", amount: 3000, currency: "FC", category: "smm" },
        { service: "youtube_subscribers", amount: 8000, currency: "FC", category: "smm" },
        { service: "youtube_views", amount: 5000, currency: "FC", category: "smm" },
        { service: "tiktok_followers", amount: 5000, currency: "FC", category: "smm" },
        { service: "tiktok_likes", amount: 2500, currency: "FC", category: "smm" },
        { service: "instagram_followers", amount: 5000, currency: "FC", category: "smm" },
        { service: "bronze", amount: 5000, currency: "FC", category: "vip" },
        { service: "argent", amount: 10000, currency: "FC", category: "vip" },
        { service: "diamant", amount: 40000, currency: "FC", category: "vip" },
        { service: "mega", amount: 75000, currency: "FC", category: "vip" },
        { service: "giga", amount: 100000, currency: "FC", category: "vip" }
      ],
      smm_orders: [],
      support_messages: [],
      api_access: [],
      depositNumbers: [
        { id: "1", operator: "M-Pesa", number: "0847500590", name: "Jason Aloma", instructions: "Envoyez avec référence JB-SMM", status: "active", createdAt: new Date().toISOString() },
        { id: "2", operator: "Airtel Money", number: "0990000000", name: "Jason Aloma", instructions: "Référence JB", status: "active", createdAt: new Date().toISOString() },
        { id: "3", operator: "Orange Money", number: "0890000000", name: "Jason Aloma", instructions: "Référence JB", status: "active", createdAt: new Date().toISOString() }
      ],
      logs: [],
      settings: { siteName: "JASON BUSINESS", currency: "FC", minDeposit: 2000, minWithdrawal: 2000, maintenance: false, adminCode: "10092007" }
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(init, null, 2));
  }
}
function loadDB() { ensureDB(); return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); }
function saveDB(db) { fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2)); }

const ADMIN_SECRET = "10092007";
const MIN_AMOUNT = 2000;

function getBalance(db, clientId) {
  const dep = db.deposits.filter(d => d.clientId === clientId && d.status === 'approved').reduce((s, d) => s + Number(d.amount || 0), 0);
  const wit = db.withdrawals.filter(w => w.clientId === clientId && w.status === 'approved').reduce((s, w) => s + Number(w.amount || 0), 0);
  return dep - wit;
}
function getClientId(req) {
  const auth = (req.headers.authorization || "").replace("Bearer ", "").trim();
  if (!auth) return "client_demo";
  if (auth.includes("admin_token_10092007")) return "client_demo";
  return "client_" + auth.slice(0, 12).replace(/[^a-zA-Z0-9]/g, "");
}

// --- HEALTH ---
app.get('/api/health', (req, res) => {
  const db = loadDB();
  res.json({ status: "ok", mode: "data/database.json", minDeposit: db.settings.minDeposit, minWithdrawal: db.settings.minWithdrawal, adminCode: "10092007 active", totalClients: db.clients.length, time: new Date().toISOString() });
});

// --- PUBLIC ---
app.get('/api/public/prices', (req, res) => {
  const db = loadDB();
  const formatted = db.prices.map(p => ({
    platform: p.service.split("_")[0], p: p.service.split("_")[0],
    name: p.service, service: p.service,
    rate: Number(p.amount), price: Number(p.amount),
    currency: p.currency, category: p.category
  }));
  res.json({ prices: formatted, raw: db.prices });
});

app.get('/api/client/balance', (req, res) => {
  const db = loadDB();
  const clientId = getClientId(req);
  res.json({ clientId, balance: getBalance(db, clientId), currency: "FC", minDeposit: db.settings.minDeposit });
});

app.get('/api/deposit-numbers', (req, res) => {
  const db = loadDB();
  res.json({ numbers: db.depositNumbers.filter(n => n.status === 'active') });
});

// --- SMM ---
app.post('/api/smm/order', (req, res) => {
  const db = loadDB();
  const clientId = getClientId(req);
  const { platform, service, url, quantity, estimatedPrice, rate } = req.body;
  if (!url ||!quantity) return res.status(400).json({ message: "Lien et quantité requis" });
  if (Number(quantity) < 100) return res.status(400).json({ message: "Quantité minimum 100" });
  const balance = getBalance(db, clientId);
  const price = Number(estimatedPrice || 0);
  if (balance < db.settings.minDeposit) return res.status(400).json({ message: `Dépôt requis avant activité: solde ${balance} FC < ${db.settings.minDeposit} FC min. Prix ${price} FC affiché mais bloqué.` });
  if (balance < price) return res.status(400).json({ message: `Solde insuffisant: prix affiché ${price} FC mais tu as ${balance} FC. Ça ne va pas s'activer.` });
  const order = { id: "JB-SMM-" + Date.now(), reference: "JB-SMM-" + Date.now(), clientId, platform, service, url, quantity: Number(quantity), rate: Number(rate || 0), estimatedPrice: price, totalPrice: price, status: "pending", createdAt: new Date().toISOString() };
  db.smm_orders.push(order);
  db.logs.push({ createdAt: new Date().toISOString(), action: "SMM_ORDER", admin: clientId, details: `${platform} ${service} x${quantity} pour ${price} FC` });
  saveDB(db);
  res.json({ message: "Commande SMM enregistrée", order, balance: balance - price });
});

app.get('/api/smm/my-orders', (req, res) => {
  const db = loadDB();
  const clientId = getClientId(req);
  res.json({ orders: db.smm_orders.filter(o => o.clientId === clientId || clientId === "client_demo").slice(-50).reverse() });
});

// --- VIP ---
app.get('/api/vip/status', (req, res) => {
  const db = loadDB();
  const clientId = getClientId(req);
  const vip = db.vip_users[clientId] || { tierId: null, points: 0, expiresAt: null, history: [] };
  const active = vip.expiresAt && new Date(vip.expiresAt) > new Date();
  res.json({ active:!!active, tierId: vip.tierId, points: vip.points || 0, expiresAt: vip.expiresAt, history: vip.history || [], balance: getBalance(db, clientId) });
});

app.post('/api/vip/activate', (req, res) => {
  const db = loadDB();
  const { tierId } = req.body;
  const clientId = getClientId(req);
  const tiersPrice = { bronze: 5000, argent: 10000, diamant: 40000, mega: 75000, giga: 100000 };
  const price = tiersPrice[tierId] || Number(db.prices.find(p => p.service === tierId)?.amount || 5000);
  const balance = getBalance(db, clientId);
  if (balance < db.settings.minDeposit) return res.status(400).json({ message: `Dépôt requis: solde ${balance} FC < ${db.settings.minDeposit} FC min. Prix ${price} FC affiché mais bloqué.` });
  if (balance < price) return res.status(400).json({ message: `Solde insuffisant: prix affiché ${price} FC mais tu as ${balance} FC. Ça ne va pas s'activer.` });
  const expiresAt = new Date(Date.now() + 30 * 86400000).toISOString();
  if (!db.vip_users[clientId]) db.vip_users[clientId] = { points: 0, history: [] };
  db.vip_users[clientId].tierId = tierId;
  db.vip_users[clientId].expiresAt = expiresAt;
  db.vip_users[clientId].history.push({ name: tierId.toUpperCase(), date: new Date().toLocaleString("fr-FR"), expiry: new Date(expiresAt).toLocaleDateString("fr-FR"), action: `Activé ${price} FC - Solde ${balance} FC vérifié` });
  db.withdrawals.push({ id: "VIP-" + Date.now(), clientId, amount: price, method: "VIP " + tierId, currency: "FC", status: "approved", createdAt: new Date().toISOString() });
  db.logs.push({ createdAt: new Date().toISOString(), action: "VIP_ACTIVATE", admin: clientId, details: `${clientId} -> ${tierId} ${price} FC` });
  saveDB(db);
  res.json({ tierId, expiresAt, points: 0, history: db.vip_users[clientId].history, balance: balance - price });
});

// --- SUPPORT ---
app.post('/api/support/message', (req, res) => {
  const db = loadDB();
  const clientId = getClientId(req);
  db.support_messages.push({ id: "SUP-" + Date.now(), clientId, message: req.body.message, source: req.body.source || "web", createdAt: new Date().toISOString() });
  saveDB(db);
  res.json({ ok: true });
});

// --- CLIENT DEPOSITS/WITHDRAWALS ---
app.post('/api/deposits/create', (req, res) => {
  const db = loadDB();
  const clientId = getClientId(req);
  const { amount, method, reference, operator } = req.body;
  if (Number(amount) < db.settings.minDeposit) return res.status(400).json({ message: `Dépôt minimum ${db.settings.minDeposit} FC` });
  const dep = { id: "DEP-" + Date.now(), clientId, amount: Number(amount), currency: "FC", method: method || operator || "M-Pesa", reference: reference || "REF-" + Date.now(), status: "pending", createdAt: new Date().toISOString() };
  db.deposits.push(dep);
  db.logs.push({ createdAt: new Date().toISOString(), action: "DEPOSIT_CREATE", admin: clientId, details: `${amount} FC ${method}` });
  saveDB(db);
  res.json({ message: "Dépôt en attente validation admin", deposit: dep });
});

app.post('/api/withdrawals/create', (req, res) => {
  const db = loadDB();
  const clientId = getClientId(req);
  const { amount, method, account } = req.body;
  if (Number(amount) < db.settings.minWithdrawal) return res.status(400).json({ message: `Retrait minimum ${db.settings.minWithdrawal} FC` });
  const balance = getBalance(db, clientId);
  if (balance < Number(amount)) return res.status(400).json({ message: `Solde insuffisant: ${balance} FC` });
  const wit = { id: "WIT-" + Date.now(), clientId, amount: Number(amount), currency: "FC", method: method || "M-Pesa", accountMasked: account, account, status: "pending", createdAt: new Date().toISOString() };
  db.withdrawals.push(wit);
  saveDB(db);
  res.json({ message: "Retrait en attente", withdrawal: wit });
});

// --- ADMIN ---
app.post('/api/admin/login', (req, res) => {
  const { secret } = req.body;
  if (String(secret) === ADMIN_SECRET) return res.json({ token: "admin_token_10092007_" + Date.now(), admin: req.body.username || "jason_admin" });
  res.status(401).json({ message: "Code incorrect - utilise 10092007" });
});

const adminAuth = (req, res, next) => { next(); }; // Simplifié, token vérifié côté front

app.get('/api/admin/overview', adminAuth, (req, res) => {
  const db = loadDB();
  res.json({
    clients: db.clients.length,
    pendingDeposits: db.deposits.filter(d => d.status === 'pending').length,
    pendingWithdrawals: db.withdrawals.filter(w => w.status === 'pending').length,
    vipClients: Object.keys(db.vip_users).length,
    totalDeposits: db.deposits.filter(d => d.status === 'approved').reduce((s, d) => s + Number(d.amount), 0),
    totalWithdrawals: db.withdrawals.filter(w => w.status === 'approved').reduce((s, w) => s + Number(w.amount), 0),
    smmOrders: db.smm_orders.length
  });
});

app.get('/api/admin/deposits', adminAuth, (req, res) => { const db = loadDB(); res.json({ deposits: db.deposits.slice().reverse() }); });
app.get('/api/admin/withdrawals', adminAuth, (req, res) => { const db = loadDB(); res.json({ withdrawals: db.withdrawals.slice().reverse() }); });
app.get('/api/admin/clients', adminAuth, (req, res) => {
  const db = loadDB();
  const list = db.clients.map(c => ({...c, balance: getBalance(db, c.id) }));
  res.json({ clients: list });
});
app.get('/api/admin/vip', adminAuth, (req, res) => {
  const db = loadDB();
  const list = Object.entries(db.vip_users).map(([id, v]) => ({ clientId: id, clientName: id, level: v.tierId, expiresAt: v.expiresAt, price: db.prices.find(p => p.service === v.tierId)?.amount || 0 }));
  res.json({ clients: list });
});
app.get('/api/admin/smm-orders', adminAuth, (req, res) => { const db = loadDB(); res.json({ orders: db.smm_orders.slice().reverse() }); });
app.get('/api/admin/api-access', adminAuth, (req, res) => { const db = loadDB(); res.json({ access: db.api_access }); });
app.get('/api/admin/prices', adminAuth, (req, res) => { const db = loadDB(); res.json({ prices: db.prices }); });
app.get('/api/admin/deposit-numbers', adminAuth, (req, res) => { const db = loadDB(); res.json({ numbers: db.depositNumbers }); });
app.get('/api/admin/audit', adminAuth, (req, res) => { const db = loadDB(); res.json({ logs: db.logs.slice().reverse().slice(0, 200) }); });
app.get('/api/admin/support-messages', adminAuth, (req, res) => { const db = loadDB(); res.json({ messages: db.support_messages.slice().reverse() }); });

app.post('/api/admin/deposits/:id/approve', adminAuth, (req, res) => {
  const db = loadDB(); const d = db.deposits.find(x => x.id === req.params.id);
  if (d) { d.status = 'approved'; db.logs.push({ createdAt: new Date().toISOString(), action: 'DEPOSIT_APPROVE', admin: '10092007', details: `${d.id} ${d.amount} FC approuvé` }); saveDB(db); }
  res.json({ ok: true });
});
app.post('/api/admin/deposits/:id/reject', adminAuth, (req, res) => {
  const db = loadDB(); const d = db.deposits.find(x => x.id === req.params.id); if (d) { d.status = 'rejected'; saveDB(db); }
  res.json({ ok: true });
});
app.post('/api/admin/withdrawals/:id/approve', adminAuth, (req, res) => {
  const db = loadDB(); const w = db.withdrawals.find(x => x.id === req.params.id); if (w) { w.status = 'approved'; saveDB(db); }
  res.json({ ok: true });
});
app.post('/api/admin/withdrawals/:id/reject', adminAuth, (req, res) => {
  const db = loadDB(); const w = db.withdrawals.find(x => x.id === req.params.id); if (w) { w.status = 'rejected'; saveDB(db); }
  res.json({ ok: true });
});
app.post('/api/admin/clients/:id/activate', adminAuth, (req, res) => {
  const db = loadDB(); const c = db.clients.find(x => x.id === req.params.id); if (c) { c.status = 'active'; saveDB(db); }
  res.json({ ok: true });
});
app.post('/api/admin/clients/:id/suspend', adminAuth, (req, res) => {
  const db = loadDB(); const c = db.clients.find(x => x.id === req.params.id); if (c) { c.status = 'suspended'; saveDB(db); }
  res.json({ ok: true });
});
app.post('/api/admin/clients/:id/reset-password', adminAuth, (req, res) => {
  const db = loadDB(); const c = db.clients.find(x => x.id === req.params.id || x.email === req.params.id);
  if (c) { c.password = req.body.newPassword || "JasonBusiness2026"; db.logs.push({ createdAt: new Date().toISOString(), action: 'RESET_PASSWORD', admin: '10092007', details: `Reset ${req.params.id}` }); saveDB(db); }
  res.json({ ok: true });
});
app.post('/api/admin/vip/set', adminAuth, (req, res) => {
  const db = loadDB(); const { clientId, level, durationDays } = req.body;
  if (!db.vip_users[clientId]) db.vip_users[clientId] = { points: 0, history: [] };
  db.vip_users[clientId].tierId = level; db.vip_users[clientId].expiresAt = new Date(Date.now() + (durationDays || 30) * 86400000).toISOString();
  saveDB(db); res.json({ ok: true });
});
app.post('/api/admin/vip/remove', adminAuth, (req, res) => { const db = loadDB(); delete db.vip_users[req.body.clientId]; saveDB(db); res.json({ ok: true }); });
app.post('/api/admin/smm-orders/:id/approve', adminAuth, (req, res) => { const db = loadDB(); const o = db.smm_orders.find(x => x.id === req.params.id); if (o) { o.status = 'completed'; saveDB(db); } res.json({ ok: true }); });
app.post('/api/admin/smm-orders/:id/reject', adminAuth, (req, res) => { const db = loadDB(); const o = db.smm_orders.find(x => x.id === req.params.id); if (o) { o.status = 'rejected'; saveDB(db); } res.json({ ok: true }); });
app.post('/api/admin/api-access/set', adminAuth, (req, res) => {
  const db = loadDB(); const { clientId, service, enabled } = req.body;
  const idx = db.api_access.findIndex(a => a.clientId === clientId && a.service === service);
  if (idx >= 0) db.api_access[idx].enabled = enabled; else db.api_access.push({ clientId, service, enabled });
  saveDB(db); res.json({ ok: true });
});
app.post('/api/admin/api-access/revoke', adminAuth, (req, res) => { const db = loadDB(); db.api_access = db.api_access.filter(a =>!(a.clientId === req.body.clientId && a.service === req.body.service)); saveDB(db); res.json({ ok: true }); });
app.post('/api/admin/prices/set', adminAuth, (req, res) => {
  const db = loadDB(); const { service, amount, currency } = req.body;
  const idx = db.prices.findIndex(p => p.service === service);
  if (idx >= 0) db.prices[idx] = { service, amount: Number(amount), currency: currency || 'FC' }; else db.prices.push({ service, amount: Number(amount), currency: currency || 'FC', category: 'custom' });
  db.logs.push({ createdAt: new Date().toISOString(), action: 'PRICE_SET', admin: '10092007', details: `${service} = ${amount}` });
  saveDB(db); res.json({ ok: true });
});
app.post('/api/admin/prices/delete', adminAuth, (req, res) => { const db = loadDB(); db.prices = db.prices.filter(p => p.service!== req.body.service); saveDB(db); res.json({ ok: true }); });
app.post('/api/admin/deposit-numbers/set', adminAuth, (req, res) => {
  const db = loadDB(); db.depositNumbers.push({ id: Date.now().toString(), operator: req.body.operator, number: req.body.number, name: req.body.name, instructions: req.body.instructions, status: 'active', createdAt: new Date().toISOString() });
  saveDB(db); res.json({ ok: true });
});
app.post('/api/admin/deposit-numbers/delete', adminAuth, (req, res) => { const db = loadDB(); db.depositNumbers = db.depositNumbers.filter(n => n.id!== req.body.id && n.number!== req.body.id); saveDB(db); res.json({ ok: true }); });
app.post('/api/admin/deposits/quick-approve', adminAuth, (req, res) => {
  const db = loadDB(); const { clientId, amount, currency, method } = req.body;
  if (Number(amount) < db.settings.minDeposit) return res.status(400).json({ message: `Min dépôt ${db.settings.minDeposit} FC` });
  db.deposits.push({ id: "DEP-" + Date.now(), clientId, amount: Number(amount), currency: currency || 'FC', method: method || 'Admin Quick', reference: "ADMIN-" + Date.now(), status: 'approved', createdAt: new Date().toISOString() });
  db.logs.push({ createdAt: new Date().toISOString(), action: 'QUICK_DEPOSIT', admin: '10092007', details: `${clientId} +${amount} FC` });
  saveDB(db); res.json({ ok: true });
});
app.post('/api/admin/settings/update', adminAuth, (req, res) => { const db = loadDB(); db.settings = {...db.settings,...req.body }; saveDB(db); res.json({ ok: true, settings: db.settings }); });
app.post('/api/admin/audit/clear', adminAuth, (req, res) => { const db = loadDB(); db.logs = []; saveDB(db); res.json({ ok: true }); });

// --- EXPORT POUR VERCEL ---
const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`✅ JASON BUSINESS API port ${PORT} - Admin 10092007 - Min 2000 FC - data/database.json`));
}
module.exports = app;
