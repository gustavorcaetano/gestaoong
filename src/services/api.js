import axios from 'axios';

// Instância base do Axios
const api = axios.create({
  baseURL: 'https://projetogestaoong.ifhost.gru.br'
});

// --- FAMÍLIAS (CRUD Completo) ---
export const getFamilias = () => api.get('/api/admin/familias');
export const createFamilia = (dados) => api.post('/api/admin/familias', dados);
export const updateFamilia = (id, dados) => api.put(`/api/admin/familias/${id}`, dados);
export const deleteFamilia = (id) => api.delete(`/api/admin/familias/${id}`);

// --- SOLICITAÇÕES ---
export const getSolicitacoes = () => api.get('/api/admin/solicitacoes');
export const updateSolicitacaoStatus = (id, status) => api.put(`/api/admin/solicitacoes/${id}`, { status });
export const deleteSolicitacao = (id) => api.delete(`/api/admin/solicitacoes/${id}`);

// --- AÇÕES / FEED ---
export const getAcoesFeed = () => api.get('/api/acoes');
export const createAcaoFeed = (dados) => api.post('/api/acoes', dados);

export default api;