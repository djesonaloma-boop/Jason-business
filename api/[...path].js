
/**
 * JASON BUSINESS — ROUTES API VERCEL
 * Fichier : api/[...path].js
 */

const app = require("../backend/app");

module.exports = (req, res) => {
    return app(req, res);
};
