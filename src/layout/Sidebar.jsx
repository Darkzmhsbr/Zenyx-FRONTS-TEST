import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  X,
  TrendingUp, // 🔥 NOVO ÍCONE PARA FUNIL
  ShoppingBag // 🔥 NOVO ÍCONE PARA OFERTAS EXTRAS
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

// Recebe props isOpen e onClose do Layout
export function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const currentPath = location.pathname;
  
  const [isBotMenuOpen, setIsBotMenuOpen] = useState(true);
  const [isExtrasMenuOpen, setIsExtrasMenuOpen] = useState(false);
  const [isOffersMenuOpen, setIsOffersMenuOpen] = useState(false); // 🔥 NOVO ESTADO

  // ============================================================
  // 🔥 FUNÇÃO DE LOGOUT
  // ============================================================
  const handleLogout = () => {
    console.log('🚪 LOGOUT - Sidebar');
    
    // Fecha menu mobile se estiver aberto
    if (onClose) onClose();
    
    // Limpa tudo do localStorage
    localStorage.clear();
    
    // Chama função de logout do contexto
    if (logout) logout();
    
    // Força redirecionamento e reload
    window.location.href = '/login';
  };

  return (
    <>
      {/* Overlay para Mobile */}
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Zap size={28} color="#c333ff" fill="#c333ff" />
            <span>Zenyx</span>
          </div>
          
          <button className="close-sidebar-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="sidebar-nav">
          <Link to="/" className={`nav-item ${currentPath === '/' ? 'active' : ''}`} onClick={onClose}>
            <LayoutDashboard size={20} />
            Dashboard
          </Link>

          {/* MENU BOT (DROPDOWN) */}
          <div className="nav-group">
            <div 
              className={`nav-item has-submenu ${isBotMenuOpen ? 'open' : ''}`}
              onClick={() => setIsBotMenuOpen(!isBotMenuOpen)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <MessageSquare size={20} />
                Bot
              </div>
              {isBotMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>
            
            {isBotMenuOpen && (
              <div className="nav-subitems">
                <Link to="/bots" className={`nav-item ${currentPath === '/bots' ? 'active' : ''}`} onClick={onClose}>
                  <MessageSquare size={16} /> Meus Bots
                </Link>
                <Link to="/bots/new" className={`nav-item ${currentPath === '/bots/new' ? 'active' : ''}`} onClick={onClose}>
                  <PlusCircle size={16} /> Criar novo bot
                </Link>
                <Link to="/bots/config/update" className="nav-item" onClick={onClose}>
                  <Settings size={16} /> Atualizar bot
                </Link>
                <Link to="/planos" className={`nav-item ${currentPath === '/planos' ? 'active' : ''}`} onClick={onClose}>
                  <CreditCard size={16} /> Planos de pagamento
                </Link>
                <Link to="/tutorial" className={`nav-item ${currentPath === '/tutorial' ? 'active' : ''}`} onClick={onClose}>
                  <BookOpen size={16} /> Tutorial
                </Link>
              </div>
            )}
          </div>

          {/* FUNIL (NOVO) */}
          <Link to="/funil" className={`nav-item ${currentPath === '/funil' ? 'active' : ''}`} onClick={onClose}>
            <TrendingUp size={20} />
            Funil
          </Link>

          {/* CONTATOS */}
          <Link to="/contatos" className={`nav-item ${currentPath === '/contatos' ? 'active' : ''}`} onClick={onClose}>
            <Users size={20} />
            Contatos
          </Link>

          {/* REMARKETING */}
          <Link to="/remarketing" className={`nav-item ${currentPath === '/remarketing' ? 'active' : ''}`} onClick={onClose}>
            <Megaphone size={20} />
            Remarketing
          </Link>

          {/* FLOW CHAT */}
          <Link to="/flow" className={`nav-item ${currentPath === '/flow' ? 'active' : ''}`} onClick={onClose}>
            <Zap size={20} />
            Flow Chat
          </Link>

          {/* 🔥 NOVO MENU: OFERTAS EXTRAS */}
          <div className="nav-group">
            <div 
              className={`nav-item has-submenu ${isOffersMenuOpen ? 'open' : ''}`}
              onClick={() => setIsOffersMenuOpen(!isOffersMenuOpen)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ShoppingBag size={20} />
                Ofertas Extras
              </div>
              {isOffersMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>
            
            {isOffersMenuOpen && (
              <div className="nav-subitems">
                <Link 
                  to="/ofertas/order-bump" 
                  className={`nav-item ${currentPath === '/ofertas/order-bump' ? 'active' : ''}`} 
                  onClick={onClose}
                >
                  <PlusCircle size={16} /> Order Bump
                </Link>
                <span className="nav-item disabled" style={{opacity: 0.5, cursor: 'not-allowed'}}>
                  <TrendingUp size={16} /> Upsell (Em breve)
                </span>
                <span className="nav-item disabled" style={{opacity: 0.5, cursor: 'not-allowed'}}>
                  <TrendingUp size={16} style={{transform: 'rotate(180deg)'}} /> Downsell (Em breve)
                </span>
              </div>
            )}
          </div>

          {/* FUNÇÕES EXTRAS (DROPDOWN) */}
          <div className="nav-group">
            <div 
              className={`nav-item has-submenu ${isExtrasMenuOpen ? 'open' : ''}`}
              onClick={() => setIsExtrasMenuOpen(!isExtrasMenuOpen)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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

          {/* 🔥 BOTÃO SAIR */}
          <div 
            className="nav-item" 
            onClick={handleLogout}
            style={{ marginTop: 'auto', color: '#ef4444', cursor: 'pointer' }}
          >
            <LogOut size={20} />
            Sair
          </div>
        </div>
      </aside>
    </>
  );
}