const pool = require("../models/db");

exports.getSkills = async (req, res) => {
  const { email } = req.params;

  if (!email) {
    return res.status(400).json({ error: "O campo email é obrigatório." });
  }

  let connection;
  try {
    connection = await pool.getConnection();

    const [hardResults] = await connection.execute(
      "SELECT descricao FROM hard_skills WHERE email = ?",
      [email]
    );
    const [softResults] = await connection.execute(
      "SELECT descricao FROM soft_skills WHERE email = ?",
      [email]
    );

    res.status(200).json({
      hardSkills: hardResults.map((s) => s.descricao),
      softSkills: softResults.map((s) => s.descricao),
    });
  } catch (error) {
    console.error("Erro ao obter skills:", error);
    res.status(500).json({ error: "Erro interno no servidor." });
  } finally {
    if (connection) connection.release();
  }
};

exports.saveSkills = async (req, res) => {
  const { email, hardSkills = [], softSkills = [] } = req.body;

  if (!email) {
    return res.status(400).json({ error: "O campo email é obrigatório." });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    await connection.execute("DELETE FROM hard_skills WHERE email = ?", [email]);
    await connection.execute("DELETE FROM soft_skills WHERE email = ?", [email]);

    if (hardSkills.length > 0) {
      const hardValues = hardSkills.flatMap((d) => [email, d]);
      const hardPlaceholders = hardSkills.map(() => "(?, ?)").join(", ");
      await connection.execute(
        `INSERT INTO hard_skills (email, descricao) VALUES ${hardPlaceholders}`,
        hardValues
      );
    }

    if (softSkills.length > 0) {
      const softValues = softSkills.flatMap((d) => [email, d]);
      const softPlaceholders = softSkills.map(() => "(?, ?)").join(", ");
      await connection.execute(
        `INSERT INTO soft_skills (email, descricao) VALUES ${softPlaceholders}`,
        softValues
      );
    }

    await connection.commit();
    res.status(201).json({ message: "Skills atualizadas com sucesso." });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Erro ao salvar skills:", error);
    res.status(500).json({ error: "Erro interno no servidor." });
  } finally {
    if (connection) connection.release();
  }
};
