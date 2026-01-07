import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BotProvider } from './context/BotContext'; // <--- Importação do Contexto
import { Sidebar } from './layout/Sidebar';
import { Header } from './layout/Header';
import { Dashboard } from './pages/Dashboard';
import { Contacts } from './pages/Contacts';
import { Plans } from './pages/Plans';
import { Bots } from './pages/Bots';
import { NewBot } from './pages/NewBot';
import { BotConfig } from './pages/BotConfig';
import { Integrations } from './pages/Integrations';
import { ChatFlow } from './pages/ChatFlow';
import { Remarketing } from './pages/Remarketing';

const PlaceholderPage = ({ title }) => (
  <div style={{ padding: '40px', marginTop: '70px', marginLeft: '260px' }}>
    <h1 style={{ color: 'var(--primary)' }}>{title}</h1>
    <p style={{ color: 'var(--muted-foreground)' }}>Em construção...</p>
  </div>
);

function App() {
  return (
    <BotProvider> {/* <--- O Cérebro envolve tudo aqui */}
      <Router>
        <div className="app-container">
          <Sidebar />
          <Header /> {/* O Header agora tem acesso ao Contexto */}
          
          <main>
            <Routes>
              {/* Dashboard Principal */}
              <Route path="/" element={<Dashboard />} />
              
              {/* Rotas de Bots */}
              <Route path="/bots" element={<Bots />} />
              <Route path="/bots/new" element={<NewBot />} />
              <Route path="/bots/config/:id" element={<BotConfig />} />
              
              {/* Rotas de Gestão */}
              <Route path="/contatos" element={<Contacts />} />
              <Route path="/planos" element={<Plans />} />
              
              {/* Rota do Flow Chat */}
              <Route path="/flow" element={<ChatFlow />} />

              {/* Rota de Remarketing */}
              <Route path="/remarketing" element={<Remarketing />} />

              {/* Rota de Integrações */}
              <Route path="/integracoes" element={<Integrations />} />
              
              {/* Rotas Extras/Placeholders */}
              <Route path="/config" element={<PlaceholderPage title="Configurações Gerais" />} />
              <Route path="/tutorial" element={<PlaceholderPage title="Tutoriais" />} />
              <Route path="/funcoes" element={<PlaceholderPage title="Funções Extras" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </BotProvider>
  );
}

export default App;