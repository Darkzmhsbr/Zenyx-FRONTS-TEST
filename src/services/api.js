import axios from 'axios';

// 🔗 SEU DOMÍNIO DO RAILWAY
const API_URL = 'https://zenyx-gbs-production.up.railway.app';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para debug
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
  createBot: async (d) => (await api.post('/api/admin/bots', d)).data,
  listBots: async () => (await api.get('/api/admin/bots')).data,
  getBot: async (id) => (await api.get(`/api/admin/bots/${id}`)).data,
  updateBot: async (id, d) => (await api.put(`/api/admin/bots/${id}`, d)).data,
  toggleBot: async (id) => (await api.post(`/api/admin/bots/${id}/toggle`)).data,
  deleteBot: async (id) => (await api.delete(`/api/admin/bots/${id}`)).data
};

// --- SERVIÇO DE ADMINISTRADORES (Recuperado para o BotConfig) ---
export const adminService = {
  listAdmins: async (botId) => {
    try { return (await api.get(`/api/admin/bots/${botId}/admins`)).data; } 
    catch { return []; }
  },
  addAdmin: async (botId, d) => (await api.post(`/api/admin/bots/${botId}/admins`, d)).data,
  removeAdmin: async (botId, tId) => (await api.delete(`/api/admin/bots/${botId}/admins/${tId}`)).data
};

// --- SERVIÇO DE FLUXO (Recuperado para o ChatFlow) ---
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

// --- SERVIÇO DE INTEGRAÇÕES (Recuperado para Integrations) ---
export const integrationService = {
  getConfig: async () => (await api.get('/api/admin/config')).data,
  saveConfig: async (d) => (await api.post('/api/admin/config', d)).data,
  getPushinStatus: async () => { try { return (await api.get('/api/admin/integrations/pushinpay')).data; } catch { return { status: 'disconnected'}; } },
  savePushinToken: async (t) => (await api.post('/api/admin/integrations/pushinpay', { token: t })).data
};

// --- SERVIÇO DE DASHBOARD ---
export const dashboardService = {
  getStats: async (botId) => {
    const url = botId ? `/api/admin/dashboard/stats?bot_id=${botId}` : '/api/admin/dashboard/stats';
    return (await api.get(url)).data;
  }
};

// --- SERVIÇO DE CRM (CONTATOS) ---
export const crmService = {
  getContacts: async (botId, filter = 'todos', page = 1) => {
    // URL Híbrida: Aceita tanto o formato novo (com bot_id) quanto evita quebrar se faltar
    const url = `/api/admin/contacts?bot_id=${botId}&status=${filter}&page=${page}`;
    const response = await api.get(url);
    return response.data;
  },
  updateUser: async (userId, data) => (await api.put(`/api/admin/users/${userId}`, data)).data,
  resendAccess: async (userId) => (await api.post(`/api/admin/users/${userId}/resend-access`)).data
};

// --- ADMIN (Alias para compatibilidade) ---
export const admin = crmService;

export default api;