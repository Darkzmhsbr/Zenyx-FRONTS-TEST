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
  
  // Mantemos o savePlan (caso algo novo use)
  savePlan: async (p) => (await api.post('/api/admin/plans', p)).data,
  
  // ADICIONADO: O createPlan que o seu Frontend antigo está procurando
  createPlan: async (dados) => (await api.post('/api/admin/plans', dados)).data,
  
  deletePlan: async (id) => (await api.delete(`/api/admin/plans/${id}`)).data
};

// --- REMARKETING (ATUALIZADO COM DISPARO INDIVIDUAL) ---
export const remarketingService = {
  send: async (d) => (await api.post('/api/admin/remarketing/send', d)).data,
  
  getHistory: async (id) => {
    try { return (await api.get(`/api/admin/remarketing/history/${id}`)).data; } catch { return []; }
  },

  // [NOVA FUNÇÃO] Envia uma campanha do histórico para um usuário específico
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

// --- CRM / CONTATOS ---
export const crmService = {
  getContacts: async (botId, filter = 'todos') => {
    // Agora enviamos o bot_id na URL para filtrar corretamente
    const url = botId 
        ? `/api/admin/contacts?bot_id=${botId}&status=${filter}` 
        : `/api/admin/contacts?status=${filter}`;
    const response = await api.get(url);
    return response.data;
  },
  updateUser: async (userId, data) => (await api.put(`/api/admin/users/${userId}`, data)).data,
  resendAccess: async (userId) => (await api.post(`/api/admin/users/${userId}/resend-access`)).data
};

// --- ADMIN & DASHBOARD & INTEGRATION (Para evitar erro de Build) ---
export const admin = crmService; // Alias
export const adminService = { // Alias para admins do bot
    listAdmins: async (id) => { try { return (await api.get(`/api/admin/bots/${id}/admins`)).data } catch { return [] } },
    addAdmin: async (id, d) => (await api.post(`/api/admin/bots/${id}/admins`, d)).data,
    removeAdmin: async (id, tId) => (await api.delete(`/api/admin/bots/${id}/admins/${tId}`)).data
};
export const dashboardService = { getStats: async (id) => (await api.get(`/api/admin/dashboard/stats?bot_id=${id}`)).data };

// [CORREÇÃO AQUI] Adicionadas as rotas da Pushin Pay que faltavam
export const integrationService = { 
    getConfig: async () => (await api.get('/api/admin/config')).data,
    saveConfig: async (d) => (await api.post('/api/admin/config', d)).data,

    // --- MÉTODOS PUSHIN PAY ---
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
        // Envia o objeto JSON { token: "..." } para o backend
        const response = await api.post('/api/admin/integrations/pushinpay', { token });
        return response.data;
    }
};

export default api;
