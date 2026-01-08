import axios from 'axios';

// 🔗 SEU DOMÍNIO DO RAILWAY
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
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// --- SERVIÇO DE BOTS ---
export const botService = {
  createBot: async (d) => (await api.post('/api/admin/bots', d)).data,
  listBots: async () => (await api.get('/api/admin/bots')).data,
  getBot: async (id) => (await api.get(`/api/admin/bots/${id}`)).data,
  updateBot: async (id, d) => (await api.put(`/api/admin/bots/${id}`, d)).data,
  toggleBot: async (id) => (await api.post(`/api/admin/bots/${id}/toggle`)).data,
  deleteBot: async (id) => (await api.delete(`/api/admin/bots/${id}`)).data
};

// --- SERVIÇO DE FLUXO ---
export const flowService = {
  getFlow: async (id) => (await api.get(`/api/admin/bots/${id}/flow`)).data,
  saveFlow: async (id, d) => (await api.post(`/api/admin/bots/${id}/flow`, d)).data
};

// --- SERVIÇO DE PLANOS ---
export const planService = {
  listPlans: async (id) => (await api.get(`/api/admin/plans/${id}`)).data,
  savePlan: async (p) => (await api.post('/api/admin/plans', p)).data,
  deletePlan: async (id) => (await api.delete(`/api/admin/plans/${id}`)).data
};

// --- SERVIÇO DE REMARKETING ---
export const remarketingService = {
  send: async (d) => (await api.post('/api/admin/remarketing/send', d)).data,
  getHistory: async (id) => {
    try { return (await api.get(`/api/admin/remarketing/history/${id}`)).data; } 
    catch { return []; }
  }
};

// --- SERVIÇO DE DASHBOARD ---
export const dashboardService = {
  getStats: async (botId) => {
    const response = await api.get(`/api/admin/dashboard/stats?bot_id=${botId}`);
    return response.data;
  }
};

// --- SERVIÇO DE INTEGRAÇÕES ---
export const integrationService = {
  getConfig: async () => (await api.get('/api/admin/config')).data,
  saveConfig: async (d) => (await api.post('/api/admin/config', d)).data
};

// --- SERVIÇO DE CRM (CORRIGIDO) ---
export const crmService = {
  // Agora aceita botId explicitamente
  getContacts: async (botId, filter = 'todos', page = 1) => {
    const response = await api.get(`/api/admin/contacts?bot_id=${botId}&status=${filter}&page=${page}`);
    return response.data;
  },
  updateUser: async (userId, data) => (await api.put(`/api/admin/users/${userId}`, data)).data,
  resendAccess: async (userId) => (await api.post(`/api/admin/users/${userId}/resend-access`)).data
};

// --- ADMIN (Alias) ---
export const admin = crmService;

export default api;