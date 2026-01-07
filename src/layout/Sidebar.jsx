import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  ChevronDown, 
  ChevronRight, 
  PlusCircle, 
  Settings, 
  BookOpen, 
  Zap, 
  LogOut,
  CreditCard,
  Megaphone,
  Users // <--- Importei o ícone de Usuários
} from 'lucide-react';
import './Sidebar.css';

export function Sidebar() {
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Estado para controlar se o menu "Bot" está aberto ou fechado
  const [isBotMenuOpen, setIsBotMenuOpen] = useState(true);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span>Zenyx</span>
      </div>

      <nav className="sidebar-nav">
        {/* Dashboard */}
        <Link to="/" className={`nav-item ${currentPath === '/' ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          Dashboard
        </Link>

        {/* --- MENU BOT (COM SUB-MENUS) --- */}
        <div className="nav-group">
          <div 
            className="nav-item" 
            onClick={() => setIsBotMenuOpen(!isBotMenuOpen)}
            style={{ cursor: 'pointer', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <MessageSquare size={20} />
              Bot
            </div>
            {isBotMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </div>

          {/* Sub-itens */}
          {isBotMenuOpen && (
            <div className="sub-nav" style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '5px' }}>
              <Link to="/bots/new" className={`nav-item ${currentPath === '/bots/new' ? 'active' : ''}`} style={{ fontSize: '0.9rem' }}>
                <PlusCircle size={16} /> Criar novo bot
              </Link>
              
              <Link to="/bots" className={`nav-item ${currentPath === '/bots' ? 'active' : ''}`} style={{ fontSize: '0.9rem' }}>
                <Settings size={16} /> Atualizar bot
              </Link>

              <Link to="/planos" className={`nav-item ${currentPath === '/planos' ? 'active' : ''}`} style={{ fontSize: '0.9rem' }}>
                <CreditCard size={16} /> Planos de pagamento
              </Link>

              <Link to="/tutorial" className={`nav-item ${currentPath === '/tutorial' ? 'active' : ''}`} style={{ fontSize: '0.9rem' }}>
                <BookOpen size={16} /> Tutorial
              </Link>
            </div>
          )}
        </div>

        {/* --- CONTATOS (NOVO) --- */}
        <Link to="/contatos" className={`nav-item ${currentPath === '/contatos' ? 'active' : ''}`}>
          <Users size={20} />
          Contatos
        </Link>

        {/* --- REMARKETING --- */}
        <Link to="/remarketing" className={`nav-item ${currentPath === '/remarketing' ? 'active' : ''}`}>
          <Megaphone size={20} />
          Remarketing
        </Link>

        {/* --- FLOW CHAT --- */}
        <Link to="/flow" className={`nav-item ${currentPath === '/flow' ? 'active' : ''}`}>
          <Zap size={20} />
          Flow Chat
        </Link>

        {/* Outros Itens */}
        <Link to="/funcoes" className={`nav-item ${currentPath === '/funcoes' ? 'active' : ''}`}>
          <Zap size={20} />
          Funções Extras
        </Link>
        
        <Link to="/integracoes" className={`nav-item ${currentPath === '/integracoes' ? 'active' : ''}`}>
          <Settings size={20} />
          Integrações
        </Link>
      </nav>

      <div className="sidebar-footer">
        <Link to="/logout" className="nav-item">
          <LogOut size={20} />
          Sair
        </Link>
      </div>
    </aside>
  );
}