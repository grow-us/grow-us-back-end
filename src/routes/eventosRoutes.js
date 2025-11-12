const express = require("express");
const router = express.Router();
const {
  getEventos,
  createEvento,
  deleteEvento
} = require("../controllers/eventosController"); 

// Rota para listar todos os eventos
router.get("/eventos", getEventos);

// Rota para criar um novo evento
router.post("/eventos", createEvento);

// Rota para deletar um evento pelo ID
router.delete("/eventos/:id", deleteEvento);

module.exports = router;