import axios from 'axios';

const api = axios.create({
  baseURL: 'https://projetogestaoong.ifhost.gru.br/api',
});

export default api;