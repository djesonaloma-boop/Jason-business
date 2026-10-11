const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, '../data/database.json');

function getDB() {
  if (!fs.existsSync(DB_PATH)) {
    return { users: [], depots: [], retraits: [], config: { mpesa: "0847500590", orangeMoney: "0890000000", minDepot: 2000, prixVip: { vip1: 5000, vip2: 15000, vip3: 30000 } } };
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}
function saveDB(db) { fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2)); }

// HEALTH CHECK - pour tester si API marche
app.get('/api/health', (req, res) => {
  res.json({ status: "ok", minDeposit: 2000, mpesa: "0847500590", message: "Jason Business API OK" });
});

// LOGIN
app.post('/api/login', (req, res) => {
  const db = getDB();
  const user = db.users.find(u => u.telephone === req.body.telephone);
  if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
  res.json(user);
});

// DEPOT
app.post('/api/depot', (req, res) => {
  const { telephone, montant, preuve } = req.body;
  if (montant < 2000) return res.status(400).json({ error: "Dépôt minimum 2000 FC" });
  const db = getDB();
  db.depots.push({ id: Date.now(), telephone, montant, preuve, statut: "en_attente", date: new Date() });
  saveDB(db);
  res.json({ success: true, message: "Dépôt envoyé, en attente de confirmation Admin" });
});

// RETRAIT
app.post('/api/retrait', (req, res) => {
  const { telephone, montant } = req.body;
  if (montant < 2000) return res.status(400).json({ error: "Retrait minimum 2000 FC" });
  const db = getDB();
  const user = db.users.find(u => u.telephone === telephone);
  if (!user || user.solde < montant) return res.status(400).json({ error: "Solde insuffisant" });
  db.retraits.push({ id: Date.now(), telephone, montant, statut: "en_attente", date: new Date() });
  saveDB(db);
  res.json({ success: true });
});

// ADMIN - liste depots
app.get('/api/admin/depots', (req, res) => {
  const db = getDB();
  res.json(db.depots);
});

// ADMIN - confirmer depot
app.post('/api/admin/confirmer-depot', (req, res) => {
  const db = getDB();
  const depot = db.depots.find(d => d.id == req.body.id);
  if (!depot) return res.status(404).json({ error: "Depot non trouvé" });
  depot.statut = "confirme";
  const user = db.users.find(u => u.telephone === depot.telephone);
  if (user) user.solde = (user.solde || 0) + depot.montant;
  saveDB(db);
  res.json({ success: true });
});

module.exports = app;
