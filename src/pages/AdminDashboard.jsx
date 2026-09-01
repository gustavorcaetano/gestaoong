import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Container, Row, Col, Table, Button, Form, Modal, InputGroup, Card, Nav, Badge, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('familias'); 
  const [familias, setFamilias] = useState([]);
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [doacoes, setDoacoes] = useState([]);
  const [acoes, setAcoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: 'nome', direction: 'asc' });
  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [notify, setNotify] = useState({ show: false, message: '', type: '' });
  const [form, setForm] = useState({ nome: '', dependentes: 0, renda: 0, totalEntregas: 0 });
  const [formAcao, setFormAcao] = useState({ titulo: '', descricao: '', imagem_url: '', data_acao: '' });

  // Cores de contraste
  const styles = {
    textPrimary: '#f8fafc',
    textSecondary: '#cbd5e1',
    accent: '#38bdf8',
    cardBg: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(56, 189, 248, 0.2)'
  };

  // Carregamento inicial de dados com proteção contra respostas inválidas/HTML
  useEffect(() => {
    setLoading(true);

    const carregarFamilias = api.get('/admin/familias')
      .then((res) => setFamilias(Array.isArray(res.data) ? res.data : (res.data?.familias || [])))
      .catch((err) => { console.error("Erro em famílias:", err); setFamilias([]); });

    const carregarSolicitacoes = api.get('/admin/solicitacoes')
      .then((res) => setSolicitacoes(Array.isArray(res.data) ? res.data : (res.data?.solicitacoes || [])))
      .catch((err) => { console.error("Erro em solicitações:", err); setSolicitacoes([]); });

    const carregarDoacoes = api.get('/admin/doacoes')
      .then((res) => setDoacoes(Array.isArray(res.data) ? res.data : (res.data?.doacoes || [])))
      .catch((err) => { console.error("Erro em doações:", err); setDoacoes([]); });

    const carregarAcoes = api.get('/acoes')
      .then((res) => setAcoes(Array.isArray(res.data) ? res.data : (res.data?.acoes || [])))
      .catch((err) => { console.error("Erro em ações:", err); setAcoes([]); });

    Promise.all([carregarFamilias, carregarSolicitacoes, carregarDoacoes, carregarAcoes]).finally(() => {
      setLoading(false);
    });
  }, []);

  const handleCriarAcao = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/acoes', formAcao);
      setAcoes(prev => [res.data, ...prev]);
      setFormAcao({ titulo: '', descricao: '', imagem_url: '', data_acao: '' });
      showNotification("Ação publicada no feed!", "success");
    } catch (err) {
      showNotification("Erro ao publicar ação.", "danger");
    }
  };

  const showNotification = (message, type) => {
    setNotify({ show: true, message, type });
    setTimeout(() => setNotify({ show: false, message: '', type: '' }), 4000);
  };

  const handleLogout = () => {
    localStorage.removeItem('@token');
    navigate('/login');
  };

  // Lógica de Filtro Única e Segura
  const familiasFiltradas = Array.isArray(familias) 
    ? familias.filter(f => f.nome?.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  const sortedFamilias = [...familiasFiltradas].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

 const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const dataPayload = {
      nome: form.nome,
      dependentes: Number(form.dependentes),
      renda: Number(form.renda),
      totalEntregas: Number(form.totalEntregas)
    };

    if (editingId) {
      const response = await api.put(`/admin/familias/${editingId}`, dataPayload);
      const familiaAtualizada = response.data?.familia || response.data;
      setFamilias(prev => prev.map(f => f.id === editingId ? familiaAtualizada : f));
      showNotification("Cadastro atualizado com sucesso!", "success");
    } else {
      const response = await api.post('/admin/familias', dataPayload);
      
      // Extrai o objeto da família retornado do MySQL
      const novaFamilia = response.data?.familia || response.data;
      
      // Garante que o ID e campos existam na tela imediatamente
      const familiaFormatada = {
        id: novaFamilia.id || Date.now(),
        nome: form.nome,
        dependentes: Number(form.dependentes),
        renda: Number(form.renda),
        totalEntregas: Number(form.totalEntregas)
      };

      setFamilias(prev => [familiaFormatada, ...prev]);
      showNotification("Família cadastrada com sucesso!", "success");
    }
    
    setShowModal(false);
    setForm({ nome: '', dependentes: 0, renda: 0, totalEntregas: 0 });
  } catch (err) { 
    console.error("Erro ao salvar família:", err);
    showNotification("Erro ao salvar no banco de dados.", "danger"); 
  }
};

  const handleStatusUpdate = async (coll, id, novoStatus) => {
    try {
      if (coll === 'doacoes') {
        await api.put(`/admin/doacoes/${id}`, { status: novoStatus });
        showNotification("Status da doação atualizado!", "success");
        setDoacoes(prev => prev.map(d => d.id === id ? { ...d, status: novoStatus } : d));
      } else if (coll === 'solicitacoes') {
        await api.put(`/admin/solicitacoes/${id}`, { status: novoStatus });
        showNotification("Pedido resolvido com sucesso!", "success");
        setSolicitacoes(prev => prev.map(s => s.id === id ? { ...s, status: novoStatus } : s));
      }
    } catch (err) { 
      console.error("Erro ao atualizar status:", err);
      showNotification("Erro ao atualizar status.", "danger"); 
    }
  };

  const handleDelete = async (coll, id) => {
    if (window.confirm("Confirmar exclusão definitiva?")) {
      try {
        if (coll === 'familias') {
          await api.delete(`/admin/familias/${id}`);
          setFamilias(prev => prev.filter(f => f.id !== id));
          showNotification("Família removida com sucesso.", "success");
        } else if (coll === 'solicitacoes') {
          await api.delete(`/admin/solicitacoes/${id}`);
          setSolicitacoes(prev => prev.filter(s => s.id !== id));
          showNotification("Pedido removido com sucesso.", "success");
        }
      } catch (err) {
        console.error("Erro ao excluir:", err);
        showNotification("Erro ao remover.", "danger");
      }
    }
  };

  return (
    <div style={{ background: '#020617', minHeight: '100vh', color: styles.textPrimary, padding: '20px' }}>
      
      {notify.show && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 10000,
          background: '#0f172a', borderLeft: `5px solid ${notify.type === 'success' ? '#22c55e' : '#ef4444'}`,
          padding: '15px 25px', borderRadius: '8px', color: 'white', boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
        }}>{notify.message}</div>
      )}

      <Container>
        <Row className="align-items-center mb-5 mt-4">
          <Col md={6}>
            <h1 style={{ fontWeight: 900, letterSpacing: '-1px' }}>
              ADMIN <span style={{ color: styles.accent, textShadow: `0 0 15px ${styles.accent}44` }}>DASHBOARD</span>
            </h1>
          </Col>
          <Col md={6} className="text-md-end">
            <Button variant="outline-light" className="me-3 border-0" onClick={handleLogout}>Sair</Button>
            <Button 
              style={{ background: `linear-gradient(135deg, ${styles.accent}, #818cf8)`, border: 'none', fontWeight: '800', padding: '10px 25px', borderRadius: '12px' }}
              onClick={() => { setEditingId(null); setForm({nome:'', dependentes:0, renda:0, totalEntregas:0}); setShowModal(true); }}
            >
              + NOVA FAMÍLIA
            </Button>
          </Col>
        </Row>

        <Nav variant="pills" className="mb-4 p-2" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '15px', width: 'fit-content' }}>
          <Nav.Item>
            <Nav.Link eventKey="familias" onClick={() => setActiveTab('familias')} 
              style={{ color: activeTab === 'familias' ? '#fff' : styles.textSecondary, background: activeTab === 'familias' ? styles.accent : 'transparent', fontWeight: 'bold' }}>
              👨‍👩‍👧 Famílias
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="solicitacoes" onClick={() => setActiveTab('solicitacoes')}
              style={{ color: activeTab === 'solicitacoes' ? '#fff' : styles.textSecondary, background: activeTab === 'solicitacoes' ? '#818cf8' : 'transparent', fontWeight: 'bold' }}>
              📩 Pedidos <Badge bg="danger" pill className="ms-1">{solicitacoes.filter(s => s.status === 'Pendente').length}</Badge>
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="doacoes" onClick={() => setActiveTab('doacoes')}
              style={{ color: activeTab === 'doacoes' ? '#fff' : styles.textSecondary, background: activeTab === 'doacoes' ? '#4ade80' : 'transparent', fontWeight: 'bold' }}>
              💰 Doações <Badge bg="info" pill className="ms-1">{doacoes.filter(d => d.status === 'Pendente').length}</Badge>
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="acoes" onClick={() => setActiveTab('acoes')}
              style={{ color: activeTab === 'acoes' ? '#fff' : styles.textSecondary, background: activeTab === 'acoes' ? '#38bdf8' : 'transparent', fontWeight: 'bold' }}>
              📢 Ações (Feed)
            </Nav.Link>
          </Nav.Item>
        </Nav>

        {loading ? (
          <div className="text-center py-5"><Spinner animation="grow" variant="info" /></div>
        ) : (
          <>
            {activeTab === 'familias' && (
              <>
                <InputGroup className="mb-4" style={{ maxWidth: '450px' }}>
                  <Form.Control 
                    placeholder="Pesquisar por nome do responsável..." 
                    style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid #334155', borderRadius: '12px' }}
                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  />
                </InputGroup>

                <div style={{ background: styles.cardBg, borderRadius: '20px', border: styles.border, overflow: 'hidden' }}>
                  <Table hover responsive variant="dark" className="m-0 border-0">
                    <thead>
                      <tr style={{ background: 'rgba(56, 189, 248, 0.15)', color: styles.accent }}>
                        <th className="p-3">Responsável</th>
                        <th className="p-3">Dependentes</th>
                        <th className="p-3">Renda Mensal</th>
                        <th className="p-3">Total Entregas</th>
                        <th className="p-3 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedFamilias.map((f) => (
                        <tr key={f.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td className="p-3 fw-bold" style={{ color: styles.textPrimary }}>{f.nome}</td>
                          <td className="p-3" style={{ color: styles.textSecondary }}>{f.dependentes}</td>
                          <td className="p-3 text-success fw-bold">{Number(f.renda).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                          <td className="p-3">{f.totalEntregas}</td>
                          <td className="p-3 text-center">
                            <Button variant="link" className="text-info me-2" onClick={() => { setForm(f); setEditingId(f.id); setShowModal(true); }}>Editar</Button>
                            <Button variant="link" className="text-danger" onClick={() => handleDelete('familias', f.id)}>Excluir</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </>
            )}

            {activeTab === 'solicitacoes' && (
              <Row>
                {solicitacoes.map((s) => (
                  <Col md={12} key={s.id} className="mb-3">
                    <Card style={{ background: styles.cardBg, border: styles.border, borderRadius: '15px' }}>
                      <Card.Body className="d-flex justify-content-between align-items-center">
                        <div>
                          <h5 style={{ color: styles.accent, fontWeight: 'bold' }}>{s.nomeFamilia}</h5>
                          <p style={{ color: styles.textSecondary, fontStyle: 'italic' }}>"{s.mensagem}"</p>
                          <small style={{ color: '#64748b' }}>Recebido em: {new Date(s.data).toLocaleDateString('pt-BR')}</small>
                        </div>
                        <div className="d-flex gap-2">
                          <Badge bg={s.status === 'Pendente' ? 'warning' : 'success'} className="p-2 mb-2">{s.status}</Badge>
                          {s.status === 'Pendente' && (
                            <Button variant="success" size="sm" onClick={() => handleStatusUpdate('solicitacoes', s.id, "Resolvido")}>✓ Resolver</Button>
                          )}
                          <Button variant="outline-danger" size="sm" onClick={() => handleDelete('solicitacoes', s.id)}>Excluir</Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}

            {activeTab === 'doacoes' && (
              <div style={{ background: styles.cardBg, borderRadius: '20px', border: styles.border, overflow: 'hidden' }}>
                <Table hover responsive variant="dark" className="m-0 border-0">
                  <thead>
                    <tr style={{ background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80' }}>
                      <th className="p-3">Doador</th>
                      <th className="p-3">Valor</th>
                      <th className="p-3">Método</th>
                      <th className="p-3">Data</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-center">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doacoes.map((d) => (
                      <tr key={d.id}>
                        <td className="p-3 fw-bold">{d.nome} <br/><small className="text-muted">{d.email}</small></td>
                        <td className="p-3 fw-bold text-success">R$ {d.valor}</td>
                        <td className="p-3">{d.metodo}</td>
                        <td className="p-3 text-secondary">{new Date(d.data).toLocaleDateString('pt-BR')}</td>
                        <td className="p-3"><Badge bg={d.status === 'Pendente' ? 'warning' : 'success'}>{d.status}</Badge></td>
                        <td className="p-3 text-center">
                          {d.status === 'Pendente' && (
                            <Button variant="outline-success" size="sm" onClick={() => handleStatusUpdate('doacoes', d.id, "Confirmado")}>Confirmar</Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}

            {activeTab === 'acoes' && (
              <div>
                <Card style={{ background: styles.cardBg, border: styles.border, borderRadius: '20px' }} className="p-4 mb-4">
                  <h4 style={{ color: styles.accent }}>Publicar Nova Ação</h4>
                  <Form onSubmit={handleCriarAcao}>
                    <Row className="mb-3">
                      <Col md={6}>
                        <Form.Label>Título da Ação</Form.Label>
                        <Form.Control required style={inputStyle} value={formAcao.titulo} onChange={e => setFormAcao({...formAcao, titulo: e.target.value})} placeholder="Ex: Entrega de Cestas Básicas" />
                      </Col>
                      <Col md={6}>
                        <Form.Label>Data da Realização</Form.Label>
                        <Form.Control required type="date" style={inputStyle} value={formAcao.data_acao} onChange={e => setFormAcao({...formAcao, data_acao: e.target.value})} />
                      </Col>
                    </Row>
                    <Form.Group className="mb-3">
                      <Form.Label>URL da Imagem</Form.Label>
                      <Form.Control required type="url" style={inputStyle} value={formAcao.imagem_url} onChange={e => setFormAcao({...formAcao, imagem_url: e.target.value})} placeholder="https://i.ibb.co/..." />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Descrição</Form.Label>
                      <Form.Control required as="textarea" rows={3} style={inputStyle} value={formAcao.descricao} onChange={e => setFormAcao({...formAcao, descricao: e.target.value})} placeholder="Resumo do impacto realizado..." />
                    </Form.Group>
                    <Button type="submit" style={{ background: styles.accent, border: 'none', fontWeight: 'bold' }}>Publicar no Feed</Button>
                  </Form>
                </Card>
              </div>
            )}
          </>
        )}
      </Container>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered contentClassName="bg-dark text-white border-0" style={{ backdropFilter: 'blur(10px)' }}>
        <Modal.Header closeButton closeVariant="white" style={{ borderBottom: '1px solid #334155' }}>
          <Modal.Title style={{ fontWeight: 800 }}>{editingId ? 'EDITAR FAMÍLIA' : 'CADASTRAR FAMÍLIA'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="p-4">
            <Form.Group className="mb-4">
              <Form.Label style={{ color: styles.accent, fontWeight: 'bold' }}>Nome do Responsável</Form.Label>
              <Form.Control required value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} style={inputStyle} />
            </Form.Group>
            <Row>
              <Col md={4}><Form.Group className="mb-3"><Form.Label>Dependentes</Form.Label><Form.Control type="number" value={form.dependentes} onChange={e => setForm({...form, dependentes: e.target.value})} style={inputStyle} /></Form.Group></Col>
              <Col md={4}><Form.Group className="mb-3"><Form.Label>Renda (R$)</Form.Label><Form.Control type="number" value={form.renda} onChange={e => setForm({...form, renda: e.target.value})} style={inputStyle} /></Form.Group></Col>
              <Col md={4}><Form.Group className="mb-3"><Form.Label>Entregas</Form.Label><Form.Control type="number" value={form.totalEntregas} onChange={e => setForm({...form, totalEntregas: e.target.value})} style={inputStyle} /></Form.Group></Col>
            </Row>
          </Modal.Body>
          <Modal.Footer style={{ borderTop: '1px solid #334155' }}>
            <Button variant="outline-light" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button type="submit" style={{ background: styles.accent, border: 'none', fontWeight: 'bold', padding: '10px 30px' }}>SALVAR DADOS</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

const inputStyle = {
  background: '#0f172a',
  color: 'white',
  border: '1px solid #334155',
  padding: '12px',
  borderRadius: '8px'
};

export default AdminDashboard;