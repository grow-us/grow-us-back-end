const pool = require("../models/db");

exports.getAreas = async (req, res) => {
  const { email } = req.params;

  if (!email) {
    return res.status(400).json({ error: "O campo email é obrigatório." });
  }

  let connection;
  try {
    connection = await pool.getConnection();

    const [areasResults] = await connection.execute(
      "SELECT descricao FROM areas_interesse WHERE email = ?",
      [email]
    );

    res.status(200).json({
      areas: areasResults.map((s) => s.descricao),
    });
  } catch (error) {
    console.error("Erro ao obter áreas de interesse:", error);
    res.status(500).json({ error: "Erro interno no servidor." });
  } finally {
    if (connection) connection.release();
  }
};

exports.saveAreas = async (req, res) => {
  const { email, areas = [] } = req.body;

  if (!email) {
    return res.status(400).json({ error: "O campo email é obrigatório." });
  }

  let connection;
  try {
    connection = await pool.getConnection();

    await connection.beginTransaction();

    await connection.execute("DELETE FROM areas_interesse WHERE email = ?", [email]);

    if (areas.length > 0) {
      const values = areas.flatMap((descricao) => [email, descricao]);
      const placeholders = areas.map(() => "(?, ?)").join(", ");
      await connection.execute(
        `INSERT INTO areas_interesse (email, descricao) VALUES ${placeholders}`,
        values
      );
    }

    await connection.commit();
    res.status(201).json({ message: "Áreas de interesse atualizadas com sucesso." });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Erro ao salvar áreas de interesse:", error);
    res.status(500).json({ error: "Erro interno no servidor." });
  } finally {
    if (connection) connection.release();
  }
};
