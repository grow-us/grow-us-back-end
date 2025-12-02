const pool = require("../models/db");

/* ============================================================
   EVENTOS - LISTAR TODOS
============================================================ */
const getEventos = async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM eventos ORDER BY dia ASC");
    res.status(200).json(rows);
  } catch (error) {
    console.error("Erro ao buscar eventos:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

/* ============================================================
   EVENTOS - CRIAR NOVO
============================================================ */
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

/* ============================================================
   EVENTOS - DELETAR POR ID
============================================================ */
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

/* ============================================================
   EVENTOS - INSCREVER USUÁRIO
============================================================ */
const inscrever = async (req, res) => {
  try {
    const { email, idEvento } = req.body;

    if (!email || !idEvento) {
      return res.status(400).json({ error: "email e idEvento são obrigatórios" });
    }

    // Verificar se já está inscrito
    const [jaInscrito] = await pool.query(
      "SELECT * FROM inscricoes_eventos WHERE email_funcionario = ? AND id_evento = ?",
      [email, idEvento]
    );

    if (jaInscrito.length > 0) {
      return res.status(400).json({ error: "Usuário já está inscrito neste evento." });
    }

    // Inserir inscrição
    await pool.query(
      "INSERT INTO inscricoes_eventos (email_funcionario, id_evento) VALUES (?, ?)",
      [email, idEvento]
    );

    // ➕ ADICIONAR 1 EMBLEMA GENÉRICO DE PARTICIPAÇÃO
    await pool.query(
      "INSERT INTO emblemas (titulo, email, img, descricao) VALUES (?, ?, ?, ?)",
      [
        "Participação",
        email,
        "https://api-assets.clashroyale.com/playerbadges/512/3TeHoCb_VUTGDRtC3j5H-wn6e_ROJ1rhOe5w-fZzqIM.png",
        "Participação em evento"
      ]
    );

    // Contar quantos eventos o usuário já participou (para emblemas de conquista)
    const [participacoes] = await pool.query(
      "SELECT COUNT(*) AS total FROM inscricoes_eventos WHERE email_funcionario = ?",
      [email]
    );
    const total = participacoes[0].total;

    // Emblemas de conquista (1, 3, 5, 10)
    const emblemasConquista = [
      {
        qtd: 1,
        titulo: "Primeiro Evento!",
        img: "https://firebasestorage.googleapis.com/v0/b/grow-us-1.firebasestorage.app/o/1.png?alt=media&token=8cf880f1-5807-4372-9f94-78a812af4634",
        descricao: "Participou do primeiro evento."
      },
      {
        qtd: 3,
        titulo: "Participante Ativo",
        img: "https://firebasestorage.googleapis.com/v0/b/grow-us-1.firebasestorage.app/o/3.png?alt=media&token=83fc8eed-4b49-44ce-92c0-aa4731433432",
        descricao: "Já participou de 3 eventos."
      },
      {
        qtd: 5,
        titulo: "Colaborador Engajado",
        img: "https://firebasestorage.googleapis.com/v0/b/grow-us-1.firebasestorage.app/o/5.png?alt=media&token=3cb73f93-f1d6-4fc6-ad37-21447a4b2522",
        descricao: "Participou de 5 eventos diferentes."
      },
      {
        qtd: 10,
        titulo: "Veterano de Eventos",
        img: "https://firebasestorage.googleapis.com/v0/b/grow-us-1.firebasestorage.app/o/10.png?alt=media&token=c326e453-36a6-48cf-a519-9b8bc508dd8e",
        descricao: "Um dos grandes participantes da comunidade."
      }
    ];

    const emblemaAtingido = emblemasConquista.find(e => e.qtd === total);

    if (emblemaAtingido) {
      const [jaTem] = await pool.query(
        "SELECT * FROM emblemas WHERE email = ? AND titulo = ?",
        [email, emblemaAtingido.titulo]
      );

      if (jaTem.length === 0) {
        await pool.query(
          "INSERT INTO emblemas (titulo, email, img, descricao) VALUES (?, ?, ?, ?)",
          [
            emblemaAtingido.titulo,
            email,
            emblemaAtingido.img.trim(),
            emblemaAtingido.descricao
          ]
        );
      }
    }

    return res.status(200).json({
      message: "Inscrição realizada com sucesso!",
      totalEventos: total,
      emblemaAtribuido: emblemaAtingido ? emblemaAtingido.titulo : null
    });

  } catch (error) {
    console.error("Erro ao inscrever:", error);
    res.status(500).json({ error: "Erro ao inscrever no evento." });
  }
};

/* ============================================================
   EVENTOS - LISTAR INSCRIÇÕES DO USUÁRIO
============================================================ */
const listarInscricoes = async (req, res) => {
  try {
    const { email } = req.params;

    const [result] = await pool.query(
      `SELECT e.id, e.titulo, e.localidade, e.dia, e.img, e.descricao
       FROM inscricoes_eventos ie
       JOIN eventos e ON e.id = ie.id_evento
       WHERE ie.email_funcionario = ?`,
      [email]
    );

    res.status(200).json(result);
  } catch (error) {
    console.error("Erro ao listar inscrições:", error);
    res.status(500).json({ error: "Erro interno ao listar inscrições." });
  }
};

/* ============================================================
   EVENTOS - CANCELAR INSCRIÇÃO
============================================================ */
const cancelarInscricao = async (req, res) => {
  try {
    const { idEvento } = req.body;
    const { email } = req.params;

    if (!email || !idEvento) {
      return res.status(400).json({ error: "email e idEvento são obrigatórios." });
    }

    const id = Number(String(idEvento).trim());
    if (isNaN(id) || !Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "idEvento deve ser um número inteiro positivo." });
    }

    // Verificar se a inscrição existe
    const [inscricaoExistente] = await pool.query(
      "SELECT 1 FROM inscricoes_eventos WHERE email_funcionario = ? AND id_evento = ?",
      [email, id]
    );

    if (inscricaoExistente.length === 0) {
      return res.status(404).json({ error: "Inscrição não encontrada." });
    }

    // Deletar a inscrição
    await pool.query(
      "DELETE FROM inscricoes_eventos WHERE email_funcionario = ? AND id_evento = ?",
      [email, id]
    );

    // ➖ REMOVER 1 EMBLEMA DE PARTICIPAÇÃO (o mais antigo, por segurança)
    await pool.query(
      "DELETE FROM emblemas WHERE email = ? AND titulo = 'Participação' LIMIT 1",
      [email]
    );

    // Contar novo total para emblemas de conquista
    const [novaContagem] = await pool.query(
      "SELECT COUNT(*) AS total FROM inscricoes_eventos WHERE email_funcionario = ?",
      [email]
    );
    const novoTotal = novaContagem[0].total;

    // Remover emblemas de conquista não mais merecidos
    const niveisEmblemas = [1, 3, 5, 10];
    const niveisPerdidos = niveisEmblemas.filter(qtd => qtd > novoTotal);
    const tituloPorNivel = {
      1: "Primeiro Evento!",
      3: "Participante Ativo",
      5: "Colaborador Engajado",
      10: "Veterano de Eventos"
    };

    for (const nivel of niveisPerdidos) {
      const titulo = tituloPorNivel[nivel];
      await pool.query(
        "DELETE FROM emblemas WHERE email = ? AND titulo = ?",
        [email, titulo]
      );
    }

    res.status(200).json({ 
      message: "Inscrição cancelada com sucesso.",
      novoTotalInscricoes: novoTotal,
      emblemasRemovidos: niveisPerdidos.map(n => tituloPorNivel[n]).filter(Boolean)
    });

  } catch (error) {
    console.error("Erro ao cancelar inscrição:", error.message);
    res.status(500).json({ error: "Erro interno ao cancelar inscrição." });
  }
};
/* ============================================================
   EMBLEMAS - LISTAR POR USUÁRIO
============================================================ */
const listarEmblemas = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ error: "Email é obrigatório." });
    }

    const [result] = await pool.query("SELECT * FROM emblemas WHERE email = ?", [email]);
    res.status(200).json(result);
  } catch (error) {
    console.error("Erro ao listar emblemas:", error);
    res.status(500).json({ error: "Erro ao listar emblemas." });
  }
};

/* ============================================================
   EXPORTAR CONTROLLER
============================================================ */
module.exports = {
  getEventos,
  createEvento,
  deleteEvento,
  inscrever,
  listarInscricoes,
  cancelarInscricao,
  listarEmblemas
};
