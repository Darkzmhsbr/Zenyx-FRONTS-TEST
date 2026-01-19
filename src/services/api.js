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

// ============================================================
// 🤖 SERVIÇO DE BOTS
// ============================================================
export const botService = {  
  createBot: async (dados) => (await api.post('/api/admin/bots', dados)).data,
  listBots: async () => (await api.get('/api/admin/bots')).data,
  getBot: async (botId) => (await api.get(`/api/admin/bots/${botId}`)).data,
  updateBot: async (botId, dados) => (await api.put(`/api/admin/bots/${botId}`, dados)).data,
  toggleBot: async (botId) => (await api.post(`/api/admin/bots/${botId}/toggle`)).data,
  deleteBot: async (botId) => (await api.delete(`/api/admin/bots/${botId}`)).data,
  getStats: async (botId, start, end) => (await api.get(`/api/admin/dashboard/stats?bot_id=${botId}&start_date=${start}&end_date=${end}`)).data,
};

// ============================================================
// 💬 SERVIÇO DE FLUXO E MENSAGENS
// ============================================================
export const flowService = {
  getFlow: async (botId) => (await api.get(`/api/admin/bots/${botId}/flow`)).data,
  saveFlow: async (botId, flowData) => (await api.post(`/api/admin/bots/${botId}/flow`, flowData)).data,
  getSteps: async (botId) => (await api.get(`/api/admin/bots/${botId}/flow/steps`)).data,
  addStep: async (botId, stepData) => (await api.post(`/api/admin/bots/${botId}/flow/steps`, stepData)).data,
  updateStep: async (botId, stepId, stepData) => (await api.put(`/api/admin/bots/${botId}/flow/steps/${stepId}`, stepData)).data,
  deleteStep: async (botId, stepId) => (await api.delete(`/api/admin/bots/${botId}/flow/steps/${stepId}`)).data,
};

// ============================================================
// 💲 SERVIÇO DE PLANOS E ORDER BUMP
// ============================================================
export const planService = {
  listPlans: async (botId) => (await api.get(`/api/admin/bots/${botId}/plans`)).data,
  createPlan: async (botId, planData) => (await api.post(`/api/admin/bots/${botId}/plans`, planData)).data,
  updatePlan: async (botId, planId, planData) => (await api.put(`/api/admin/bots/${botId}/plans/${planId}`, planData)).data,
  deletePlan: async (botId, planId) => (await api.delete(`/api/admin/bots/${botId}/plans/${planId}`)).data,
};

export const orderBumpService = {
  get: async (botId) => (await api.get(`/api/admin/bots/${botId}/order-bump`)).data,
  save: async (botId, data) => (await api.post(`/api/admin/bots/${botId}/order-bump`, data)).data
};

// ============================================================
// 💳 SERVIÇO DE PAGAMENTOS (LÓGICA ADAPTADA DO PROJETO DE REFERÊNCIA)
// ============================================================
export const paymentService = {
  // Gera o PIX lendo o ID do storage
  createPix: async (data) => {
    // 🔥 Recupera do storage (definido pelo App.jsx)
    const storedId = localStorage.getItem('telegram_user_id');
    const storedUser = localStorage.getItem('telegram_username');
    const storedName = localStorage.getItem('telegram_user_first_name');
    
    // Monta o payload final
    const payload = {
        ...data,
        telegram_id: String(data.telegram_id || storedId || "000000"), // Prioriza dado passado, depois storage
        username: data.username || storedUser || "site_user",
        first_name: data.first_name || storedName || "Visitante"
    };
    
    console.log("📤 PIX Payload (Enviando):", payload);
    const response = await api.post('/api/pagamento/pix', payload);
    return response.data;
  },
  
  // Verifica status
  checkStatus: async (txid) => {
    const response = await api.get(`/api/pagamento/status/${txid}`);
    return response.data;
  }
};

// ============================================================
// 🔗 SERVIÇO DE INTEGRAÇÕES E TRACKING
// ============================================================
export const integrationService = {
  getPushinStatus: async (botId) => (await api.get(`/api/admin/integrations/pushinpay/${botId}`)).data,
  savePushinToken: async (botId, token) => (await api.post(`/api/admin/integrations/pushinpay/${botId}`, { token })).data
};

export const trackingService = {
  listFolders: async () => (await api.get('/api/admin/tracking/folders')).data,
  createFolder: async (data) => (await api.post('/api/admin/tracking/folders', data)).data,
  deleteFolder: async (folderId) => (await api.delete(`/api/admin/tracking/folders/${folderId}`)).data,
  listLinks: async (folderId) => (await api.get(`/api/admin/tracking/links/${folderId}`)).data,
  createLink: async (data) => (await api.post('/api/admin/tracking/links', data)).data,
  deleteLink: async (linkId) => (await api.delete(`/api/admin/tracking/links/${linkId}`)).data
};

// ============================================================
// 📱 SERVIÇO DE MINI APP
// ============================================================
export const miniappService = {
  saveConfig: async (botId, data) => (await api.post(`/api/admin/bots/${botId}/miniapp/config`, data)).data,
  getConfig: async (botId) => (await api.get(`/api/miniapp/${botId}`)).data,
  listCategories: async (botId) => (await api.get(`/api/admin/bots/${botId}/miniapp/categories`)).data,
  createCategory: async (data) => (await api.post(`/api/admin/miniapp/categories`, data)).data,
  deleteCategory: async (catId) => (await api.delete(`/api/admin/miniapp/categories/${catId}`)).data,
  switchMode: async (botId, mode) => (await api.post(`/api/admin/bots/${botId}/mode`, { modo: mode })).data,
  getPublicData: async (botId) => (await api.get(`/api/miniapp/${botId}`)).data
};

export default api;