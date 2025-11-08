const pool = require("../models/db");

exports.cadastrarFuncionario = async (req, res) => {
  const { email, nome, perfil, cargo } = req.body;
  if (!email || !nome || !perfil || !cargo)
    return res.status(400).json({ error: "Todos os campos são obrigatórios." });

  try {
    await pool.execute(
      "INSERT INTO funcionarios (email, nome, perfil, cargo) VALUES (?, ?, ?, ?)",
      [email, nome, perfil, cargo]
    );
    res.status(201).json({ message: "Funcionário cadastrado com sucesso!" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Já existe um funcionário com este email." });
    }
    console.error("Erro ao cadastrar funcionário:", error);
    res.status(500).json({ error: "Erro interno ao cadastrar funcionário." });
  }
};

exports.verificarFuncionario = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "O campo email é obrigatório." });

  try {
    const [rows] = await pool.execute("SELECT * FROM funcionarios WHERE email = ?", [email]);
    if (rows.length === 0) return res.sendStatus(403);
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Erro ao verificar funcionário:", error);
    res.status(500).json({ error: "Erro interno ao verificar funcionário." });
  }
};
