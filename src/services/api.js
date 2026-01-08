import axios from 'axios';

// 🔗 SEU DOMÍNIO DO RAILWAY
const API_URL = 'https://zenyx-gbs-production.up.railway.app';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Erros
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

// --- SERVIÇO DE ADMINISTRADORES (Recuperado da sua versão antiga) ---
export const adminService = {
  listAdmins: async (botId) => {
    try {
        const response = await api.get(`/api/admin/bots/${botId}/admins`);
        return response.data;
    } catch { return []; } // Fallback seguro
  },
  addAdmin: async (botId, dados) => {
    const response = await api.post(`/api/admin/bots/${botId}/admins`, dados);
    return response.data;
  },
  removeAdmin: async (botId, telegramId) => {
    const response = await api.delete(`/api/admin/bots/${botId}/admins/${telegramId}`);
    return response.data;
  }
};

// --- SERVIÇO DE PLANOS ---
export const planService = {
  createPlan: async (dados) => {
    const response = await api.post('/api/admin/plans', dados);
    return response.data;
  },
  listPlans: async (botId) => {
    const response = await api.get(`/api/admin/plans/${botId}`);
    return response.data;
  },
  savePlan: async (plan) => { // Alias para compatibilidade
    return planService.createPlan(plan);
  },
  deletePlan: async (planId) => {
    const response = await api.delete(`/api/admin/plans/${planId}`);
    return response.data;
  }
};

// --- SERVIÇO DE INTEGRAÇÕES ---
export const integrationService = {
  getPushinStatus: async () => {
    try { return (await api.get('/api/admin/integrations/pushinpay')).data; }
    catch { return { status: 'disconnected' }; }
  },
  savePushinToken: async (token) => {
    return (await api.post('/api/admin/integrations/pushinpay', { token })).data;
  },
  // Alias para compatibilidade com o Integrations.jsx novo
  getConfig: async () => (await api.get('/api/admin/config')).data,
  saveConfig: async (d) => (await api.post('/api/admin/config', d)).data
};

// --- SERVIÇO DE REMARKETING ---
export const remarketingService = {
  send: async (dados, isTest = false) => {
    const payload = { ...dados, is_test: isTest };
    const response = await api.post('/api/admin/remarketing/send', payload);
    return response.data;
  },
  getHistory: async (botId) => {
    try {
        const response = await api.get(`/api/admin/remarketing/history/${botId}`);
        return response.data;
    } catch { return []; }
  },
  getStatus: async () => {
    const response = await api.get('/api/admin/remarketing/status');
    return response.data;
  }
};

// --- SERVIÇO DE FLUXO ---
export const flowService = {
  getFlow: async (botId) => {
    const response = await api.get(`/api/admin/bots/${botId}/flow`);
    return response.data;
  },
  saveFlow: async (botId, dados) => {
    const response = await api.post(`/api/admin/bots/${botId}/flow`, dados);
    return response.data;
  }
};

// --- SERVIÇO DE CRM (Híbrido: Suporta filtro antigo e novo com botId) ---
export const crmService = {
  getContacts: async (botIdOrFilter, filter = 'todos', page = 1) => {
    // Se o primeiro argumento for número, é botId (Novo). Se for string, é filtro (Velho).
    let url = '';
    if (typeof botIdOrFilter === 'number') {
        url = `/api/admin/contacts?bot_id=${botIdOrFilter}&status=${filter}&page=${page}`;
    } else {
        url = `/api/admin/contacts?status=${botIdOrFilter || 'todos'}`;
    }
    const response = await api.get(url);
    return response.data;
  },
  updateUser: async (userId, data) => (await api.put(`/api/admin/users/${userId}`, data)).data,
  resendAccess: async (userId) => (await api.post(`/api/admin/users/${userId}/resend-access`)).data
};

// --- SERVIÇO DE DASHBOARD ---
export const dashboardService = {
  getStats: async (botId = null) => {
    const url = botId ? `/api/admin/dashboard/stats?bot_id=${botId}` : '/api/admin/dashboard/stats';
    const response = await api.get(url);
    return response.data;
  }
};

// --- ADMIN (Alias crítico para o Contacts.jsx novo funcionar) ---
export const admin = {
  getUsers: crmService.getContacts,
  updateUser: crmService.updateUser,
  resendAccess: crmService.resendAccess
};

export default api;