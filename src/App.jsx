import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { BotProvider } from './context/BotContext';
import { AuthProvider } from './context/AuthContext'; // <--- Importe Auth
import { MainLayout } from './layout/MainLayout';      // <--- Importe Layout
import { Login } from './pages/Login';                 // <--- Importe Login

import { Dashboard } from './pages/Dashboard';
import { Contacts } from './pages/Contacts';
import { Plans } from './pages/Plans';
import { Bots } from './pages/Bots';
import { NewBot } from './pages/NewBot';
import { BotConfig } from './pages/BotConfig';
import { Integrations } from './pages/Integrations';
import { ChatFlow } from './pages/ChatFlow';
import { Remarketing } from './pages/Remarketing';

// Placeholder para Logout
const Logout = () => {
  localStorage.removeItem('zenyx_admin_user');
  window.location.href = '/login';
  return null;
};

const PlaceholderPage = ({ title }) => (
  <div style={{ padding: '40px', marginTop: '70px', marginLeft: '260px' }}>
    <h1 style={{ color: 'var(--primary)' }}>{title}</h1>
    <p style={{ color: 'var(--muted-foreground)' }}>Em construção...</p>
  </div>
);

function App() {
  return (
    <AuthProvider> {/* 1. Auth envolve tudo */}
      <BotProvider> {/* 2. Bot envolve tudo */}
        <Router>
          <Routes>
            
            {/* ROTA PÚBLICA (LOGIN) */}
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />

            {/* ROTAS PROTEGIDAS (DENTRO DO LAYOUT) */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />
              
              <Route path="/bots" element={<Bots />} />
              <Route path="/bots/new" element={<NewBot />} />
              <Route path="/bots/config/:id" element={<BotConfig />} />
              
              <Route path="/contatos" element={<Contacts />} />
              <Route path="/planos" element={<Plans />} />
              <Route path="/flow" element={<ChatFlow />} />
              <Route path="/remarketing" element={<Remarketing />} />
              <Route path="/integracoes" element={<Integrations />} />
              
              <Route path="/config" element={<PlaceholderPage title="Configurações Gerais" />} />
              <Route path="/tutorial" element={<PlaceholderPage title="Tutoriais" />} />
              <Route path="/funcoes" element={<PlaceholderPage title="Funções Extras" />} />
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