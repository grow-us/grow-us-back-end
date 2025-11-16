const pool = require("../models/db");

exports.cadastrarFuncionario = async (req, res) => {
  const { email, nome, perfil, cargo } = req.body;

  if (!email || !nome || !perfil || !cargo) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios." });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    await connection.execute(
      "INSERT INTO funcionarios (email, nome, perfil, cargo) VALUES (?, ?, ?, ?)",
      [email, nome, perfil, cargo]
    );

    await connection.commit();

    res.status(201).json({ message: "Funcionário cadastrado com sucesso!" });
  } catch (error) {
    if (connection) await connection.rollback();

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Já existe um funcionário com este email." });
    }

    console.error("Erro ao cadastrar funcionário:", error);
    res.status(500).json({ error: "Erro interno ao cadastrar funcionário." });
  } finally {
    if (connection) connection.release();
  }
};

exports.verificarFuncionario = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "O campo email é obrigatório." });
  }

  let connection;
  try {
    connection = await pool.getConnection();

    const [rows] = await connection.execute(
      "SELECT email, nome, perfil, cargo, sobre, carreira, objetivo FROM funcionarios WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.sendStatus(403); // funcionário não encontrado
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Erro ao verificar funcionário:", error);
    res.status(500).json({ error: "Erro interno ao verificar funcionário." });
  } finally {
    if (connection) connection.release();
  }
};
