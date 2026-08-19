const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json()); // Permite que o Node entenda dados em formato JSON

// 🗄️ 1. Conexão com o Banco de Dados no Docker
const db = mysql.createConnection({
  host: 'localhost',       // Endereço local para o Docker
  user: 'administrador_gestao_ong',
  password: 'G07!brasil',        // Senha definida no contêiner do Docker
  database: 'administrador_gestao_ong',  // Banco criado automaticamente pelo Docker
  port: 3306               // Porta padrão universal do MySQL
});

db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao MySQL no Docker:', err);
    } else {
        console.log('Conectado com sucesso ao Banco de Dados no Docker! 🚀');
    }
});

// 🌐 2. Rotas da API

// Rota de teste da Home
app.get('/api/home', (req, res) => {
    res.json({ mensagem: "Bem-vindo à API da ONG! Dados da Home carregados." });
});

// Rota para RECEBER doações do Front-end (Axios)
app.post('/api/doacoes', (req, res) => {
  const { nome, email, valor, metodo } = req.body;

  const query = 'INSERT INTO doacoes (nome, email, valor, metodo, status) VALUES (?, ?, ?, ?, ?)';
  const values = [nome, email, valor, metodo, 'Pendente'];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Erro ao inserir no MySQL:", err);
      return res.status(500).json({ erro: "Erro ao salvar no banco de dados" });
    }
    res.status(201).json({ 
      mensagem: "Doação registrada com sucesso no MySQL do Docker!", 
      idDoacao: result.insertId 
    });
  });
});

// Rota para o AdminDashboard LISTAR todas as doações salvas
app.get('/api/admin/doacoes', (req, res) => {
  const query = 'SELECT * FROM doacoes ORDER BY data DESC';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error("Erro ao buscar doações:", err);
      return res.status(500).json({ erro: "Erro ao buscar dados do banco" });
    }
    res.json(results); // Envia a lista de doações em formato JSON para o React
  });
});

// Rota para ATUALIZAR o status de uma doação para 'Confirmado'
app.put('/api/admin/doacoes/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const query = 'UPDATE doacoes SET status = ? WHERE id = ?';
  
  db.query(query, [status, id], (err, result) => {
    if (err) {
      console.error("Erro ao atualizar status no MySQL:", err);
      return res.status(500).json({ erro: "Erro ao atualizar doação no banco" });
    }
    res.json({ mensagem: "Status da doação atualizado com sucesso!" });
  });
});

// Rota para o AdminDashboard LISTAR todas as famílias salvas no MySQL
app.get('/api/admin/familias', (req, res) => {
  const query = 'SELECT * FROM familias ORDER BY nome ASC';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error("Erro ao buscar famílias no MySQL:", err);
      return res.status(500).json({ erro: "Erro ao buscar dados do banco" });
    }
    res.json(results); // Envia a lista de famílias para o React
  });
});

// Rota para CADASTRAR uma nova família no MySQL
app.post('/api/admin/familias', (req, res) => {
  const { nome, dependentes, renda, totalEntregas } = req.body;

  const query = 'INSERT INTO familias (nome, dependentes, renda, totalEntregas) VALUES (?, ?, ?, ?)';
  
  db.query(query, [nome, dependentes, renda, totalEntregas], (err, result) => {
    if (err) {
      console.error("Erro ao inserir família no MySQL:", err);
      return res.status(500).json({ erro: "Erro ao salvar família no banco" });
    }
    // Retorna o ID gerado junto com os dados inseridos
    res.status(201).json({ id: result.insertId, nome, dependentes, renda, totalEntregas });
  });
});

// Rota para EDITAR uma família no MySQL
app.put('/api/admin/familias/:id', (req, res) => {
  const { id } = req.params;
  const { nome, dependentes, renda, totalEntregas } = req.body;

  const query = 'UPDATE familias SET nome = ?, dependentes = ?, renda = ?, totalEntregas = ? WHERE id = ?';
  
  db.query(query, [nome, dependentes, renda, totalEntregas, id], (err, result) => {
    if (err) {
      console.error("Erro ao atualizar família no MySQL:", err);
      return res.status(500).json({ erro: "Erro ao atualizar família no banco" });
    }
    res.json({ id: Number(id), nome, dependentes, renda, totalEntregas });
  });
});

// Rota para EXCLUIR uma família no MySQL
app.delete('/api/admin/familias/:id', (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM familias WHERE id = ?';
  
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Erro ao excluir família no MySQL:", err);
      return res.status(500).json({ erro: "Erro ao excluir família no banco" });
    }
    res.json({ mensagem: "Família removida com sucesso!" });
  });
});

// 1. Rota para LISTAR todos os pedidos (Solicitações) no MySQL
app.get('/api/admin/solicitacoes', (req, res) => {
  const query = 'SELECT * FROM solicitacoes ORDER BY data DESC';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error("Erro ao buscar solicitações no MySQL:", err);
      return res.status(500).json({ erro: "Erro ao buscar solicitações do banco" });
    }
    res.json(results);
  });
});

