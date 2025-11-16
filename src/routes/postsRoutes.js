const express = require("express");
const router = express.Router();
const { addPost, addLike, getPosts } = require('../controllers/postsController');


// ROTA 1: POST /posts/
// Adiciona um novo post. Espera { titulo, img, descricao } no corpo da requisição.
router.post('/posts', addPost);

// ---------------------------------------------------------------------

// ROTA 2: PATCH /posts/like/:id
// Adiciona uma curtida a um post específico, usando o ID na URL.
router.patch('/posts/:id', addLike);

// 🔑 ROTA 3: GET /posts/ (Obter Todos os Posts)
router.get('/posts', getPosts); // Esta rota responderá a GET /api/posts/

// ---------------------------------------------------------------------

module.exports = router;
