import axios from 'axios';

// 🔗 SEU DOMÍNIO DO RAILWAY (Backend Python)
const API_URL = 'https://zenyx-gbs-production.up.railway.app';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptador para debug de erros 422
api.interceptors.response.use(
  r => r,
  e => {
    if (e.response?.status === 422) console.error("❌ ERRO 422:", e.response.data);
    return Promise.reject(e);
  }
);

// --- BOTS ---
export const botService = {
  createBot: async (d) => (await api.post('/api/admin/bots', d)).data,
  listBots: async () => (await api.get('/api/admin/bots')).data,
  getBot: async (id) => (await api.get(`/api/admin/bots/${id}`)).data,
  updateBot: async (id, d) => (await api.put(`/api/admin/bots/${id}`, d)).data,
  toggleBot: async (id) => (await api.post(`/api/admin/bots/${id}/toggle`)).data,
  deleteBot: async (id) => (await api.delete(`/api/admin/bots/${id}`)).data
};

// --- FLUXO ---
export const flowService = {
  getFlow: async (id) => (await api.get(`/api/admin/bots/${id}/flow`)).data,
  saveFlow: async (id, d) => (await api.post(`/api/admin/bots/${id}/flow`, d)).data
};

// --- PLANOS ---
export const planService = {
  listPlans: async (id) => (await api.get(`/api/admin/plans/${id}`)).data,
  savePlan: async (p) => (await api.post('/api/admin/plans', p)).data,
  deletePlan: async (id) => (await api.delete(`/api/admin/plans/${id}`)).data
};

// --- REMARKETING ---
export const remarketingService = {
  send: async (d) => (await api.post('/api/admin/remarketing/send', d)).data,
  getHistory: async (id) => {
    try { return (await api.get(`/api/admin/remarketing/history/${id}`)).data; } 
    catch { return []; }
  }
};

// --- CRM (ANTIGO) ---
export const crmService = {
  getContacts: async (botId, filter = 'todos', page = 1) => {
    const response = await api.get(`/api/admin/contacts?bot_id=${botId}&status=${filter}&page=${page}`);
    return response.data;
  }
};

// --- ADMIN (NOVO - CORREÇÃO DO ERRO VERCEL) ---
export const admin = {
  getUsers: async (botId, filter, page) => {
    return (await api.get(`/api/admin/contacts?bot_id=${botId}&status=${filter}&page=${page}`)).data;
  },
  updateUser: async (userId, data) => {
    return (await api.put(`/api/admin/users/${userId}`, data)).data;
  },
  resendAccess: async (userId) => {
    return (await api.post(`/api/admin/users/${userId}/resend-access`)).data;
  }
};