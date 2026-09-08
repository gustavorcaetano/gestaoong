const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();

// Configuração completa do CORS para produção no cPanel
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// 1. Conexão com o Banco de Dados
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'administrador_gestao_ong',
  password: process.env.DB_PASSWORD || 'G07!brasil',
  database: process.env.DB_NAME || 'administrador_gestao_ong',
  port: 3306
});

db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao Banco de Dados:', err);
    } else {
        console.log('Conectado com sucesso ao Banco de Dados! 🚀');
    }
});

// --- ROTAS DA API ---

// Publicações
app.post('/api/acoes', (req, res) => {
  const { titulo, descricao, imagem_url, data_acao } = req.body;
  const query = 'INSERT INTO acoes (titulo, descricao, imagem_url, data_acao) VALUES (?, ?, ?, ?)';
  db.query(query, [titulo, descricao, imagem_url, data_acao], (err, result) => {
    if (err) return res.status(500).json({ erro: 'Erro ao publicar ação' });
    res.status(201).json({ mensagem: 'Ação publicada com sucesso!' });
  });
});

app.get('/api/acoes', (req, res) => {
  db.query('SELECT * FROM acoes ORDER BY data_acao DESC', (err, results) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar ações' });
    res.json(results);
  });
});

// Cadastro de Administrador (Bcrypt)
app.post('/api/cadastrar', async (req, res) => {
  const { email, senha } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const senhaCriptografada = await bcrypt.hash(senha, salt);

    const query = 'INSERT INTO usuarios (email, senha) VALUES (?, ?)';
    db.query(query, [email, senhaCriptografada], (err, result) => {
      if (err) return res.status(500).json({ erro: 'Erro ao cadastrar usuário' });
      res.status(201).json({ mensagem: 'Administrador cadastrado com sucesso!' });
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro interno no servidor' });
  }
});

// Login Unificado com Comparação Bcrypt (Mapeado para /api/login e /api/auth/login)
const handleLogin = (req, res) => {
  const { email, senha } = req.body;
  const query = 'SELECT * FROM usuarios WHERE email = ?';

  db.query(query, [email], async (err, results) => {
    if (err || results.length === 0) return res.status(401).json({ erro: 'Usuário não encontrado' });

    const usuario = results[0];
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) return res.status(401).json({ erro: 'Senha incorreta' });

    res.json({ 
      mensagem: 'Login realizado com sucesso!', 
      user: { id: usuario.id, email: usuario.email },
      token: 'jwt-token-fake-ou-real' 
    });
  });
};

app.post('/api/login', handleLogin);
app.post('/api/auth/login', handleLogin);

// Home Teste
app.get('/api/home', (req, res) => {
    res.json({ mensagem: "Bem-vindo à API da ONG!" });
});

// Doações públicas
app.post('/api/doacoes', (req, res) => {
  const { nome, email, valor, metodo } = req.body;
  const query = 'INSERT INTO doacoes (nome, email, valor, metodo, status) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [nome, email, valor, metodo, 'Pendente'], (err, result) => {
    if (err) return res.status(500).json({ erro: "Erro ao processar doação" });
    res.status(201).json({ mensagem: "Doação registrada com sucesso!", idDoacao: result.insertId });
  });
});

// Admin - Doações
app.get('/api/admin/doacoes', (req, res) => {
  db.query('SELECT * FROM doacoes ORDER BY data DESC', (err, results) => {
    if (err) return res.status(500).json({ erro: "Erro ao buscar doações" });
    res.json(results);
  });
});

app.put('/api/admin/doacoes/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  db.query('UPDATE doacoes SET status = ? WHERE id = ?', [status, id], (err, result) => {
    if (err) return res.status(500).json({ erro: "Erro ao atualizar doação" });
    res.json({ mensagem: "Status atualizado com sucesso!" });
  });
});

// Admin - Famílias
app.get('/api/admin/familias', (req, res) => {
  db.query('SELECT * FROM familias ORDER BY nome ASC', (err, results) => {
    if (err) return res.status(500).json({ erro: "Erro ao buscar famílias" });
    res.json(results);
  });
});

app.post('/api/admin/familias', (req, res) => {
  const { nome, dependentes, renda, totalEntregas } = req.body;
  db.query('INSERT INTO familias (nome, dependentes, renda, totalEntregas) VALUES (?, ?, ?, ?)', 
    [nome, dependentes, renda, totalEntregas], (err, result) => {
    if (err) return res.status(500).json({ erro: "Erro ao salvar família" });
    res.status(201).json({ id: result.insertId, nome, dependentes, renda, totalEntregas });
  });
});

app.put('/api/admin/familias/:id', (req, res) => {
  const { id } = req.params;
  const { nome, dependentes, renda, totalEntregas } = req.body;
  db.query('UPDATE familias SET nome = ?, dependentes = ?, renda = ?, totalEntregas = ? WHERE id = ?',
    [nome, dependentes, renda, totalEntregas, id], (err, result) => {
    if (err) return res.status(500).json({ erro: "Erro ao atualizar família" });
    res.json({ id: Number(id), nome, dependentes, renda, totalEntregas });
  });
});

app.delete('/api/admin/familias/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM familias WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ erro: "Erro ao excluir família" });
    res.json({ mensagem: "Família removida com sucesso!" });
  });
});

// Admin - Solicitações
app.get('/api/admin/solicitacoes', (req, res) => {
  db.query('SELECT * FROM solicitacoes ORDER BY data DESC', (err, results) => {
    if (err) return res.status(500).json({ erro: "Erro ao buscar solicitações" });
    res.json(results);
  });
});

app.put('/api/admin/solicitacoes/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  db.query('UPDATE solicitacoes SET status = ? WHERE id = ?', [status, id], (err, result) => {
    if (err) return res.status(500).json({ erro: "Erro ao atualizar solicitação" });
    res.json({ mensagem: "Status atualizado com sucesso!" });
  });
});

app.delete('/api/admin/solicitacoes/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM solicitacoes WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ erro: "Erro ao excluir solicitação" });
    res.json({ mensagem: "Solicitação removida com sucesso!" });
  });
});

// Beneficiários públicos
app.get('/api/public/beneficiario/buscar', (req, res) => {
  const { nome } = req.query;
  db.query('SELECT * FROM familias WHERE nome = ?', [nome], (err, results) => {
    if (err) return res.status(500).json({ erro: "Erro ao consultar banco" });
    if (results.length === 0) return res.status(404).json({ mensagem: "Cadastro não encontrado." });
    res.json(results[0]);
  });
});

app.post('/api/public/beneficiario/solicitacao', (req, res) => {
  const { nomeFamilia, mensagem } = req.body;
  db.query('INSERT INTO solicitacoes (nomeFamilia, mensagem) VALUES (?, ?)', [nomeFamilia, mensagem], (err, result) => {
    if (err) return res.status(500).json({ erro: "Erro ao enviar solicitação" });
    res.status(201).json({ mensagem: "Solicitação enviada com sucesso!" });
  });
});

// Porta dinâmica para rodar via cPanel Node.js App
const PORT = process.env.PORT || 3001; 
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});