// 2. Rota para ATUALIZAR o status de um pedido para 'Resolvido'
app.put('/api/admin/solicitacoes/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const query = 'UPDATE solicitacoes SET status = ? WHERE id = ?';
  
  db.query(query, [status, id], (err, result) => {
    if (err) {
      console.error("Erro ao atualizar status da solicitação no MySQL:", err);
      return res.status(500).json({ erro: "Erro ao atualizar status no banco" });
    }
    res.json({ mensagem: "Status da solicitação atualizado com sucesso!" });
  });
});

// 3. Rota para EXCLUIR um pedido no MySQL
app.delete('/api/admin/solicitacoes/:id', (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM solicitacoes WHERE id = ?';
  
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Erro ao excluir solicitação no MySQL:", err);
      return res.status(500).json({ erro: "Erro ao excluir solicitação no banco" });
    }
    res.json({ mensagem: "Solicitação removida com sucesso!" });
  });
});

// 1. Rota para CADASTRO de uma nova ONG
app.post('/api/auth/register', (req, res) => {
  const { email, senha } = req.body; 

  // Verifica se o usuário já existe
  const checkQuery = 'SELECT * FROM usuarios WHERE email = ?';
  db.query(checkQuery, [email], (err, results) => {
    if (err) return res.status(500).json({ erro: "Erro ao verificar usuário" });
    if (results.length > 0) {
      return res.status(400).json({ code: 'auth/email-already-in-use' });
    }

    // Insere o novo usuário
    const insertQuery = 'INSERT INTO usuarios (email, senha) VALUES (?, ?)';
    db.query(insertQuery, [email, senha], (err, result) => {
      if (err) return res.status(500).json({ erro: "Erro ao cadastrar usuário" });
      res.status(201).json({ mensagem: "ONG cadastrada com sucesso!" });
    });
  });
});

// 2. Rota para LOGIN da ONG
app.post('/api/auth/login', (req, res) => {
  const { email, senha } = req.body;

  const query = 'SELECT * FROM usuarios WHERE email = ? AND senha = ?';
  db.query(query, [email, senha], (err, results) => {
    if (err) return res.status(500).json({ erro: "Erro no servidor" });
    
    if (results.length === 0) {
      // Se não achar, pode ser e-mail inexistente ou senha errada
      return res.status(400).json({ code: 'auth/invalid-credential' });
    }

    // Login com sucesso (retorna os dados básicos do perfil)
    const usuario = results[0];
    res.json({
      id: usuario.id,
      email: usuario.email,
      tipoPerfil: usuario.tipoPerfil
    });
  });
});

// 1. Rota pública para BUSCAR cadastro da família pelo Nome Completo
app.get('/api/public/beneficiario/buscar', (req, res) => {
  const { nome } = req.query;

  const query = 'SELECT * FROM familias WHERE nome = ?';
  db.query(query, [nome], (err, results) => {
    if (err) {
      console.error("Erro ao buscar família no MySQL:", err);
      return res.status(500).json({ erro: "Erro ao consultar o banco de dados." });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ mensagem: "Cadastro não encontrado." });
    }

    // Retorna os dados da primeira família encontrada
    res.json(results[0]);
  });
});

// 2. Rota pública para ENVIAR uma nova solicitação/pedido
app.post('/api/public/beneficiario/solicitacao', (req, res) => {
  const { nomeFamilia, mensagem } = req.body;

  const query = 'INSERT INTO solicitacoes (nomeFamilia, mensagem) VALUES (?, ?)';
  db.query(query, [nomeFamilia, mensagem], (err, result) => {
    if (err) {
      console.error("Erro ao criar solicitação no MySQL:", err);
      return res.status(500).json({ erro: "Erro ao enviar a solicitação." });
    }
    res.status(201).json({ mensagem: "Solicitação enviada com sucesso!" });
  });
});

// Rota pública para REGISTRAR uma nova doação
app.post('/api/doacoes', (req, res) => {
  const { nome, email, valor, metodo } = req.body;

  const query = 'INSERT INTO doacoes (nome, email, valor, metodo) VALUES (?, ?, ?, ?)';
  db.query(query, [nome, email, valor, metodo], (err, result) => {
    if (err) {
      console.error("Erro ao registrar doação no MySQL:", err);
      return res.status(500).json({ erro: "Erro ao processar doação no banco de dados." });
    }
    res.status(201).json({ mensagem: "Doação registrada com sucesso!", id: result.insertId });
  });
});

// 🏃‍♂️ 3. Ligando o Servidor Node
const PORT = 3001; 
app.listen(PORT, () => {
    console.log(`Servidor do Back-end rodando em http://localhost:${PORT}`);
});