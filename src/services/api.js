import axios from 'axios';

// 🔗 SEU DOMÍNIO DO RAILWAY (Backend Python)
const API_URL = 'https://zenyx-gbs-production.up.railway.app';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 422) {
      console.error("❌ ERRO 422 (Dados Inválidos):", error.response.data);
    }
    return Promise.reject(error);
  }
);

// --- SERVIÇO DE BOTS ---
export const botService = {
  createBot: async (dados) => (await api.post('/api/admin/bots', dados)).data,
  listBots: async () => (await api.get('/api/admin/bots')).data,
  getBot: async (botId) => (await api.get(`/api/admin/bots/${botId}`)).data,
  updateBot: async (botId, dados) => (await api.put(`/api/admin/bots/${botId}`, dados)).data,
  toggleBot: async (botId) => (await api.post(`/api/admin/bots/${botId}/toggle`)).data,
  deleteBot: async (botId) => (await api.delete(`/api/admin/bots/${botId}`)).data
};

// --- SERVIÇO DE FLUXO ---
export const flowService = {
  getFlow: async (botId) => (await api.get(`/api/admin/bots/${botId}/flow`)).data,
  saveFlow: async (botId, dados) => (await api.post(`/api/admin/bots/${botId}/flow`, dados)).data
};

// --- SERVIÇO DE PLANOS ---
export const planService = {
  listPlans: async (botId) => (await api.get(`/api/admin/plans/${botId}`)).data,
  savePlan: async (plan) => (await api.post('/api/admin/plans', plan)).data,
  deletePlan: async (planId) => (await api.delete(`/api/admin/plans/${planId}`)).data
};

// --- SERVIÇO DE REMARKETING ---
export const remarketingService = {
  send: async (dados) => (await api.post('/api/admin/remarketing/send', dados)).data,
  getHistory: async (botId) => {
    try { return (await api.get(`/api/admin/remarketing/history/${botId}`)).data; } 
    catch { return []; }
  }
};

// --- SERVIÇO DE CRM (LEGADO) ---
export const crmService = {
  getContacts: async (botId, filter = 'todos', page = 1) => {
    // Mantendo compatibilidade
    const response = await api.get(`/api/admin/contacts?bot_id=${botId}&status=${filter}&page=${page}`);
    return response.data;
  }
};

// --- SERVIÇO ADMIN (CRÍTICO PARA CONTATOS) ---
export const admin = {
  getUsers: async (botId, filter, page) => {
    const response = await api.get(`/api/admin/contacts?bot_id=${botId}&status=${filter}&page=${page}`);
    return response.data;
  },
  updateUser: async (userId, data) => {
    const response = await api.put(`/api/admin/users/${userId}`, data);
    return response.data;
  },
  resendAccess: async (userId) => {
    const response = await api.post(`/api/admin/users/${userId}/resend-access`);
    return response.data;
  }
};

// --- SERVIÇO DE DASHBOARD (O QUE FALTAVA!) ---
export const dashboardService = {
  getStats: async (botId) => {
    const response = await api.get(`/api/admin/dashboard/stats?bot_id=${botId}`);
    return response.data;
  }
};