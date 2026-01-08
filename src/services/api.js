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
  // NOVA FUNÇÃO: ATUALIZAR BOT (Token/ID)
  updateBot: async (botId, dados) => {
    const response = await api.put(`/api/admin/bots/${botId}`, dados);
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
  deletePlan: async (planId) => {
    const response = await api.delete(`/api/admin/plans/${planId}`);
    return response.data;
  }
};

// --- SERVIÇO DE INTEGRAÇÕES ---
export const integrationService = {
  getPushinStatus: async () => {
    const response = await api.get('/api/admin/integrations/pushinpay');
    return response.data;
  },
  savePushinToken: async (token) => {
    const response = await api.post('/api/admin/integrations/pushinpay', { token });
    return response.data;
  }
};

// --- SERVIÇO DE REMARKETING ---
export const remarketingService = {
  send: async (dados, isTest = false) => {
    const payload = { ...dados, is_test: isTest };
    const response = await api.post('/api/admin/remarketing/send', payload);
    return response.data;
  },
  getHistory: async (botId) => {
    const response = await api.get(`/api/admin/remarketing/history/${botId}`);
    return response.data;
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

// --- SERVIÇO DE CRM ---
export const crmService = {
  getContacts: async (filtro = 'todos') => {
    const response = await api.get(`/api/admin/contacts?status=${filtro}`);
    return response.data;
  }
};

// --- SERVIÇO DE DASHBOARD ---
export const dashboardService = {
  getStats: async (botId = null) => {
    // Se passar botId, adiciona na URL, senão busca geral
    const url = botId ? `/api/admin/dashboard/stats?bot_id=${botId}` : '/api/admin/dashboard/stats';
    const response = await api.get(url);
    return response.data;
  }
};

export default api;