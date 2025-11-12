const pool = require("../models/db");

// Listar todos os eventos
const getEventos = async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM eventos ORDER BY dia ASC");
    res.status(200).json(rows);
  } catch (error) {
    console.error("Erro ao buscar eventos:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

// Criar um novo evento
const createEvento = async (req, res) => {
  const { titulo, localidade, dia, img, descricao } = req.body;

  if (!titulo || !localidade || !dia) {
    return res.status(400).json({ error: "Campos obrigatórios faltando: titulo, localidade, dia." });
  }

  try {
    const [result] = await pool.execute(
      "INSERT INTO eventos (titulo, localidade, dia, img, descricao) VALUES (?, ?, ?, ?, ?)",
      [titulo, localidade, dia, img, descricao]
    );
    res.status(201).json({
      id: result.insertId,
      titulo,
      localidade,
      dia,
      img,
      descricao
    });
  } catch (error) {
    console.error("Erro ao criar evento:", error);
    res.status(500).json({ error: "Erro ao criar evento." });
  }
};

// Deletar um evento pelo ID
const deleteEvento = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "ID do evento é obrigatório." });
  }

  try {
    const [result] = await pool.execute("DELETE FROM eventos WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Evento não encontrado." });
    }

    res.status(200).json({ message: "Evento excluído com sucesso." });
  } catch (error) {
    console.error("Erro ao deletar evento:", error);
    res.status(500).json({ error: "Erro ao deletar evento." });
  }
};

module.exports = {
  getEventos,
  createEvento,
  deleteEvento
};