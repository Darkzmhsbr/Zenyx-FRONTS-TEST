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
  Star,
  ShieldCheck,
  Layers,
  Unlock,
  X // <--- Importei o ícone X para fechar
} from 'lucide-react';
import './Sidebar.css';

// Recebe props isOpen e onClose do Layout
export function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const [isBotMenuOpen, setIsBotMenuOpen] = useState(true);
  const [isExtrasMenuOpen, setIsExtrasMenuOpen] = useState(false);

  return (
    // Adiciona classe 'open' se isOpen for true
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span>Zenyx</span>
        </div>
        
        {/* Botão de Fechar (Só aparece no mobile) */}
        <button className="close-sidebar-btn" onClick={onClose}>
          <X size={24} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {/* Dashboard */}
        <Link to="/" className={`nav-item ${currentPath === '/' ? 'active' : ''}`} onClick={onClose}>
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
              <Link to="/bots" className={`nav-item ${currentPath === '/bots' ? 'active' : ''}`} style={{ fontSize: '0.9rem', paddingLeft: '50px' }} onClick={onClose}>
                <MessageSquare size={16} /> Meus Bots
              </Link>

              <Link to="/bots/new" className={`nav-item ${currentPath === '/bots/new' ? 'active' : ''}`} style={{ fontSize: '0.9rem', paddingLeft: '50px' }} onClick={onClose}>
                <PlusCircle size={16} /> Criar novo bot
              </Link>

              <Link to="/bots/update" className={`nav-item ${currentPath === '/bots/update' ? 'active' : ''}`} style={{ fontSize: '0.9rem', paddingLeft: '50px' }} onClick={onClose}>
                <Settings size={16} /> Atualizar bot
              </Link>

              <Link to="/planos" className={`nav-item ${currentPath === '/planos' ? 'active' : ''}`} style={{ fontSize: '0.9rem', paddingLeft: '50px' }} onClick={onClose}>
                <CreditCard size={16} /> Planos de pagamento
              </Link>

              <Link to="/tutorial" className={`nav-item ${currentPath === '/tutorial' ? 'active' : ''}`} style={{ fontSize: '0.9rem', paddingLeft: '50px' }} onClick={onClose}>
                <BookOpen size={16} /> Tutorial
              </Link>
            </div>
          )}
        </div>

        {/* Contatos */}
        <Link to="/contatos" className={`nav-item ${currentPath === '/contatos' ? 'active' : ''}`} onClick={onClose}>
          <Users size={20} />
          Contatos
        </Link>

        {/* Remarketing */}
        <Link to="/remarketing" className={`nav-item ${currentPath === '/remarketing' ? 'active' : ''}`} onClick={onClose}>
          <Megaphone size={20} />
          Remarketing
        </Link>

        {/* Flow Chat */}
        <Link to="/flow" className={`nav-item ${currentPath === '/flow' ? 'active' : ''}`} onClick={onClose}>
          <Zap size={20} />
          Flow Chat
        </Link>

        {/* --- MENU FUNÇÕES EXTRAS --- */}
        <div className="nav-group">
          <div 
            className="nav-item" 
            onClick={() => setIsExtrasMenuOpen(!isExtrasMenuOpen)}
            style={{ cursor: 'pointer', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
              <Star size={20} />
              Funções Extras
            </div>
            {isExtrasMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </div>

          {isExtrasMenuOpen && (
            <div className="nav-subitems" style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '5px' }}>
              <Link to="/funcoes/admins" className={`nav-item ${currentPath === '/funcoes/admins' ? 'active' : ''}`} style={{ fontSize: '0.9rem', paddingLeft: '50px' }} onClick={onClose}>
                <ShieldCheck size={16} /> Administradores
              </Link>

              <Link to="/funcoes/grupos" className={`nav-item ${currentPath === '/funcoes/grupos' ? 'active' : ''}`} style={{ fontSize: '0.9rem', paddingLeft: '50px' }} onClick={onClose}>
                <Layers size={16} /> Grupos e Canais
              </Link>

              <Link to="/funcoes/free" className={`nav-item ${currentPath === '/funcoes/free' ? 'active' : ''}`} style={{ fontSize: '0.9rem', paddingLeft: '50px' }} onClick={onClose}>
                <Unlock size={16} /> Canal Free
              </Link>
            </div>
          )}
        </div>
        
        {/* Integrações */}
        <Link to="/integracoes" className={`nav-item ${currentPath === '/integracoes' ? 'active' : ''}`} onClick={onClose}>
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