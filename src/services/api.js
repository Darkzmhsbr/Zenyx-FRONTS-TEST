import axios from 'axios';

// 🔗 SEU DOMÍNIO DO RAILWAY (Backend Python)
const API_URL = 'https://zenyx-gbs-production.up.railway.app';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- INTERCEPTOR DE ERROS ---
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
  createBot: async (dados) => {
    const response = await api.post('/api/admin/bots', dados);
    return response.data;
  },
  listBots: async () => {
    const response = await api.get('/api/admin/bots');
    return response.data;
  },
  getBot: async (botId) => {
    const response = await api.get(`/api/admin/bots/${botId}`);
    return response.data;
  },
  updateBot: async (botId, dados) => {
    const response = await api.put(`/api/admin/bots/${botId}`, dados);
    return response.data;
  },
  toggleBot: async (botId) => {
    const response = await api.post(`/api/admin/bots/${botId}/toggle`);
    return response.data;
  },
  deleteBot: async (botId) => {
    const response = await api.delete(`/api/admin/bots/${botId}`);
    return response.data;
  }
};

// --- SERVIÇO DE PLANOS ---
export const planService = {
  listPlans: async (botId) => {
    const response = await api.get(`/api/admin/plans/${botId}`);
    return response.data;
  },
  savePlan: async (plan) => {
    const response = await api.post('/api/admin/plans', plan);
    return response.data;
  },
  deletePlan: async (planId) => {
    const response = await api.delete(`/api/admin/plans/${planId}`);
    return response.data;
  }
};

// --- SERVIÇO DE REMARKETING ---
export const remarketingService = {
  send: async (dados) => {
    const response = await api.post('/api/admin/remarketing/send', dados);
    return response.data;
  },
  getHistory: async (botId) => {
    try {
        const response = await api.get(`/api/admin/remarketing/history/${botId}`);
        return response.data;
    } catch (error) {
        return [];
    }
  }
};

// --- SERVIÇO DE CRM (CORRIGIDO PARA RECEBER BOT_ID) ---
export const crmService = {
  getContacts: async (botId, filter = 'todos', page = 1) => {
    // Agora passamos o bot_id na URL
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

// --- SERVIÇO DE DASHBOARD ---
export const dashboardService = {
  getStats: async (botId) => {
    const response = await api.get(`/api/admin/dashboard/stats?bot_id=${botId}`);
    return response.data;
  }
};

// --- SERVIÇO DE INTEGRAÇÕES (Corrigido erro atual) ---
export const integrationService = {
  getConfig: async () => {
    const response = await api.get('/api/admin/config');
    return response.data;
  },
  saveConfig: async (data) => {
    const response = await api.post('/api/admin/config', data);
    return response.data;
  }
};

// --- ADMIN (ALIAS PARA COMPATIBILIDADE) ---
export const admin = crmService;

export default api;