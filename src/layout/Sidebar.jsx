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
  Users,
  Star, // Ícone para Funções Extras
  ShieldCheck, // Ícone para Admins
  Layers, // Ícone para Grupos
  Unlock // Ícone para Canal Free
} from 'lucide-react';
import './Sidebar.css';

export function Sidebar() {
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Estado para controlar os menus
  const [isBotMenuOpen, setIsBotMenuOpen] = useState(true);
  const [isExtrasMenuOpen, setIsExtrasMenuOpen] = useState(false); // NOVO: Controle do menu Extras

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

        {/* --- MENU BOT --- */}
        <div className="nav-group">
          <div 
            className="nav-item" 
            onClick={() => setIsBotMenuOpen(!isBotMenuOpen)}
            style={{ cursor: 'pointer', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
              <MessageSquare size={20} />
              Bot
            </div>
            {isBotMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </div>

          {isBotMenuOpen && (
            <div className="nav-subitems" style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '5px' }}>
              <Link to="/bots" className={`nav-item ${currentPath === '/bots' ? 'active' : ''}`} style={{ fontSize: '0.9rem', paddingLeft: '50px' }}>
                <MessageSquare size={16} /> Meus Bots
              </Link>

              <Link to="/bots/new" className={`nav-item ${currentPath === '/bots/new' ? 'active' : ''}`} style={{ fontSize: '0.9rem', paddingLeft: '50px' }}>
                <PlusCircle size={16} /> Criar novo bot
              </Link>

              <Link to="/bots/update" className={`nav-item ${currentPath === '/bots/update' ? 'active' : ''}`} style={{ fontSize: '0.9rem', paddingLeft: '50px' }}>
                <Settings size={16} /> Atualizar bot
              </Link>

              <Link to="/planos" className={`nav-item ${currentPath === '/planos' ? 'active' : ''}`} style={{ fontSize: '0.9rem', paddingLeft: '50px' }}>
                <CreditCard size={16} /> Planos de pagamento
              </Link>

              <Link to="/tutorial" className={`nav-item ${currentPath === '/tutorial' ? 'active' : ''}`} style={{ fontSize: '0.9rem', paddingLeft: '50px' }}>
                <BookOpen size={16} /> Tutorial
              </Link>
            </div>
          )}
        </div>

        {/* Contatos */}
        <Link to="/contatos" className={`nav-item ${currentPath === '/contatos' ? 'active' : ''}`}>
          <Users size={20} />
          Contatos
        </Link>

        {/* Remarketing */}
        <Link to="/remarketing" className={`nav-item ${currentPath === '/remarketing' ? 'active' : ''}`}>
          <Megaphone size={20} />
          Remarketing
        </Link>

        {/* Flow Chat */}
        <Link to="/flow" className={`nav-item ${currentPath === '/flow' ? 'active' : ''}`}>
          <Zap size={20} />
          Flow Chat
        </Link>

        {/* --- MENU FUNÇÕES EXTRAS (NOVO) --- */}
        <div className="nav-group">
          <div 
            className="nav-item" 
            onClick={() => setIsExtrasMenuOpen(!isExtrasMenuOpen)}
            style={{ cursor: 'pointer', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
              <Star size={20} /> {/* Ícone de Estrela para Extras */}
              Funções Extras
            </div>
            {isExtrasMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </div>

          {isExtrasMenuOpen && (
            <div className="nav-subitems" style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '5px' }}>
              <Link to="/funcoes/admins" className={`nav-item ${currentPath === '/funcoes/admins' ? 'active' : ''}`} style={{ fontSize: '0.9rem', paddingLeft: '50px' }}>
                <ShieldCheck size={16} /> Administradores
              </Link>

              <Link to="/funcoes/grupos" className={`nav-item ${currentPath === '/funcoes/grupos' ? 'active' : ''}`} style={{ fontSize: '0.9rem', paddingLeft: '50px' }}>
                <Layers size={16} /> Grupos e Canais
              </Link>

              <Link to="/funcoes/free" className={`nav-item ${currentPath === '/funcoes/free' ? 'active' : ''}`} style={{ fontSize: '0.9rem', paddingLeft: '50px' }}>
                <Unlock size={16} /> Canal Free
              </Link>
            </div>
          )}
        </div>
        
        {/* Integrações */}
        <Link to="/integracoes" className={`nav-item ${currentPath === '/integracoes' ? 'active' : ''}`}>
          <Settings size={20} />
          Integrações
        </Link>

        <div className="nav-item logout" style={{ marginTop: 'auto', cursor: 'pointer' }} onClick={() => {/* Lógica de logout */}}>
          <LogOut size={20} />
          Sair
        </div>
      </nav>
    </aside>
  );
}