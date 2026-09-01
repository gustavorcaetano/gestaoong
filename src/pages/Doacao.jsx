import React, { useState } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Row,
  Col,
  Modal,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../services/api"; // Deixe apenas a API!

const Doacao = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [anonimo, setAnonimo] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    valor: "",
    metodo: "Pix",
    // Campos de Cartão
    cartaoNumero: "",
    cartaoNome: "",
    cartaoValidade: "",
    cartaoCVV: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const doacaoDados = {
        nome: anonimo ? "Anônimo" : formData.nome,
        email: anonimo ? "" : formData.email,
        valor: parseFloat(formData.valor),
        metodo: formData.metodo,
      };

      // O Axios deve chamar '/api/doacoes' ou '/doacoes' dependendo do seu api.js
      // Vamos usar a rota completa para garantir que não haja erro de caminho:
      const response = await api.post("/doacoes", doacaoDados);
      console.log("Sucesso:", response.data);

      setShowModal(true);
    } catch (error) {
      console.error("Erro detalhado do Axios:", error);
      alert("Erro ao processar doação no servidor local.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    navigate("/");
  };

  // Estilo padrão para os inputs escuros
  const inputStyle = {
    background: "rgba(0,0,0,0.3)",
    border: "1px solid rgba(56, 189, 248, 0.2)",
    color: "white",
    borderRadius: "10px",
  };

  return (
    <div
      style={{
        background: "#05070a",
        minHeight: "100vh",
        padding: "40px 0",
        fontFamily: '"Inter", sans-serif',
      }}
    >
      <Container>
        <Button
          variant="link"
          onClick={() => navigate("/")}
          style={{
            color: "#38bdf8",
            textDecoration: "none",
            marginBottom: "20px",
            fontWeight: "bold",
          }}
        >
          ← Voltar
        </Button>

        <Card
          style={{
            background: "rgba(255, 255, 255, 0.02)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(56, 189, 248, 0.2)",
            borderRadius: "30px",
            color: "white",
            maxWidth: "750px",
            margin: "0 auto",
            padding: "20px",
          }}
        >
          <Card.Body>
            <h2
              className="text-center mb-4"
              style={{ fontWeight: "800", color: "#38bdf8" }}
            >
              Fazer uma Doação
            </h2>

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-4 d-flex justify-content-center">
                <Form.Check
                  type="switch"
                  id="anonimo-switch"
                  label="Desejo doar de forma anônima"
                  checked={anonimo}
                  onChange={(e) => setAnonimo(e.target.checked)}
                  style={{ fontSize: "1.1rem" }}
                />
              </Form.Group>

              {!anonimo && (
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Label>Nome Completo</Form.Label>
                    <Form.Control
                      required
                      type="text"
                      placeholder="Seu nome"
                      value={formData.nome}
                      onChange={(e) =>
                        setFormData({ ...formData, nome: e.target.value })
                      }
                      style={inputStyle}
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>E-mail</Form.Label>
                    <Form.Control
                      required
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      style={inputStyle}
                    />
                  </Col>
                </Row>
              )}

              <Row>
                <Col md={6} className="mb-3">
                  <Form.Label>Valor da Doação (R$)</Form.Label>
                  <Form.Control
                    required
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.valor}
                    onChange={(e) =>
                      setFormData({ ...formData, valor: e.target.value })
                    }
                    style={inputStyle}
                  />
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Label>Método de Pagamento</Form.Label>
                  <Form.Select
                    value={formData.metodo}
                    onChange={(e) => setFormData({ ...formData, metodo: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="Pix">Pix (Chave Instantânea)</option>
                    <option value="Dinheiro">Dinheiro Físico (Presencial)</option>
                    <option value="Cartão">Cartão de Crédito</option>
                    <option value="Boleto">Boleto Bancário</option>
                  </Form.Select>
                </Col>
              </Row>

              {/* CAMPOS DINÂMICOS PARA CARTÃO DE CRÉDITO */}
              {formData.metodo === "Cartão" && (
                <div
                  className="mt-4 p-3"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: "20px",
                    border: "1px dashed rgba(56, 189, 248, 0.3)",
                  }}
                >
                  <h5
                    className="mb-3"
                    style={{ color: "#818cf8", fontSize: "1rem" }}
                  >
                    Dados do Cartão
                  </h5>
                  <Row>
                    <Col md={12} className="mb-3">
                      <Form.Control
                        required
                        placeholder="Número do Cartão (0000 0000 0000 0000)"
                        value={formData.cartaoNumero}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            cartaoNumero: e.target.value,
                          })
                        }
                        style={inputStyle}
                      />
                    </Col>
                    <Col md={12} className="mb-3">
                      <Form.Control
                        required
                        placeholder="Nome impresso no cartão"
                        value={formData.cartaoNome}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            cartaoNome: e.target.value,
                          })
                        }
                        style={inputStyle}
                      />
                    </Col>
                    <Col md={6} className="mb-3">
                      <Form.Control
                        required
                        placeholder="Validade (MM/AA)"
                        value={formData.cartaoValidade}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            cartaoValidade: e.target.value,
                          })
                        }
                        style={inputStyle}
                      />
                    </Col>
                    <Col md={6} className="mb-3">
                      <Form.Control
                        required
                        placeholder="CVV"
                        value={formData.cartaoCVV}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            cartaoCVV: e.target.value,
                          })
                        }
                        style={inputStyle}
                      />
                    </Col>
                  </Row>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  background: "linear-gradient(90deg, #38bdf8, #818cf8)",
                  border: "none",
                  fontWeight: "bold",
                  padding: "15px",
                  borderRadius: "12px",
                  marginTop: "30px",
                }}
              >
                {loading ? "Processando..." : "Finalizar Doação"}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Container>

      {/* MODAL DE RESULTADO DO PAGAMENTO */}
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        centered
        contentClassName="bg-dark text-white"
        style={{ backdropFilter: "blur(5px)" }}
      >
        <Modal.Header
          closeButton
          closeVariant="white"
          style={{ borderBottom: "1px solid #333" }}
        >
          <Modal.Title>Pagamento Gerado!</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center p-4">
          {formData.metodo === "Pix" && (
            <div>
              <p>Escaneie o QR Code ou copie a chave Pix abaixo:</p>
              <div
                style={{
                  background: "white",
                  padding: "10px",
                  borderRadius: "10px",
                  width: "150px",
                  margin: "0 auto 20px",
                }}
              >
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=CHAVE_PIX_EXEMPLO_${formData.valor}`}
                  alt="QR Code Pix"
                />
              </div>
              <code
                style={{
                  background: "#222",
                  padding: "10px",
                  display: "block",
                  color: "#38bdf8",
                }}
              >
                00020126330014BR.GOV.BCB.PIX011112345678901
              </code>
              <Button
                variant="outline-info"
                size="sm"
                className="mt-2"
                onClick={() => alert("Copiado!")}
              >
                Copiar Código
              </Button>
            </div>
          )}

          {formData.metodo === "Boleto" && (
            <div>
              <p>Seu boleto foi gerado com sucesso!</p>
              <code
                style={{
                  background: "#222",
                  padding: "10px",
                  display: "block",
                  color: "#38bdf8",
                  marginBottom: "20px",
                }}
              >
                23793.38128 60032.615214 73000.063319 1 93020000005000
              </code>
              <Button
                variant="info"
                onClick={() =>
                  window.open(
                    "https://www.adobe.com/content/dam/acom/en/devnet/acrobat/pdfs/pdf_open_parameters.pdf",
                    "_blank",
                  )
                }
              >
                Imprimir Boleto (PDF)
              </Button>
            </div>
          )}

          {formData.metodo === "Cartão" && (
            <div className="py-3">
              <h4 style={{ color: "#4ade80" }}>✓ Sucesso!</h4>
              <p>
                Sua doação de <strong>R$ {formData.valor}</strong> foi
                processada no cartão final {formData.cartaoNumero.slice(-4)}.
              </p>
              <p>Obrigado por ajudar!</p>
            </div>
          )}
          {/* Conteúdo para Dinheiro Físico */}
          {formData.metodo === "Dinheiro" && (
            <div className="py-3 text-center">
              <h4 style={{ color: "#38bdf8", fontWeight: "bold" }}>Doação Agendada com Sucesso!</h4>
              <p className="mt-3">
                Obrigado! Sua intenção de doação no valor de <strong>R$ {formData.valor}</strong> foi gravada no nosso sistema.
              </p>
              <div style={{ background: "rgba(56, 189, 248, 0.1)", border: "1px dashed #38bdf8", padding: "15px", borderRadius: "12px" }} className="mt-3">
                <p style={{ fontSize: "0.9rem", margin: 0, color: "#cbd5e1" }}>
                  📍 <strong>Instruções de Entrega:</strong><br />
                  Por favor, dirija-se à sede da ONG para realizar a entrega presencial do valor. O administrador confirmará o recebimento no sistema assim que for entregue.
                </p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={{ borderTop: "1px solid #333" }}>
          <Button
            variant="primary"
            onClick={handleCloseModal}
            style={{ background: "#38bdf8", border: "none" }}
          >
            Entendido
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Doacao;
