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

// NOVA FUNÇÃO PARA LISTAR USUÁRIOS E STATUS DE "SEGUINDO"
exports.listarUsuarios = async (req, res) => {
 // 1. Pegar o email do usuário logado (quem está fazendo a requisição)
 // Em um app real, isso viria de req.user.email (após middleware auth)
 // Aqui, vamos pegar da query string: /usuarios?emailLogado=user@email.com
 const { email } = req.query;
 if (!email) {
 return res.status(400).json({ error: "O email do usuário logado (email) é obrigatório na query." });
 }

 let connection;
try {
 connection = await pool.getConnection();

 // 2. Query SQL com LEFT JOIN
 // f = tabela funcionarios (todos os usuários)
 // s = tabela seguindo (apenas as relações do usuário logado)
 const query = `
SELECT
f.email,
f.nome,
f.perfil,
f.cargo,
-- Se s.id não for NULO, significa que o usuário logado (s.email)
-- segue o funcionário (f.email = s.seguindo).
-- (CASE WHEN s.id IS NOT NULL THEN TRUE ELSE FALSE END) AS estouSeguindo
(s.id IS NOT NULL) AS estouSeguindo
FROM
 funcionarios AS f
 LEFT JOIN
 -- Juntamos 'seguindo' ONDE o usuário logado (s.email)
-- está seguindo o funcionário da lista (s.seguindo = f.email)
 seguindo AS s ON f.email = s.seguindo AND s.email = ?
`;

 // 3. Executar a query
// O [emailLogado] substitui o '?' na query
const [rows] = await connection.execute(query, [email]);

    // O MySQL retorna 1 para TRUE e 0 para FALSE. Vamos converter para boolean.
    const usuarios = rows.map(user => ({
      ...user,
      estouSeguindo: Boolean(user.estouSeguindo)
    }));

// 4. Retornar a lista
res.status(200).json(usuarios);

} catch (error) {
console.error("Erro ao listar usuários:", error);
 res.status(500).json({ error: "Erro interno ao listar usuários." });
} finally {
if (connection) connection.release();
}
};