const pool = require("../models/db");

exports.login = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "O campo email é obrigatório." });
  }

  let connection;
  try {
    connection = await pool.getConnection();

    const [results] = await connection.execute(
      "SELECT email, nome, perfil, cargo, sobre, carreira, objetivo FROM funcionarios WHERE email = ?",
      [email]
    );

    if (results.length === 0) {
      return res.status(401).json({ error: "Usuário não encontrado." });
    }

    res.status(200).json(results[0]);
  } catch (error) {
    console.error("Erro na consulta de login:", error);
    res.status(500).json({ error: "Erro interno no servidor." });
  } finally {
    if (connection) connection.release();
  }
};
