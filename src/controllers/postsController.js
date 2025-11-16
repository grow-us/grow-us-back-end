const pool = require("../models/db");

// 🔥 Função para formatar a data do jeito que você quer
function formatarDataBR(date = new Date()) {
    const dia = date.getDate().toString().padStart(2, "0");
    const mes = date.toLocaleString("pt-BR", { month: "long" });
    const ano = date.getFullYear();
    const hora = date.getHours().toString().padStart(2, "0");
    const minuto = date.getMinutes().toString().padStart(2, "0");

    return `${dia} de ${mes} de ${ano} às ${hora}:${minuto}`;
}

/**
 * Adiciona um novo post
 */
const addPost = async (req, res) => {
    let { img, descricao, perfil, nome } = req.body;

    // Gerar createdAt no backend já formatado
    const createdAt = formatarDataBR();

    // Validação
    if (!descricao || !perfil || !nome) {
        return res.status(400).json({
            error: "Descrição, perfil e nome são obrigatórios para criar um post."
        });
    }

    // SQL CORRIGIDO: ORDEM DOS CAMPOS IGUAL À ORDEM DOS VALUES
    const query = `
        INSERT INTO posts (img, descricao, perfil, nome, createdAt, curtidas)
        VALUES (?, ?, ?, ?, ?, 0)
    `;

    // ORDEM DOS VALUES CORRIGIDA
    const values = [img || '', descricao, perfil, nome, createdAt];

    try {
        const [result] = await pool.query(query, values);

        res.status(201).json({
            message: "Post criado com sucesso!",
            postId: result.insertId,
            postData: {
                img: img || '',
                descricao,
                perfil,
                nome,
                createdAt,
                curtidas: 0
            }
        });

    } catch (error) {
        console.error("Erro ao adicionar post:", error);
        res.status(500).json({
            error: "Erro interno do servidor ao processar o post."
        });
    }
};

const addLike = async (req, res) => {
    const { id } = req.params; // id do post
    const { email } = req.body; // vem do frontend

    if (!email) {
        return res.status(400).json({
            error: "O e-mail do usuário é obrigatório para curtir."
        });
    }

    try {
        // 1️⃣ Verificar se esse usuário já curtiu esse post
        const [existingLike] = await pool.query(
            "SELECT id FROM post_likes WHERE email = ? AND postId = ?",
            [email, id]
        );

        if (existingLike.length > 0) {
            return res.status(400).json({
                message: "Usuário já curtiu este post."
            });
        }

        // 2️⃣ Registrar o like
        await pool.query(
            "INSERT INTO post_likes (email, postId) VALUES (?, ?)",
            [email, id]
        );

        // 3️⃣ Incrementar curtidas na tabela posts
        await pool.query(
            "UPDATE posts SET curtidas = curtidas + 1 WHERE id = ?",
            [id]
        );

        res.status(200).json({
            message: "Curtida adicionada com sucesso!"
        });

    } catch (error) {
        console.error("Erro ao adicionar curtida:", error);
        res.status(500).json({
            error: "Erro interno do servidor ao processar a curtida."
        });
    }
};


const getPosts = async (req, res) => {
    const query = `
        SELECT id, img, descricao, createdAt, curtidas, perfil, nome 
        FROM posts
        ORDER BY id DESC
    `;

    try {
        const [posts] = await pool.query(query);
        res.status(200).json(posts);

    } catch (error) {
        console.error("Erro ao obter posts:", error);
        res.status(500).json({
            error: "Erro interno do servidor ao buscar os posts."
        });
    }
};

module.exports = {
    addPost,
    addLike,
    getPosts,
};
