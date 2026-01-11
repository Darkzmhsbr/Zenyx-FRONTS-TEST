import axios from 'axios';

// 🔗 SEU DOMÍNIO DO RAILWAY (Ajuste se necessário)
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

// --- PLANOS ---
export const planService = {
  listPlans: async (id) => (await api.get(`/api/admin/plans/${id}`)).data,
  savePlan: async (p) => (await api.post('/api/admin/plans', p)).data,
  createPlan: async (dados) => (await api.post('/api/admin/plans', dados)).data,
  deletePlan: async (id) => (await api.delete(`/api/admin/plans/${id}`)).data
};

// ============================================================
// 📢 SERVIÇO DE REMARKETING
// ============================================================
export const remarketingService = {
  send: async (botId, data, isTest = false, specificUserId = null) => {
    const payload = {
      bot_id: botId,
      target: data.target || 'todos',
      mensagem: data.mensagem,
      media_url: data.media_url,
      incluir_oferta: data.incluir_oferta,
      plano_oferta_id: data.plano_oferta_id,
      price_mode: data.price_mode || 'original',
      custom_price: data.custom_price ? parseFloat(data.custom_price) : 0.0,
      expiration_mode: data.expiration_mode || 'none',
      expiration_value: data.expiration_value ? parseInt(data.expiration_value) : 0,
      is_test: isTest,
      specific_user_id: specificUserId
    };
    return (await api.post('/api/admin/remarketing/send', payload)).data;
  },
  getHistory: async (id) => {
    try { 
        return (await api.get(`/api/admin/remarketing/history/${id}`)).data; 
    } catch { 
        return []; 
    }
  },
  sendIndividual: async (botId, telegramId, historyId) => {
    return (await api.post('/api/admin/remarketing/send-individual', {
        bot_id: botId,
        user_telegram_id: telegramId,
        campaign_history_id: historyId
    })).data;
  }
};

// ============================================================
// 🔥 [ATUALIZADO V3] FLOW V2 (Passos Dinâmicos + Edição)
// ============================================================
export const flowService = {
  getFlow: async (botId) => {
    try { return (await api.get(`/api/admin/bots/${botId}/flow`)).data; } 
    catch { return null; }
  },
  
  saveFlow: async (botId, data) => {
    return (await api.post(`/api/admin/bots/${botId}/flow`, data)).data;
  },
  
  // Listar passos
  getSteps: async (botId) => {
    try { return (await api.get(`/api/admin/bots/${botId}/flow/steps`)).data; } 
    catch { return []; }
  },
  
  // Adicionar passo
  addStep: async (botId, stepData) => {
    return (await api.post(`/api/admin/bots/${botId}/flow/steps`, stepData)).data;
  },
  
  // [NOVO V3] Editar passo
  updateStep: async (botId, stepId, stepData) => {
    return (await api.put(`/api/admin/bots/${botId}/flow/steps/${stepId}`, stepData)).data;
  },
  
  // Deletar passo
  deleteStep: async (botId, stepId) => {
    return (await api.delete(`/api/admin/bots/${botId}/flow/steps/${stepId}`)).data;
  }
};

// --- CRM / CONTATOS ---
export const crmService = {
  getContacts: async (botId, filter = 'todos') => {
    const url = botId 
        ? `/api/admin/contacts?bot_id=${botId}&status=${filter}` 
        : `/api/admin/contacts?status=${filter}`;
    const response = await api.get(url);
    return response.data;
  },
  updateUser: async (userId, data) => (await api.put(`/api/admin/users/${userId}`, data)).data,
  resendAccess: async (userId) => (await api.post(`/api/admin/users/${userId}/resend-access`)).data
};

// --- ADMIN & DASHBOARD & INTEGRATION ---
export const admin = crmService;
export const adminService = {
    listAdmins: async (id) => { try { return (await api.get(`/api/admin/bots/${id}/admins`)).data } catch { return [] } },
    addAdmin: async (id, d) => (await api.post(`/api/admin/bots/${id}/admins`, d)).data,
    removeAdmin: async (id, tId) => (await api.delete(`/api/admin/bots/${id}/admins/${tId}`)).data
};
export const dashboardService = { getStats: async (id) => (await api.get(`/api/admin/dashboard/stats?bot_id=${id}`)).data };

export const integrationService = { 
    getConfig: async () => (await api.get('/api/admin/config')).data,
    saveConfig: async (d) => (await api.post('/api/admin/config', d)).data,
    getPushinStatus: async () => {
        try {
            const response = await api.get('/api/admin/integrations/pushinpay');
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar status PushinPay", error);
            return { status: 'desconectado' };
        }
    },
    savePushinToken: async (token) => {
        const response = await api.post('/api/admin/integrations/pushinpay', { token });
        return response.data;
    }
};

export default api;
