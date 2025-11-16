const functions = require("firebase-functions");
const express = require("express");
const app = express();
const corsMiddleware = require("./src/middlewares/corsMiddleware");


// Middlewares globais
app.use(express.json());
app.use(corsMiddleware);

// Rotas
app.use(require("./src/routes/authRoutes"));
app.use(require("./src/routes/funcionariosRoutes"));
app.use(require("./src/routes/skillsRoutes"));
app.use(require("./src/routes/areasRoutes"))
app.use(require("./src/routes/eventosRoutes"))
app.use(require("./src/routes/postsRoutes"))


// Exporta para Firebase Functions
exports.app = functions.https.onRequest(app);


