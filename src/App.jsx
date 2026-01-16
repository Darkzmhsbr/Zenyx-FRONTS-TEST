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
import { Tracking } from './pages/Tracking'; // 🔥 NOVO IMPORT

// Placeholder para Logout
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
  return (
    <AuthProvider>
      <BotProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />
            
            {/* Rotas Protegidas (Dentro do Layout) */}
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
              
              {/* 🔥 NOVA ROTA DE RASTREAMENTO */}
              <Route path="/rastreamento" element={<Tracking />} />
              
              <Route path="/perfil" element={<Profile />} />
              
              <Route path="/config" element={<PlaceholderPage title="Configurações Gerais" />} />
              <Route path="/tutorial" element={<PlaceholderPage title="Tutoriais" />} />
              
              {/* FUNÇÕES EXTRAS */}
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