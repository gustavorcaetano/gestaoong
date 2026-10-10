// ===================================================================
// IMPORTAÇÃO DOS MÓDULOS ESSENCIAIS
// ===================================================================





const express = require('express');   // Importa o framework Express para a criação do servidor HTTP e rotas
const cors = require('cors');         // Importa o middleware CORS para gerenciar permissões de acesso entre domínios diferentes
const mysql = require('mysql2');      // Importa o driver de conexão com o banco de dados MySQL
const app = express();                // Inicializa a aplicação Express
const PORT = process.env.PORT || 3001; // Define a porta em que o servidor Node.js irá rodar

// ===================================================================
// CONFIGURAÇÃO DOS MIDDLEWARES (CORS E PARSER JSON)
// ===================================================================

// Configuração do CORS:
// O pacote 'cors' trata automaticamente todas as requisições de preflight (HTTP OPTIONS)
// sem necessitar de rotas coringas manuais como app.options('*'), evitando erros com o path-to-regexp.
app.use(cors({
  origin: '*', // Permite requisições de qualquer origem (em produção, pode-se restringir à URL do front-end)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Métodos HTTP permitidos para integração com o React
  allowedHeaders: ['Content-Type', 'Authorization'] // Cabeçalhos permitidos nas requisições do cliente
}));

const api = axios.create( { baseURL: 'https://projetoa4.ifhost.gru.br/'} );

// Middleware para interpretar requisições enviadas com o formato JSON no corpo (req.body)
app.use(express.json());

// ===================================================================
// CONEXÃO COM O BANCO DE DADOS (MYSQL)
// ===================================================================

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gestaoong'
});

db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados MySQL:', err);
    return;
  }
  console.log('Conexão com o banco de dados MySQL estabelecida com sucesso!');
});

// ===================================================================
// ROTAS DA APLICAÇÃO (ENDPOINTS DA API)
// ===================================================================

// Rota de verificação do status da API (Health Check)
app.get('/api/status', (req, res) => {
  res.json({ status: 'API em execução', timestamp: new Date() });
});

// Rota de Autenticação / Login
app.post('/auth/login', (req, res) => {
  const { email, senha } = req.body;
  const sql = 'SELECT * FROM usuarios WHERE email = ? AND senha = ?';
  db.query(sql, [email, senha], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(401).json({ message: 'Credenciais inválidas' });
    res.json({ message: 'Login realizado com sucesso', usuario: results[0] });
  });
});

// Rotas para Famílias (Painel Admin)
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

// Rota para Doações
app.get('/admin/doacoes', (req, res) => {
  db.query('SELECT * FROM doacoes', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Rotas para Solicitações
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

// Rotas para Ações
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

// ===================================================================
// INICIALIZAÇÃO DO SERVIDOR
// ===================================================================

// Coloca o servidor para escutar na porta configurada
app.listen(PORT, () => {
  console.log(`Servidor rodando com sucesso na porta ${PORT}`);
});