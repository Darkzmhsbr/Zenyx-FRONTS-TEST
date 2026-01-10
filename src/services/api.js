import axios from 'axios';

// 🔗 SEU DOMÍNIO DO RAILWAY (Certifique-se que está sem a barra no final)
const API_URL = 'https://zenyx-gbs-production.up.railway.app';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  r => r,
  e => Promise.reject(e)
);

// --- SERVIÇO DE BOTS ---
export const botService = {  
  criarBot : async ( dados ) => {    
    const response = await api.post ( '/api/admin/bots' , dados ) ; 
    return response.data ;
  } ,
  listBots : async ( ) => {    
    const response = await api.get ( '/api/admin/bots' ) ; 
    return response.data ;
  } ,
  getBot : async ( botId ) => {    
    const response = await api.get ( `/api/admin/bots/${botId}` ) ; 
    return response.data ;
  } ,
  updateBot : async ( botId , dados ) => {    
    const response = await api.put ( `/api/admin/bots/${botId}` , dados ) ; 
    return response.data ;
  } ,
  toggleBot : async ( botId ) => {    
    const response = await api.post ( `/api/admin/bots/${botId}/toggle` ) ; 
    return response.data ;
  } ,
  deleteBot : async ( botId ) => {    
    const response = await api.delete ( `/api/admin/bots/${botId}` ) ; 
    return response.data ;
  }
} ;

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

// --- REMARKETING (ATUALIZADO COM DISPARO INDIVIDUAL) ---
export const remarketingService = {
  send: async (d) => (await api.post('/api/admin/remarketing/send', d)).data,
  
  getHistory: async (id) => {
    try { return (await api.get(`/api/admin/remarketing/history/${id}`)).data; } catch { return []; }
  },

  // [FUNÇÃO CRÍTICA PARA O MODAL DE CONTATOS]
  sendIndividual: async (botId, telegramId, historyId) => {
    return (await api.post('/api/admin/remarketing/send-individual', {
        bot_id: botId,
        user_telegram_id: telegramId,
        campaign_history_id: historyId
    })).data;
  }
};

// --- FLUXO ---
export const flowService = {
  getFlow: async (id) => (await api.get(`/api/admin/bots/${id}/flow`)).data,
  saveFlow: async (id, d) => (await api.post(`/api/admin/bots/${id}/flow`, d)).data
};

// --- SERVIÇO DE CRM (ATUALIZADO) ---
export const crmService = {
  getContacts: async (filtro = 'todos') => {
    const response = await api.get(`/api/admin/contacts?status=${filtro}`);
    return response.data;
  },
  // NOVOS MÉTODOS:
  updateUser: async (userId, data) => {
    const response = await api.put(`/api/admin/users/${userId}`, data);
    return response.data;
  },
  resendAccess: async (userId) => {
    const response = await api.post(`/api/admin/users/${userId}/resend-access`);
    return response.data;
  }
};

// --- ADMIN & DASHBOARD ---
export const admin = crmService; // Alias
export const adminService = { 
    listAdmins: async (id) => { try { return (await api.get(`/api/admin/bots/${id}/admins`)).data } catch { return [] } },
    addAdmin: async (id, d) => (await api.post(`/api/admin/bots/${id}/admins`, d)).data,
    removeAdmin: async (id, tId) => (await api.delete(`/api/admin/bots/${id}/admins/${tId}`)).data
};
export const dashboardService = { getStats: async (id) => (await api.get(`/api/admin/dashboard/stats?bot_id=${id || ''}`)).data };

// --- INTEGRAÇÕES (PUSHIN PAY) ---
export const integrationService = { 
    getConfig: async () => (await api.get('/api/admin/config')).data,
    saveConfig: async (d) => (await api.post('/api/admin/config', d)).data,

    getPushinStatus: async () => {
        try {
            const response = await api.get('/api/admin/integrations/pushinpay');
            return response.data;
        } catch (error) {
            console.error("Erro status PushinPay", error);
            return { status: 'desconectado' };
        }
    },
    savePushinToken: async (token) => {
        const response = await api.post('/api/admin/integrations/pushinpay', { token });
        return response.data;
    }
};

export default api;
