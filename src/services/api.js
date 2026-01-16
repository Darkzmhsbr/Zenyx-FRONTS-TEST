import axios from 'axios';

// 🔗 SEU DOMÍNIO DO RAILWAY
const API_URL = 'https://zenyx-gbs-testes-production.up.railway.app';

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
  createBot : async ( dados ) => {    
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
  listPlans: async (id) => (await api.get(`/api/admin/bots/${id}/plans`)).data, 
  savePlan: async (p) => (await api.post('/api/admin/plans', p)).data,
  createPlan: async (botId, dados) => (await api.post(`/api/admin/bots/${botId}/plans`, dados)).data,
  updatePlan: async (id, dados) => (await api.put(`/api/admin/plans/${id}`, dados)).data,
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
    return (await api.post(`/api/admin/bots/${botId}/remarketing/send`, payload)).data;
  },
  
  getHistory: async (id, page = 1, perPage = 10) => {
    try { 
        return (await api.get(`/api/admin/bots/${id}/remarketing/history?page=${page}&limit=${perPage}`)).data; 
    } catch { 
        return { data: [], total: 0, page: 1, per_page: perPage, total_pages: 0 }; 
    }
  },
  
  deleteHistory: async (historyId) => {
    return (await api.delete(`/api/admin/remarketing/history/${historyId}`)).data;
  },
  
  sendIndividual: async (botId, telegramId, historyId) => {
    try {
      const response = await api.post(`/api/admin/bots/${botId}/remarketing/send-individual`, {
        user_id: String(telegramId),
        history_id: parseInt(historyId)
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao enviar remarketing individual:', error.response?.data || error.message);
      throw error;
    }
  }
};

// ============================================================
// 🔥 FLOW V2
// ============================================================
export const flowService = {
  getFlow: async (botId) => {
    try { return (await api.get(`/api/admin/bots/${botId}/flow`)).data; } 
    catch { return null; }
  },
  
  saveFlow: async (botId, data) => {
    return (await api.post(`/api/admin/bots/${botId}/flow`, data)).data;
  },
  
  getSteps: async (botId) => {
    try { return (await api.get(`/api/admin/bots/${botId}/flow/steps`)).data; } 
    catch { return []; }
  },
  
  addStep: async (botId, stepData) => {
    return (await api.post(`/api/admin/bots/${botId}/flow/steps`, stepData)).data;
  },
  
  updateStep: async (botId, stepId, stepData) => {
    return (await api.put(`/api/admin/bots/${botId}/flow/steps/${stepId}`, stepData)).data;
  },
  
  deleteStep: async (botId, stepId) => {
    return (await api.delete(`/api/admin/bots/${botId}/flow/steps/${stepId}`)).data;
  }
};

// ============================================================
// 👥 CRM / CONTATOS
// ============================================================
export const crmService = {
  getContacts: async (botId, filter = 'todos', page = 1, perPage = 50) => {
    const params = new URLSearchParams({
      status: filter,
      page: page.toString(),
      per_page: perPage.toString()
    });
    
    if (botId) params.append('bot_id', botId);
    
    try {
      const response = await api.get(`/api/admin/contacts?${params.toString()}`);
      return response.data;
    } catch (error) {
      return { data: [], total: 0, page: 1, per_page: perPage, total_pages: 0 };
    }
  },
  
  getLeads: async (botId, page = 1, perPage = 50) => {
    const params = new URLSearchParams({ page: page.toString(), per_page: perPage.toString() });
    if (botId) params.append('bot_id', botId);
    
    try {
      return (await api.get(`/api/admin/leads?${params.toString()}`)).data;
    } catch (error) {
      return { data: [], total: 0, page: 1, per_page: perPage, total_pages: 0 };
    }
  },
  
  getFunnelStats: async (botId) => {
    try {
      const url = botId ? `/api/admin/contacts/funnel-stats?bot_id=${botId}` : '/api/admin/contacts/funnel-stats';
      return (await api.get(url)).data;
    } catch (error) {
      return { topo: 0, meio: 0, fundo: 0, expirados: 0, total: 0 };
    }
  },
  
  updateUser: async (userId, data) => (await api.put(`/api/admin/users/${userId}`, data)).data,
  resendAccess: async (userId) => (await api.post(`/api/admin/users/${userId}/resend-access`)).data
};

// Alias
export const admin = crmService;
export const leadService = crmService;

export const adminService = {
    listAdmins: async (id) => { 
      try { return (await api.get(`/api/admin/bots/${id}/admins`)).data } catch { return [] } 
    },
    addAdmin: async (id, d) => (await api.post(`/api/admin/bots/${id}/admins`, d)).data,
    updateAdmin: async (botId, adminId, d) => (await api.put(`/api/admin/bots/${botId}/admins/${adminId}`, d)).data,
    removeAdmin: async (id, tId) => (await api.delete(`/api/admin/bots/${id}/admins/${tId}`)).data
};

export const dashboardService = { 
  getStats: async (id = null, startDate = null, endDate = null) => {
    const params = new URLSearchParams();
    if (id) params.append('bot_id', id);
    if (startDate) params.append('start_date', startDate.toISOString());
    if (endDate) params.append('end_date', endDate.toISOString());
    return (await api.get(`/api/admin/dashboard/stats?${params.toString()}`)).data;
  }
};

export const integrationService = { 
    getConfig: async () => (await api.get('/api/admin/config')).data,
    saveConfig: async (d) => (await api.post('/api/admin/config', d)).data,
    getPushinStatus: async () => {
        try { return (await api.get('/api/admin/integrations/pushinpay')).data; } 
        catch { return { status: 'desconectado' }; }
    },
    savePushinToken: async (token) => (await api.post('/api/admin/integrations/pushinpay', { token })).data
};

export const orderBumpService = {
  get: async (botId) => {
    try { return (await api.get(`/api/admin/bots/${botId}/order-bump`)).data; } catch { return null; }
  },
  save: async (botId, data) => (await api.post(`/api/admin/bots/${botId}/order-bump`, data)).data
};

export const profileService = {
  get: async () => (await api.get('/api/admin/profile')).data,
  update: async (data) => (await api.post('/api/admin/profile', data)).data
};

export const trackingService = {
  listFolders: async () => (await api.get('/api/admin/tracking/folders')).data,
  createFolder: async (data) => (await api.post('/api/admin/tracking/folders', data)).data,
  deleteFolder: async (folderId) => (await api.delete(`/api/admin/tracking/folders/${folderId}`)).data,
  listLinks: async (folderId) => (await api.get(`/api/admin/tracking/links/${folderId}`)).data,
  createLink: async (data) => (await api.post('/api/admin/tracking/links', data)).data,
  deleteLink: async (linkId) => (await api.delete(`/api/admin/tracking/links/${linkId}`)).data
};

// 🔥 [NOVO] SERVIÇO DE MINI APP (TEMPLATE PERSONALIZÁVEL)
export const miniappService = {
  // Configuração Global (Admin)
  saveConfig: async (botId, data) => (await api.post(`/api/admin/bots/${botId}/miniapp/config`, data)).data,
  
  // Categorias (Admin)
  listCategories: async (botId) => (await api.get(`/api/admin/bots/${botId}/miniapp/categories`)).data,
  createCategory: async (data) => (await api.post(`/api/admin/miniapp/categories`, data)).data,
  deleteCategory: async (catId) => (await api.delete(`/api/admin/miniapp/categories/${catId}`)).data,
  
  // Troca de Modo (Tradicional vs Mini App)
  switchMode: async (botId, mode) => (await api.post(`/api/admin/bots/${botId}/mode`, { modo: mode })).data,
  
  // PÚBLICO (Usado pela loja final)
  getPublicData: async (botId) => (await api.get(`/api/miniapp/${botId}`)).data
};

export default api;