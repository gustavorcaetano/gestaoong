import React, { useState } from 'react';
import { Container, Card, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // Adicionado aqui!

const api = axios.create({
  baseURL: 'https://projetoa4.ifhost.gru.br/'
});

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // 1. ESTADO PARA A NOTIFICAÇÃO
  const [notify, setNotify] = useState({ show: false, message: '', type: '' });

  // Função para disparar o pop-up
  const triggerNotify = (message, type) => {
    setNotify({ show: true, message, type });
    // Esconde sozinho após 4 segundos
    setTimeout(() => setNotify({ show: false, message: '', type: '' }), 4000);
  };

  // Função para lidar com autenticação (login e cadastro)
  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        // LOGIN VIA MYSQL
        const response = await api.post('/auth/login', { email, senha: password });
        
        // Salva os dados do usuário logado no navegador para sabermos que ele está autenticado
        localStorage.setItem('@ong:user', JSON.stringify(response.data));
        
        triggerNotify("Login realizado! Entrando...", "success");
        setTimeout(() => navigate('/admin'), 1500);
      } else {
        // CADASTRO VIA MYSQL
        await api.post('/auth/register', { email, senha: password });

        triggerNotify("ONG Cadastrada com Sucesso!", "success");
        setIsLogin(true);
      }
    } catch (err) {
      console.error(err);
      
      // Captura o código de erro que enviamos do back-end
      const errorCode = err.response?.data?.code;
      let msg = "Erro ao processar sua solicitação.";
      
      if (password.length < 6) msg = "A senha deve ter no mínimo 6 caracteres.";
      else if (errorCode === 'auth/email-already-in-use') msg = "Este e-mail já está em uso.";
      else if (errorCode === 'auth/invalid-credential') msg = "E-mail ou senha incorretos.";
      
      triggerNotify(msg, "error");
    }
  };

  // 2. COMPONENTE DE NOTIFICAÇÃO
  const renderNotification = () => {
    if (!notify.show) return null;
    return (
      <div style={{
        position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
        background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(15px)',
        border: `1px solid ${notify.type === 'success' ? '#38bdf8' : '#ff4d4d'}`,
        padding: '20px 30px', borderRadius: '15px', color: 'white',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)', 
        animation: 'slideIn 0.5s ease-out',
        display: 'flex', alignItems: 'center', gap: '15px'
      }}>
        <span>{notify.type === 'success' ? '✅' : '❌'}</span>
        <p style={{ margin: 0, fontWeight: 'bold' }}>{notify.message}</p>
        <button 
          onClick={() => setNotify({ ...notify, show: false })} 
          style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', marginLeft: '10px' }}
        >✕</button>
      </div>
    );
  };

  return (
    <div style={{ background: '#05070a', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {renderNotification()}

      <div style={{ padding: '30px 8%' }}>
        <Button variant="link" onClick={() => navigate('/')} style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 'bold' }}>
          ← Voltar para a Início
        </Button>
      </div>

      <Container className="d-flex flex-grow-1 align-items-center justify-content-center">
        <Card style={{ 
          width: '450px', background: 'rgba(255, 255, 255, 0.02)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '30px', color: 'white', padding: '30px'
        }}>
          <Card.Body>
            <h2 className="text-center mb-4" style={{ fontWeight: '800' }}>
              {isLogin ? 'Painel Administrativo' : 'Cadastro de ONG'}
            </h2>
            
            <Form onSubmit={handleAuth}>
              <Form.Group className="mb-3">
                <Form.Label>E-mail da Instituição</Form.Label>
                <Form.Control 
                  type="email" required placeholder="admin@ong.org" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #333', color: 'white' }} 
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Senha de Acesso</Form.Label>
                <Form.Control 
                  type="password" required placeholder="••••••••" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #333', color: 'white' }} 
                />
              </Form.Group>

              <Button type="submit" style={{ 
                  width: '100%', background: 'linear-gradient(90deg, #38bdf8, #818cf8)', 
                  border: 'none', fontWeight: 'bold', padding: '14px', borderRadius: '12px'
                }}>
                {isLogin ? 'Entrar no Sistema' : 'Finalizar Cadastro'}
              </Button>
            </Form>

            <div className="text-center mt-4">
              <span style={{ color: '#94a3b8' }}>
                {isLogin ? 'Sua ONG não tem conta?' : 'Já possui cadastro?'}
              </span>
              <button 
                onClick={() => { setIsLogin(!isLogin); }}
                style={{ background: 'none', border: 'none', color: '#38bdf8', fontWeight: 'bold', marginLeft: '10px', cursor: 'pointer' }}
              >
                {isLogin ? 'Cadastre-se' : 'Fazer Login'}
              </button>
            </div>
          </Card.Body>
        </Card>
      </Container>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Login;