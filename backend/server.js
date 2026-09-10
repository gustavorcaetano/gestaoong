const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();

// 1. Libera CORS para qualquer origem e método
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota de teste para ver se a API está viva
app.get('/', (req, res) => {
  res.json({ status: 'API Online e Funcional' });
});

// Importe suas rotas existentes aqui (ajuste o caminho se necessário)
const familiasRoutes = require('./routes/familias');
const doacoesRoutes = require('./routes/doacoes');
const solicitacoesRoutes = require('./routes/solicitacoes');
const acoesRoutes = require('./routes/acoes');
const authRoutes = require('./routes/auth');

// Mapeia tanto COM /api quanto SEM /api para evitar erro 404 Not Found
app.use('/api/admin/familias', familiasRoutes);
app.use('/admin/familias', familiasRoutes);

app.use('/api/admin/doacoes', doacoesRoutes);
app.use('/admin/doacoes', doacoesRoutes);

app.use('/api/admin/solicitacoes', solicitacoesRoutes);
app.use('/admin/solicitacoes', solicitacoesRoutes);

app.use('/api/acoes', acoesRoutes);
app.use('/acoes', acoesRoutes);

app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Outra coisa
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'gestaoong-db',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'rootpassword',
  database: process.env.DB_NAME || 'gestaoong',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Tenta testar a conexão com retentativas automáticas
const connectWithRetry = () => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log('Aguardando banco de dados inicializar... Tentando novamente em 5s');
      setTimeout(connectWithRetry, 5000);
    } else {
      console.log('Conectado ao MySQL com sucesso!');
      connection.release();
    }
  });
};

connectWithRetry();

module.exports = pool;