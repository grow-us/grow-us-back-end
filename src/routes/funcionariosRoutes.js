const express = require("express");
const router = express.Router();
const { cadastrarFuncionario, verificarFuncionario } = require("../controllers/funcionariosController");

router.post("/cadastro", cadastrarFuncionario);
router.post("/cadastrar", verificarFuncionario);

module.exports = router;
