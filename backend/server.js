const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

// Middleware que remove o prefixo do subdomínio injetado pelo cPanel
app.use((req, res, next) => {
  if (req.url.startsWith('/api.projetogestaoong.ifhost.gru.br')) {
    req.url = req.url.replace('/api.projetogestaoong.ifhost.gru.br', '') || '/';
  }
  next();
});

const db = mysql.createPool({
  host: 'localhost',
  user: 'administrador_gestao_ong',
  password: 'G07!brasil',
  database: 'administrador_gestao_ong',
  waitForConnections: true,
  connectionLimit: 10
});

app.get('/', (req, res) => {
  res.send('API Node no cPanel funcionando!');
});

app.post('/auth/login', (req, res) => {
  const { email, senha } = req.body;
  const sql = 'SELECT * FROM usuarios WHERE email = ? AND senha = ?';
  db.query(sql, [email, senha], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(401).json({ message: 'Credenciais inválidas' });
    res.json({ message: 'Login realizado com sucesso', usuario: results[0] });
  });
});

app.get('/admin/familias', (req, res) => {
  db.query('SELECT * FROM familias', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/admin/familias', (req, res) => {
  const dados = req.body;
  db.query('INSERT INTO familias SET ?', [dados], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId, ...dados });
  });
});

app.put('/admin/familias/:id', (req, res) => {
  const { id } = req.params;
  const dados = req.body;
  db.query('UPDATE familias SET ? WHERE id = ?', [dados, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Família atualizada' });
  });
});

app.delete('/admin/familias/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM familias WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Família removida' });
  });
});

app.get('/admin/doacoes', (req, res) => {
  db.query('SELECT * FROM doacoes', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get('/admin/solicitacoes', (req, res) => {
  db.query('SELECT * FROM solicitacoes', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.put('/admin/solicitacoes/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  db.query('UPDATE solicitacoes SET status = ? WHERE id = ?', [status, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Status atualizado' });
  });
});

app.delete('/admin/solicitacoes/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM solicitacoes WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Solicitação removida' });
  });
});

app.get('/acoes', (req, res) => {
  db.query('SELECT * FROM acoes', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/acoes', (req, res) => {
  const dados = req.body;
  db.query('INSERT INTO acoes SET ?', [dados], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId, ...dados });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));