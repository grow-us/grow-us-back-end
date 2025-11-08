const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise"); // ✅ usa versão com suporte a promises
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
}); 
// Criação da conexão com o banco
const dbConfig = {
  host: 'riseup-riseup.e.aivencloud.com',
  user: 'avnadmin',
  port: '11832',
  password: 'AVNS_lFnOOTe5ISkyFePS5Og',
  database: 'defaultdb',
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync('./ca.pem'),
  },
};

// 🔄 cria pool de conexões (recomendado)
const pool = mysql.createPool(dbConfig);

app.post("/login", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'O campo email é obrigatório.' });
  }

  const query = 'SELECT email, nome, perfil, cargo FROM funcionarios WHERE email = ?';

  try {
    const [results] = await pool.execute(query, [email]);

    if (results.length === 0) {
      return res.status(401).json({ error: 'Usuário não encontrado.' });
    }

    res.status(200).json(results[0]);

  } catch (error) {
    console.error('Erro na consulta de login ou skills:', error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

// cadastrar funcionario fora da plataforma
app.post('/cadastro', async (req, res) => {
  const { email, nome, perfil, cargo } = req.body;

  if (!email || !nome || !perfil || !cargo) {
    return res.status(400).json({ error: 'Todos os campos (email, nome, perfil, cargo) são obrigatórios.' });
  }

  const query = 'INSERT INTO funcionarios (email, nome, perfil, cargo) VALUES (?, ?, ?, ?)';

  try {
    await pool.execute(query, [email, nome, perfil, cargo]);
    res.status(201).json({ message: 'Funcionário cadastrado com sucesso!' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Já existe um funcionário cadastrado com este email.' });
    }
    console.error('Erro ao cadastrar funcionário:', error);
    res.status(500).json({ error: 'Erro interno ao cadastrar funcionário.' });
  }
});

// rota para verificar se o funcionario existe
app.post('/cadastrar', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'O campo email é obrigatório.' });
  }

  const query = 'SELECT * FROM funcionarios WHERE email = ?';

  try {
    const [rows] = await pool.execute(query, [email]);

    if (rows.length === 0) {
      return res.sendStatus(403);
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Erro ao verificar funcionário:', error);
    res.status(500).json({ error: 'Erro interno ao verificar funcionário.' });
  }
});

app.get("/skills/:email", async (req, res) => {
  const { email } = req.params;

  if (!email) {
    return res.status(400).json({ error: 'O campo email é obrigatório.' });
  }

  try {
    // Teste de conexão
    await pool.getConnection();

    // Consulta para hard_skills
    const [hardResults] = await pool.execute('SELECT descricao FROM hard_skills WHERE email = ?', [email]);
    const hardSkills = hardResults.length > 0 ? hardResults.map(skill => skill.descricao) : [];

    // Consulta para soft_skills
    const [softResults] = await pool.execute('SELECT descricao FROM soft_skills WHERE email = ?', [email]);
    const softSkills = softResults.length > 0 ? softResults.map(skill => skill.descricao) : [];

    res.status(200).json({
      hardSkills,
      softSkills
    });

  } catch (error) {
    console.error('Erro na consulta de todas as skills:', error);
    if (error.code === 'ETIMEDOUT') {
      return res.status(504).json({ error: 'Tempo limite excedido ao conectar ao banco de dados.' });
    }
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

app.post("/skills", async (req, res) => {
  const { email, hardSkills = [], softSkills = [] } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'O campo email é obrigatório.' });
  }

  if (!Array.isArray(hardSkills) || !Array.isArray(softSkills)) {
    return res.status(400).json({ error: 'hardSkills e softSkills devem ser arrays.' });
  }

  try {
    // Deletar todas as hard_skills anteriores para o email
    await pool.execute('DELETE FROM hard_skills WHERE email = ?', [email]);

    // Deletar todas as soft_skills anteriores para o email
    await pool.execute('DELETE FROM soft_skills WHERE email = ?', [email]);

    // Inserir novas hard skills
    if (hardSkills.length > 0) {
      const hardQueries = hardSkills.map(descricao => [email, descricao]);
      const placeholders = hardQueries.map(() => '(?, ?)').join(', ');
      const query = `INSERT INTO hard_skills (email, descricao) VALUES ${placeholders}`;
      await pool.execute(query, hardQueries.flat());
    }

    // Inserir novas soft skills
    if (softSkills.length > 0) {
      const softQueries = softSkills.map(descricao => [email, descricao]);
      const placeholders = softQueries.map(() => '(?, ?)').join(', ');
      const query = `INSERT INTO soft_skills (email, descricao) VALUES ${placeholders}`;
      await pool.execute(query, softQueries.flat());
    }

    res.status(201).json({ message: 'Skills atualizadas com sucesso.' });

  } catch (error) {
    console.error('Erro ao atualizar skills:', error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});




app.listen(3000,()=>{});





// Para usar no Firebase Functions (opcional)
exports.app = functions.https.onRequest(app);
