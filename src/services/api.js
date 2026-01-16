import axios from 'axios';

// 🔗 SEU DOMÍNIO DO RAILWAY (Ajuste se necessário)
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
  listPlans: async (id) => (await api.get(`/api/admin/bots/${id}/plans`)).data, // Ajustado para rota correta de bots
  savePlan: async (p) => (await api.post('/api/admin/plans', p)).data,
  createPlan: async (botId, dados) => (await api.post(`/api/admin/bots/${botId}/plans`, dados)).data, // Ajustado assinatura
  updatePlan: async (id, dados) => (await api.put(`/api/admin/plans/${id}`, dados)).data,
  deletePlan: async (id) => (await api.delete(`/api/admin/plans/${id}`)).data
};

// ============================================================
// 📢 SERVIÇO DE REMARKETING (CORRIGIDO)
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
  
  // 🔥 [CORRIGIDO] Função de envio individual
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
// 🔥 FLOW V2 (Passos Dinâmicos + Edição)
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
// 👥 CRM / CONTATOS (CORRIGIDO - AGORA UNIFICA LEADS + PEDIDOS)
// ============================================================
export const crmService = {
  // 🔥 [CORRIGIDO] Agora busca leads + pedidos quando filter='todos'
  getContacts: async (botId, filter = 'todos', page = 1, perPage = 50) => {
    const params = new URLSearchParams({
      status: filter,
      page: page.toString(),
      per_page: perPage.toString()
    });
    
    if (botId) {
      params.append('bot_id', botId);
    }
    
    try {
      const url = `/api/admin/contacts?${params.toString()}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar contatos:', error);
      return { 
        data: [], 
        total: 0, 
        page: 1, 
        per_page: perPage, 
        total_pages: 0 
      };
    }
  },
  
  // Buscar apenas leads (TOPO do funil)
  getLeads: async (botId, page = 1, perPage = 50) => {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString()
    });
    
    if (botId) {
      params.append('bot_id', botId);
    }
    
    const url = `/api/admin/leads?${params.toString()}`;
    try {
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar leads:', error);
      return { data: [], total: 0, page: 1, per_page: perPage, total_pages: 0 };
    }
  },
  
  // Estatísticas do funil
  getFunnelStats: async (botId) => {
    try {
      const url = botId 
        ? `/api/admin/contacts/funnel-stats?bot_id=${botId}`
        : '/api/admin/contacts/funnel-stats';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas do funil:', error);
      return {
        topo: 0,
        meio: 0,
        fundo: 0,
        expirados: 0,
        total: 0
      };
    }
  },
  
  updateUser: async (userId, data) => {
    try {
      return (await api.put(`/api/admin/users/${userId}`, data)).data;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  },
  
  resendAccess: async (userId) => {
    try {
      return (await api.post(`/api/admin/users/${userId}/resend-access`)).data;
    } catch (error) {
      console.error('Erro ao reenviar acesso:', error);
      throw error;
    }
  }
};

// Alias para manter compatibilidade
export const admin = crmService;
export const leadService = crmService; // Fallback se alguém usar leadService

export const adminService = {
    listAdmins: async (id) => { 
      try { 
        return (await api.get(`/api/admin/bots/${id}/admins`)).data 
      } catch { 
        return [] 
      } 
    },
    addAdmin: async (id, d) => (await api.post(`/api/admin/bots/${id}/admins`, d)).data,
    
    // 🔥 [NOVO] Função para atualizar admin existente
    updateAdmin: async (botId, adminId, d) => (await api.put(`/api/admin/bots/${botId}/admins/${adminId}`, d)).data,
    
    removeAdmin: async (id, tId) => (await api.delete(`/api/admin/bots/${id}/admins/${tId}`)).data
};

export const dashboardService = { 
  // Agora aceita startDate e endDate (opcionais)
  getStats: async (id = null, startDate = null, endDate = null) => {
    // Cria os parâmetros de URL
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

// 🔥 [NOVO] SERVIÇO DE ORDER BUMP (OFERTAS EXTRAS)
export const orderBumpService = {
  get: async (botId) => {
    try {
      return (await api.get(`/api/admin/bots/${botId}/order-bump`)).data;
    } catch {
      return null;
    }
  },
  save: async (botId, data) => {
    return (await api.post(`/api/admin/bots/${botId}/order-bump`, data)).data;
  }
};

// 🔥 [NOVO] SERVIÇO DE PERFIL & CONQUISTAS
export const profileService = {
  get: async () => {
    return (await api.get('/api/admin/profile')).data;
  },
  update: async (data) => {
    return (await api.post('/api/admin/profile', data)).data;
  }
};

// 🔥 [NOVO] SERVIÇO DE RASTREAMENTO (TRACKING LINKS)
export const trackingService = {
  // Pastas
  listFolders: async () => (await api.get('/api/admin/tracking/folders')).data,
  createFolder: async (data) => (await api.post('/api/admin/tracking/folders', data)).data,
  deleteFolder: async (folderId) => (await api.delete(`/api/admin/tracking/folders/${folderId}`)).data,
  
  // Links
  listLinks: async (folderId) => (await api.get(`/api/admin/tracking/links/${folderId}`)).data,
  createLink: async (data) => (await api.post('/api/admin/tracking/links', data)).data,
  deleteLink: async (linkId) => (await api.delete(`/api/admin/tracking/links/${linkId}`)).data
};

export default api;