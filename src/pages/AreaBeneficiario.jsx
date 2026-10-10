import React, { useState } from 'react';
import { Container, Card, Row, Col, Button, Form, Modal, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // Adicionado o Axios

const api = axios.create({
  baseURL: 'https://projetoa4.ifhost.gru.br/'
});

const AreaBeneficiario = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [buscaCpf, setBuscaCpf] = useState('');
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(false);
  const [solicitacao, setSolicitacao] = useState('');

  // 1. BUSCA O CADASTRO NO MYSQL VIA AXIOS
  const buscarCadastro = async () => {
    if (!buscaCpf) return;
    setLoading(true);
    try {
      const response = await api.get('/public/beneficiario/buscar', {
        params: { nome: buscaCpf }
      });
      setDados(response.data);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 404) {
        alert("Cadastro não encontrado. Verifique se o nome está exatamente igual ao cadastrado no sistema.");
      } else {
        alert("Erro ao consultar o sistema. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. ENVIA A SOLICITAÇÃO PARA O MYSQL VIA AXIOS
  const enviarSolicitacao = async (e) => {
    e.preventDefault();
    try {
      await api.post('/public/beneficiario/solicitacao', {
        nomeFamilia: dados.nome,
        mensagem: solicitacao
      });
      
      alert("Solicitação enviada! Aguarde a aprovação do administrador.");
      setShowModal(false);
      setSolicitacao('');
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar sua solicitação.");
    }
  };

  return (
    <div style={{ background: '#05070a', minHeight: '100vh', color: 'white', padding: '40px 0' }}>
      <Container>
        <Button variant="link" onClick={() => navigate('/')} style={{ color: '#38bdf8', textDecoration: 'none', marginBottom: '30px' }}>
          ← Voltar para o Início
        </Button>

        {!dados ? (
          <Card style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '25px', padding: '40px', textAlign: 'center' }}>
            <h2 style={{ fontWeight: 800 }}>Acesse suas Informações</h2>
            <p className="text-muted">Digite seu nome completo para consultar seu cadastro.</p>
            <div style={{ maxWidth: '400px', margin: '20px auto' }}>
              <Form.Control 
                placeholder="Nome Completo" 
                className="bg-dark text-white border-secondary mb-3"
                value={buscaCpf}
                onChange={e => setBuscaCpf(e.target.value)}
              />
              <Button 
                onClick={buscarCadastro}
                disabled={loading}
                style={{ width: '100%', background: '#38bdf8', border: 'none', fontWeight: 'bold' }}
              >
                {loading ? 'Buscando...' : 'Consultar'}
              </Button>
            </div>
          </Card>
        ) : (
          <Row>
            <Col md={4}>
              <Card style={{ background: 'linear-gradient(180deg, rgba(56, 189, 248, 0.1) 0%, rgba(5, 7, 10, 1) 100%)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '25px', padding: '20px' }}>
                <Card.Body className="text-center">
                  <div style={{ fontSize: '4rem' }}>👤</div>
                  <h3 style={{ fontWeight: 800 }}>{dados.nome}</h3>
                  <Badge bg="info">Beneficiário Ativo</Badge>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={8}>
              <Card style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '25px', padding: '30px' }}>
                <h4 className="mb-4">Meus Dados</h4>
                <Row className="mb-4">
                  <Col xs={6}><small className="text-muted">DEPENDENTES</small><h5>{dados.dependentes}</h5></Col>
                  <Col xs={6}><small className="text-muted">RENDA INFORMADA</small><h5>R$ {dados.renda}</h5></Col>
                </Row>
                <Row className="mb-4">
                  <Col xs={6}><small className="text-muted">ENTREGAS RECEBIDAS</small><h5>{dados.totalEntregas}</h5></Col>
                  <Col xs={6}>
                    <small className="text-muted">SITUAÇÃO</small>
                    <h5 className="text-success">Regular</h5>
                  </Col>
                </Row>
                <hr style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                <div className="d-flex justify-content-between align-items-center mt-4">
                  <p className="m-0 text-muted small">Alguma informação está errada?</p>
                  <Button variant="outline-info" onClick={() => setShowModal(true)}>Solicitar Alteração</Button>
                </div>
              </Card>
            </Col>
          </Row>
        )}
      </Container>

      {/* MODAL SOLICITAÇÃO */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered contentClassName="bg-dark text-white">
        <Modal.Header closeButton closeVariant="white">
          <Modal.Title>Solicitar Alteração</Modal.Title>
        </Modal.Header>
        <Form onSubmit={enviarSolicitacao}>
          <Modal.Body>
            <Form.Group>
              <Form.Label>O que você deseja alterar no seu cadastro?</Form.Label>
              <Form.Control 
                as="textarea" rows={4} required
                placeholder="Ex: Mudei de endereço ou minha renda mudou..."
                className="bg-dark text-white border-secondary"
                value={solicitacao}
                onChange={e => setSolicitacao(e.target.value)}
              />
              <Form.Text className="text-muted">Sua solicitação será analisada pela nossa equipe administrativa.</Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="link" className="text-white" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button type="submit" style={{ background: '#38bdf8', border: 'none' }}>Enviar Pedido</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default AreaBeneficiario;