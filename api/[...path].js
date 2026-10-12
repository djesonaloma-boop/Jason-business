// Fonction serverless Vercel : routes /api/*
const app = require("../backend/app");
module.exports = (req, res) => app(req, res);
