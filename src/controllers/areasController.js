const pool = require("../models/db");

exports.getAreas = async (req, res) => {
  const { email } = req.params;
  if (!email)
    return res.status(400).json({ error: "O campo email é obrigatório." });

  try {
    await pool.getConnection();

    const [areasResults] = await pool.execute(
      "SELECT descricao FROM areas_interesse WHERE email = ?",
      [email]
    );

    res.status(200).json({
      areas: areasResults.map((s) => s.descricao),
    });
  } catch (error) {
    console.error("Erro ao obter áreas de interesse:", error);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
};


exports.saveAreas = async (req, res) => {
  const { email, areas = [] } = req.body;
  if (!email) return res.status(400).json({ error: "O campo email é obrigatório." });

  try {
    await pool.execute("DELETE FROM areas_interesse WHERE email = ?", [email]);

    if (areas.length > 0) {
      const hardValues = areas.flatMap((d) => [email, d]);
      const placeholders = areas.map(() => "(?, ?)").join(", ");
      await pool.execute(`INSERT INTO areas_interesse (email, descricao) VALUES ${placeholders}`, hardValues);
    }


    res.status(201).json({ message: "Áreas de interesse atualizadas com sucesso." });
  } catch (error) {
    console.error("Erro ao salvar Áreas de interesse:", error);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
};
