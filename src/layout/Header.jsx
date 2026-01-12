import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBot } from '../context/BotContext';
import { Bot, ChevronDown, Check, Bell, Moon, Sun, Menu, User, Settings, LogOut } from 'lucide-react'; 
import './Header.css'; 

export function Header({ onToggleMenu }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { bots, selectedBot, changeBot } = useBot();
  
  const [isBotMenuOpen, setIsBotMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // ============================================================
  // INICIALIZA TEMA AO CARREGAR (EFFECT PRIMEIRO)
  // ============================================================
  useEffect(() => {
    const savedTheme = localStorage.getItem('zenyx_theme') || 'dark';
    const isDark = savedTheme === 'dark';
    setIsDarkMode(isDark);
    applyTheme(isDark);
  }, []);

  // ============================================================
  // FUNÇÃO: APLICAR TEMA
  // ============================================================
  const applyTheme = (isDark) => {
    const root = document.documentElement;
    
    if (isDark) {
      // TEMA DARK
      root.style.setProperty('--background', '#0f0b14');
      root.style.setProperty('--foreground', '#f2f2f2');
      root.style.setProperty('--card', '#1b1730');
      root.style.setProperty('--card-border', '#2d2647');
      root.style.setProperty('--muted', '#1f1a2e');
      root.style.setProperty('--muted-foreground', '#b9b6c9');
      
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
    } else {
      // TEMA LIGHT
      root.style.setProperty('--background', '#f5f5f7');
      root.style.setProperty('--foreground', '#1a1a1a');
      root.style.setProperty('--card', '#ffffff');
      root.style.setProperty('--card-border', '#e0e0e0');
      root.style.setProperty('--muted', '#e8e8e8');
      root.style.setProperty('--muted-foreground', '#6b6b6b');
      
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
    }
  };

  // ============================================================
  // FUNÇÃO: TOGGLE DARK MODE
  // ============================================================
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('zenyx_theme', newTheme ? 'dark' : 'light');
    applyTheme(newTheme);
    
    console.log('🎨 Tema alterado para:', newTheme ? 'DARK' : 'LIGHT');
  };

  // ============================================================
  // FUNÇÃO: LOGOUT
  // ============================================================
  const handleLogout = () => {
    console.log('🚪 Clicou em Sair');
    logout();
  };

  return (
    <header className="header">
      {/* Lado Esquerdo: Botão Menu (Mobile) + Título */}
      <div className="header-left">
        
        {/* Botão Hambúrguer (Só aparece no mobile via CSS) */}
        <button className="mobile-menu-btn" onClick={onToggleMenu}>
          <Menu size={24} />
        </button>

        <h2 style={{margin:0, fontSize:'1.2rem'}}>Painel de Controle</h2>
      </div>

      {/* Lado Direito: Seletor e Ações */}
      <div className="header-right">
        
        {/* --- SELETOR DE BOT GLOBAL --- */}
        <div className="bot-selector-wrapper">
          <button 
            className={`bot-selector-btn ${isBotMenuOpen ? 'active' : ''}`} 
            onClick={() => setIsBotMenuOpen(!isBotMenuOpen)}
          >
            <div className="bot-icon-circle">
              <Bot size={20} />
            </div>
            <span className="bot-name">
              {selectedBot ? selectedBot.nome : "Selecione um Bot"}
            </span>
            <ChevronDown size={16} />
          </button>

          {/* Menu Dropdown de Bots */}
          {isBotMenuOpen && (
            <div className="bot-dropdown-menu">
              <div className="dropdown-header">Meus bots ativos</div>
              
              {bots.length === 0 ? (
                <div className="dropdown-item empty">Nenhum bot cadastrado</div>
              ) : (
                bots.map(bot => (
                  <div 
                    key={bot.id} 
                    className={`dropdown-item ${selectedBot?.id === bot.id ? 'selected' : ''}`}
                    onClick={() => {
                      changeBot(bot);
                      setIsBotMenuOpen(false);
                    }}
                  >
                    <div className="bot-mini-icon"><Bot size={16}/></div>
                    <span>{bot.nome}</span>
                    {selectedBot?.id === bot.id && <Check size={16} className="check-icon"/>}
                  </div>
                ))
              )}
              
              <div className="dropdown-footer">
                <a href="/bots/new">Configurar Novos →</a>
              </div>
            </div>
          )}
        </div>
        
        {/* ÍCONE: NOTIFICAÇÕES (implementaremos depois) */}
        <button className="icon-btn" title="Notificações">
          <Bell size={20} />
        </button>

        {/* ÍCONE: DARK MODE TOGGLE */}
        <button 
          className="icon-btn" 
          onClick={toggleTheme}
          title={isDarkMode ? "Modo Claro" : "Modo Escuro"}
        >
          {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* ÍCONE: PERFIL COM DROPDOWN */}
        <div className="profile-dropdown-wrapper">
          <div 
            className="user-avatar" 
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            style={{ cursor: 'pointer' }}
          >
            {user?.name ? user.name.substring(0, 2).toUpperCase() : 'AD'}
          </div>

          {/* DROPDOWN DE PERFIL */}
          {isProfileMenuOpen && (
            <div className="profile-dropdown-menu">
              <div className="profile-dropdown-header">
                <div className="profile-avatar-large">
                  {user?.name ? user.name.substring(0, 2).toUpperCase() : 'AD'}
                </div>
                <div>
                  <div className="profile-name">{user?.name || 'Admin'}</div>
                  <div className="profile-email">{user?.username || 'admin@zenyx.com'}</div>
                </div>
              </div>

              <div className="profile-dropdown-divider"></div>

              <div 
                className="profile-dropdown-item"
                onClick={() => {
                  navigate('/perfil');
                  setIsProfileMenuOpen(false);
                }}
              >
                <User size={16} />
                <span>Meu Perfil</span>
              </div>

              <div 
                className="profile-dropdown-item"
                onClick={() => {
                  navigate('/config');
                  setIsProfileMenuOpen(false);
                }}
              >
                <Settings size={16} />
                <span>Configurações</span>
              </div>

              <div className="profile-dropdown-divider"></div>

              <div 
                className="profile-dropdown-item danger"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                <span>Sair</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
