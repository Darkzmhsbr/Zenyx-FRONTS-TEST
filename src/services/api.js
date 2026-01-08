import axios from 'axios';

// 🔗 SEU DOMÍNIO DO RAILWAY
const API_URL = 'https://zenyx-gbs-production.up.railway.app';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para logar erros (ajuda no debug)
api.interceptors.response.use(
  response => response,
  error => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// --- BOTS ---
export const botService = {
  createBot: async (dados) => (await api.post('/api/admin/bots', dados)).data,
  listBots: async () => (await api.get('/api/admin/bots')).data,
  getBot: async (botId) => (await api.get(`/api/admin/bots/${botId}`)).data,
  updateBot: async (botId, dados) => (await api.put(`/api/admin/bots/${botId}`, dados)).data,
  toggleBot: async (botId) => (await api.post(`/api/admin/bots/${botId}/toggle`)).data,
  deleteBot: async (botId) => (await api.delete(`/api/admin/bots/${botId}`)).data
};

// --- PLANOS ---
export const planService = {
  listPlans: async (botId) => (await api.get(`/api/admin/plans/${botId}`)).data,
  savePlan: async (plan) => (await api.post('/api/admin/plans', plan)).data,
  deletePlan: async (planId) => (await api.delete(`/api/admin/plans/${planId}`)).data
};

// --- REMARKETING ---
export const remarketingService = {
  send: async (dados) => (await api.post('/api/admin/remarketing/send', dados)).data,
  getHistory: async (botId) => {
    try { return (await api.get(`/api/admin/remarketing/history/${botId}`)).data; } 
    catch { return []; }
  }
};

// --- CRM / CONTATOS (CORRIGIDO) ---
export const crmService = {
  // Agora aceita botId explicitamente
  getContacts: async (botId) => {
    // Pede 'limit=1000' para trazer todos e filtrar no front (igual versão antiga)
    const response = await api.get(`/api/admin/contacts?bot_id=${botId}&status=todos&limit=1000`);
    return response.data;
  },
  updateUser: async (userId, data) => (await api.put(`/api/admin/users/${userId}`, data)).data,
  resendAccess: async (userId) => (await api.post(`/api/admin/users/${userId}/resend-access`)).data
};

// --- ADMIN (Para compatibilidade com imports antigos ou Vercel) ---
export const admin = {
  getUsers: crmService.getContacts,
  updateUser: crmService.updateUser,
  resendAccess: crmService.resendAccess
};