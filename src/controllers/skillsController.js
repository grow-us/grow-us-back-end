const pool = require("../models/db");

exports.getSkills = async (req, res) => {
  const { email } = req.params;
  if (!email) return res.status(400).json({ error: "O campo email é obrigatório." });

  try {
    await pool.getConnection();

    const [hardResults] = await pool.execute(
      "SELECT descricao FROM hard_skills WHERE email = ?",
      [email]
    );
    const [softResults] = await pool.execute(
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
  }
};

exports.saveSkills = async (req, res) => {
  const { email, hardSkills = [], softSkills = [] } = req.body;
  if (!email) return res.status(400).json({ error: "O campo email é obrigatório." });

  try {
    await pool.execute("DELETE FROM hard_skills WHERE email = ?", [email]);
    await pool.execute("DELETE FROM soft_skills WHERE email = ?", [email]);

    if (hardSkills.length > 0) {
      const hardValues = hardSkills.flatMap((d) => [email, d]);
      const placeholders = hardSkills.map(() => "(?, ?)").join(", ");
      await pool.execute(`INSERT INTO hard_skills (email, descricao) VALUES ${placeholders}`, hardValues);
    }

    if (softSkills.length > 0) {
      const softValues = softSkills.flatMap((d) => [email, d]);
      const placeholders = softSkills.map(() => "(?, ?)").join(", ");
      await pool.execute(`INSERT INTO soft_skills (email, descricao) VALUES ${placeholders}`, softValues);
    }

    res.status(201).json({ message: "Skills atualizadas com sucesso." });
  } catch (error) {
    console.error("Erro ao salvar skills:", error);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
};
