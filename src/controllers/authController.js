const pool = require("../models/db");

exports.login = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "O campo email é obrigatório." });
  }

  let connection;
  try {
    connection = await pool.getConnection();

    // Buscar dados do funcionário
    const [userResults] = await connection.execute(
      "SELECT email, nome, perfil, cargo, sobre, carreira, objetivos FROM funcionarios WHERE email = ?",
      [email]
    );

    if (userResults.length === 0) {
      return res.status(401).json({ error: "Usuário não encontrado." });
    }

    const user = userResults[0];

    // Buscar hard skills
    const [hardResults] = await connection.execute(
      "SELECT descricao FROM hard_skills WHERE email = ?",
      [email]
    );

    // Buscar soft skills
    const [softResults] = await connection.execute(
      "SELECT descricao FROM soft_skills WHERE email = ?",
      [email]
    );

    // Montar resposta com dados do usuário + skills
    const response = {
      ...user,
      hardSkills: hardResults.map((s) => s.descricao),
      softSkills: softResults.map((s) => s.descricao),
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Erro na consulta de login:", error);
    res.status(500).json({ error: "Erro interno no servidor." });
  } finally {
    if (connection) connection.release();
  }
};
