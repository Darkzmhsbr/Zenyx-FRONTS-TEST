import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { BotProvider } from './context/BotContext';
import { AuthProvider } from './context/AuthContext';
import { MainLayout } from './layout/MainLayout';
import { Login } from './pages/Login';

import { Dashboard } from './pages/Dashboard';
import { Contacts } from './pages/Contacts';
import { Funil } from './pages/Funil';
import { Plans } from './pages/Plans';
import { Bots } from './pages/Bots';
import { NewBot } from './pages/NewBot';
import { BotConfig } from './pages/BotConfig';
import { Integrations } from './pages/Integrations';
import { ChatFlow } from './pages/ChatFlow';
import { Remarketing } from './pages/Remarketing';
import { AdminManager } from './pages/AdminManager';
import { OrderBump } from './pages/OrderBump';
import { Profile } from './pages/Profile';
import { Tracking } from './pages/Tracking';

// 🔥 IMPORTANDO A LOJA REAL
import { MiniAppHome } from './pages/miniapp/MiniAppHome';
import { MiniAppCategory } from './pages/miniapp/MiniAppCategory';
import { MiniAppCheckout } from './pages/miniapp/MiniAppCheckout';
import { MiniAppPayment } from './pages/miniapp/MiniAppPayment';
import { MiniAppSuccess } from './pages/miniapp/MiniAppSuccess';

const Logout = () => {
  localStorage.removeItem('zenyx_admin_user');
  window.location.href = '/login';
  return null;
};

const PlaceholderPage = ({ title }) => (
  <div style={{ padding: '40px', marginTop: '70px', marginLeft: '260px' }}>
    <h1 style={{ color: 'var(--primary)' }}>{title}</h1>
    <p style={{ color: 'var(--muted-foreground)' }}>Esta página está em construção...</p>
  </div>
);

function App() {
  // 🔥 LÓGICA DE CAPTURA GLOBAL DO TELEGRAM (A BASE DO SUCESSO)
  // Isso garante que o ID seja salvo assim que o Mini App abrir
  useEffect(() => {
    // Verifica se está rodando dentro do Telegram
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready(); // Informa que o app carregou
      
      try { tg.expand(); } catch (e) {} // Expande para tela cheia

      // Tenta pegar os dados do usuário (initDataUnsafe é seguro dentro do bot)
      const user = tg.initDataUnsafe?.user;
      
      if (user) {
        console.log("✅ Cliente Telegram Detectado (Global):", user.first_name);
        
        // 💾 SALVA NO ARMAZENAMENTO DO NAVEGADOR
        // Isso permite que o api.js e o Checkout recuperem o ID numérico depois
        localStorage.setItem('telegram_user_id', user.id);
        localStorage.setItem('telegram_user_first_name', user.first_name);
        
        if (user.username) {
            localStorage.setItem('telegram_username', user.username);
        }
        
        // Aplica cores do tema do Telegram (Opcional, mas melhora a experiência)
        try {
            document.documentElement.style.setProperty('--tg-theme-bg-color', tg.backgroundColor);
            document.documentElement.style.setProperty('--tg-theme-text-color', tg.textColor);
        } catch (e) {}
      }
    }
  }, []);

  return (
    <AuthProvider>
      <BotProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />
            
            {/* 🔥 ROTAS PÚBLICAS DA LOJA (MINI APP) */}
            <Route path="/loja/:botId" element={<MiniAppHome />} />
            <Route path="/loja/:botId/categoria/:slug" element={<MiniAppCategory />} />
            <Route path="/loja/:botId/checkout" element={<MiniAppCheckout />} />
            <Route path="/loja/:botId/pagamento" element={<MiniAppPayment />} />
            <Route path="/loja/:botId/obrigado" element={<MiniAppSuccess />} />
            
            {/* Rotas Protegidas (Painel Admin) */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/bots" element={<Bots />} />
              <Route path="/bots/new" element={<NewBot />} />
              <Route path="/bots/config/:id" element={<BotConfig />} />
              
              <Route path="/funil" element={<Funil />} />
              <Route path="/contatos" element={<Contacts />} />
              <Route path="/planos" element={<Plans />} />
              <Route path="/flow" element={<ChatFlow />} />
              <Route path="/remarketing" element={<Remarketing />} />
              <Route path="/integracoes" element={<Integrations />} />
              
              <Route path="/ofertas/order-bump" element={<OrderBump />} />
              <Route path="/rastreamento" element={<Tracking />} />
              <Route path="/perfil" element={<Profile />} />
              
              <Route path="/config" element={<PlaceholderPage title="Configurações Gerais" />} />
              <Route path="/tutorial" element={<PlaceholderPage title="Tutoriais" />} />
              
              <Route path="/funcoes" element={<PlaceholderPage title="Funções Extras" />} />
              <Route path="/funcoes/admins" element={<AdminManager />} />
              <Route path="/funcoes/grupos" element={<PlaceholderPage title="Grupos e Canais" />} />
              <Route path="/funcoes/free" element={<PlaceholderPage title="Canal Free" />} />
            </Route>

            {/* Qualquer outra rota redireciona para login */}
            <Route path="*" element={<Navigate to="/login" replace />} />

          </Routes>
        </Router>
      </BotProvider>
    </AuthProvider>
  );
}

export default App;