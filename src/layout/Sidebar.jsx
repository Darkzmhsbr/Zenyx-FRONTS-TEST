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
  TrendingUp, 
  ShoppingBag,
  User, 
  Target // 🔥 NOVO ÍCONE
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
  const [isOffersMenuOpen, setIsOffersMenuOpen] = useState(false);

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
      <div 
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`} 
        onClick={onClose}
      />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-area">
            <div className="logo-icon">
              <Zap size={24} color="#fff" fill="#c333ff" />
            </div>
            <span className="logo-text">Zenyx<span className="highlight">GBOT</span></span>
          </div>
          <button className="close-btn-mobile" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <Link to="/" className={`nav-item ${currentPath === '/' ? 'active' : ''}`} onClick={onClose}>
            <LayoutDashboard size={20} />
            Dashboard
          </Link>

          {/* MENUS COLAPSÁVEIS - MEUS BOTS */}
          <div className="nav-group">
            <div 
              className={`nav-item group-header ${isBotMenuOpen ? 'open' : ''}`}
              onClick={() => setIsBotMenuOpen(!isBotMenuOpen)}
            >
              <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                <MessageSquare size={20} />
                Meus Bots
              </div>
              {isBotMenuOpen ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
            </div>
            
            {isBotMenuOpen && (
              <div className="submenu">
                <Link to="/bots" className={`nav-item ${currentPath === '/bots' ? 'active' : ''}`} style={{ fontSize: '0.9rem', paddingLeft: '50px' }} onClick={onClose}>
                  <Zap size={16} /> Gerenciar Bots
                </Link>
                <Link to="/bots/new" className={`nav-item ${currentPath === '/bots/new' ? 'active' : ''}`} style={{ fontSize: '0.9rem', paddingLeft: '50px' }} onClick={onClose}>
                  <PlusCircle size={16} /> Novo Bot
                </Link>
              </div>
            )}
          </div>

          <Link to="/funil" className={`nav-item ${currentPath === '/funil' ? 'active' : ''}`} onClick={onClose}>
            <TrendingUp size={20} />
            Funil de Vendas
          </Link>

          <Link to="/contatos" className={`nav-item ${currentPath === '/contatos' ? 'active' : ''}`} onClick={onClose}>
            <Users size={20} />
            Contatos (Leads)
          </Link>

          <Link to="/flow" className={`nav-item ${currentPath === '/flow' ? 'active' : ''}`} onClick={onClose}>
            <MessageSquare size={20} />
            Flow Chat (Fluxo)
          </Link>

          <Link to="/remarketing" className={`nav-item ${currentPath === '/remarketing' ? 'active' : ''}`} onClick={onClose}>
            <Megaphone size={20} />
            Remarketing
          </Link>

          {/* OFERTAS E PLANOS */}
          <div className="nav-group">
            <div 
              className={`nav-item group-header ${isOffersMenuOpen ? 'open' : ''}`}
              onClick={() => setIsOffersMenuOpen(!isOffersMenuOpen)}
            >
              <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                <CreditCard size={20} />
                Planos e Ofertas
              </div>
              {isOffersMenuOpen ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
            </div>
            
            {isOffersMenuOpen && (
              <div className="submenu">
                <Link to="/planos" className={`nav-item ${currentPath === '/planos' ? 'active' : ''}`} style={{ fontSize: '0.9rem', paddingLeft: '50px' }} onClick={onClose}>
                  <Star size={16} /> Gerenciar Planos
                </Link>
                <Link to="/ofertas/order-bump" className={`nav-item ${currentPath === '/ofertas/order-bump' ? 'active' : ''}`} style={{ fontSize: '0.9rem', paddingLeft: '50px' }} onClick={onClose}>
                  <ShoppingBag size={16} /> Order Bump
                </Link>
              </div>
            )}
          </div>

          <div className="divider"></div>

          {/* EXTRAS */}
          <div className="nav-group">
            <div 
              className={`nav-item group-header ${isExtrasMenuOpen ? 'open' : ''}`}
              onClick={() => setIsExtrasMenuOpen(!isExtrasMenuOpen)}
            >
              <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                <BookOpen size={20} />
                Extras
              </div>
              {isExtrasMenuOpen ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
            </div>
            
            {isExtrasMenuOpen && (
              <div className="submenu">
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

          {/* 🔥 NOVO LINK: RASTREAMENTO */}
          <Link to="/rastreamento" className={`nav-item ${currentPath === '/rastreamento' ? 'active' : ''}`} onClick={onClose}>
            <Target size={20} />
            Rastreamento
          </Link>

          {/* MEU PERFIL */}
          <Link to="/perfil" className={`nav-item ${currentPath === '/perfil' ? 'active' : ''}`} onClick={onClose} style={{ marginTop: 'auto' }}>
            <User size={20} />
            Meu Perfil
          </Link>

          {/* BOTÃO SAIR */}
          <div 
            className="nav-item" 
            onClick={handleLogout}
            style={{ cursor: 'pointer', color: '#ef4444' }}
          >
            <LogOut size={20} />
            Sair
          </div>

        </nav>
      </aside>
    </>
  );
}