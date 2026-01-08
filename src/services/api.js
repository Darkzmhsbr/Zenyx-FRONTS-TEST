import axios from 'axios';

// 🔗 SEU DOMÍNIO DO RAILWAY (Backend Python)
// Certifique-se de que esta URL está correta e sem a barra '/' no final
const API_URL = 'https://zenyx-gbs-production.up.railway.app';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- INTERCEPTOR DE ERROS (Útil para debug) ---
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 422) {
      console.error("❌ ERRO 422 (Dados Inválidos no Envio):", error.response.data);
    }
    return Promise.reject(error);
  }
);

// ============================================================
// SERVIÇOS DO SISTEMA
// ============================================================

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

// --- SERVIÇO DE FLUXO (BOAS-VINDAS) ---
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

// --- SERVIÇO DE CRM (LEGADO - Mantido para compatibilidade) ---
export const crmService = {
  getContacts: async (botId, filter = 'todos', page = 1) => {
    const response = await api.get(`/api/admin/contacts?bot_id=${botId}&status=${filter}&page=${page}`);
    return response.data;
  }
};

// ============================================================
// 🚨 NOVO SERVIÇO ADMIN (CORREÇÃO DO ERRO VERCEL)
// ============================================================
export const admin = {
  // Busca usuários com paginação e filtros (Usa a mesma rota do crmService, mas centralizado aqui)
  getUsers: async (botId, filter, page) => {
    const response = await api.get(`/api/admin/contacts?bot_id=${botId}&status=${filter}&page=${page}`);
    return response.data;
  },
  
  // Atualiza status ou expiração do usuário
  updateUser: async (userId, data) => {
    const response = await api.put(`/api/admin/users/${userId}`, data);
    return response.data;
  },
  
  // Reenvia link de acesso
  resendAccess: async (userId) => {
    const response = await api.post(`/api/admin/users/${userId}/resend-access`);
    return response.data;
  }
};