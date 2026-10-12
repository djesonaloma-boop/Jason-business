// Lanceur local. Sur Vercel, api/[...path].js expose directement l'application.
const app = require("./app");
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Jason backend disponible sur le port ${PORT}`));
