const express = require("express");
const router = express.Router();
const { cadastrarFuncionario, verificarFuncionario,listarUsuarios } = require("../controllers/funcionariosController");

router.post("/cadastro", cadastrarFuncionario);
router.post("/verificar", verificarFuncionario);
router.get("/usuarios", listarUsuarios);

module.exports = router;
