const express = require("express");
const router = express.Router();

const {
  getEventos,
  createEvento,
  deleteEvento,
  inscrever,
  listarInscricoes,
  cancelarInscricao,
  listarEmblemas
} = require("../controllers/eventosController");

// ---------------------------
// ROTAS ANTIGAS
// ---------------------------

// Listar todos os eventos
router.get("/eventos", getEventos);

// Criar evento
router.post("/eventos", createEvento);

// Deletar evento
router.delete("/eventos/:id", deleteEvento);

// ---------------------------
// NOVAS ROTAS DE INSCRIÇÃO
// ---------------------------

// Inscrever usuário em evento
router.post("/eventos/inscrever", inscrever);

// Listar eventos em que o usuário está inscrito
router.get("/eventos/inscricoes/:email", listarInscricoes);

// Cancelar inscrição de evento
router.delete("/eventos/inscricoes/:email", cancelarInscricao);

// ---------------------------
// ROTAS DE EMBLEMAS
// ---------------------------

// Listar emblemas do usuário
router.get("/emblemas/:email", listarEmblemas);

module.exports = router;
