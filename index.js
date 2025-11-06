
import sql from 'mysql2';
import functions from 'firebase-functions';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());


const db = sql.createConnection({
  host: 'localhost',
  user: 'jvxtor',
    password: 'Jvdark0@',
    database: 'grow_us'
});




app.get('/user', (req, res) => {

  console.log('Recebida uma requisição GET /user');
  
    db.query('SELECT * FROM usuarios', (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(results);
    });

});





// iniciando o servidor na porta 3000
app.listen(3000,() => {
  console.log(`Servidor rodando na porta 3000`);
});





// exportando o app como uma função do Firebase


//exports.app = functions.https.onRequest(app);