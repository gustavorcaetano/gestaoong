import axios from 'axios';

const api = axios.create({
  baseURL: 'https://ifhost.gru.br/api.projetogestaoong.ifhost.gru.br'
});

export const login = (dados) => api.post('/auth/login', dados);
export const getFamilias = () => api.get('/admin/familias');
export const createFamilia = (dados) => api.post('/admin/familias', dados);
export const updateFamilia = (id, dados) => api.put(`/admin/familias/${id}`, dados);
export const deleteFamilia = (id) => api.delete(`/admin/familias/${id}`);

export const getSolicitacoes = () => api.get('/admin/solicitacoes');
export const updateSolicitacaoStatus = (id, status) => api.put(`/admin/solicitacoes/${id}`, { status });
export const deleteSolicitacao = (id) => api.delete(`/admin/solicitacoes/${id}`);

export const getAcoesFeed = () => api.get('/acoes');
export const createAcaoFeed = (dados) => api.post('/acoes', dados);

export default api;