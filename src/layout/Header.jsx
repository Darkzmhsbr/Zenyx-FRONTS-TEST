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
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // ============================================================
  // INICIALIZA TEMA AO CARREGAR
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
      root.style.setProperty('--background', '#0f0b14');
      root.style.setProperty('--foreground', '#f2f2f2');
      root.style.setProperty('--card', '#1b1730');
      root.style.setProperty('--card-border', '#2d2647');
      root.style.setProperty('--muted', '#1f1a2e');
      root.style.setProperty('--muted-foreground', '#b9b6c9');
      
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
    } else {
      root.style.setProperty('--background', '#fafafa');
      root.style.setProperty('--foreground', '#0a0a0a');
      root.style.setProperty('--card', '#ffffff');
      root.style.setProperty('--card-border', '#e5e5e5');
      root.style.setProperty('--muted', '#f4f4f5');
      root.style.setProperty('--muted-foreground', '#71717a');
      
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
  // 🔥 FUNÇÃO: LOGOUT FORÇADO (SEM DEPENDER DO CONTEXT)
  // ============================================================
  const handleLogout = () => {
    console.log('🚪 LOGOUT FORÇADO - Iniciando...');
    
    // Fecha dropdown
    setIsProfileMenuOpen(false);
    
    // LIMPA TUDO DO LOCALSTORAGE
    console.log('🗑️ Limpando localStorage...');
    localStorage.removeItem('zenyx_admin_user');
    localStorage.removeItem('zenyx_selected_bot');
    localStorage.removeItem('zenyx_theme');
    localStorage.clear(); // Limpa TUDO mesmo
    
    console.log('✅ LocalStorage limpo!');
    
    // Tenta chamar logout do context (se existir)
    if (logout) {
      console.log('📞 Chamando logout do AuthContext...');
      try {
        logout();
      } catch (error) {
        console.error('❌ Erro no logout do context:', error);
      }
    }
    
    // FORÇA REDIRECT ABSOLUTO
    console.log('🚀 Redirecionando para /login...');
    setTimeout(() => {
      window.location.href = '/login';
    }, 200);
  };

  return (
    <header className="header">
      {/* Lado Esquerdo */}
      <div className="header-left">
        <button className="mobile-menu-btn" onClick={onToggleMenu}>
          <Menu size={24} />
        </button>
        <h2 style={{margin:0, fontSize:'1.2rem'}}>Painel de Controle</h2>
      </div>

      {/* Lado Direito */}
      <div className="header-right">
        
        {/* SELETOR DE BOT */}
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
        
        {/* NOTIFICAÇÕES */}
        <div className="notification-dropdown-wrapper">
          <button 
            className={`icon-btn ${isNotificationOpen ? 'active' : ''}`}
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            title="Notificações"
          >
            <Bell size={20} />
            <span className="notification-badge">3</span>
          </button>

          {isNotificationOpen && (
            <div className="notification-dropdown-menu">
              <div className="notification-header">
                <h4>Notificações</h4>
                <button className="mark-all-read">Marcar todas como lidas</button>
              </div>

              <div className="notification-list">
                <div className="notification-item unread">
                  <div className="notification-icon success">💰</div>
                  <div className="notification-content">
                    <p className="notification-title">Nova venda!</p>
                    <p className="notification-text">João comprou o plano Mensal</p>
                    <p className="notification-time">Há 5 minutos</p>
                  </div>
                </div>

                <div className="notification-item unread">
                  <div className="notification-icon warning">⚠️</div>
                  <div className="notification-content">
                    <p className="notification-title">Bot pausado</p>
                    <p className="notification-text">VIPEZERA está offline</p>
                    <p className="notification-time">Há 1 hora</p>
                  </div>
                </div>

                <div className="notification-item">
                  <div className="notification-icon info">ℹ️</div>
                  <div className="notification-content">
                    <p className="notification-title">Atualização disponível</p>
                    <p className="notification-text">Nova versão do Flow Chat V5</p>
                    <p className="notification-time">Há 2 horas</p>
                  </div>
                </div>
              </div>

              <div className="notification-footer">
                <a href="/notificacoes">Ver todas →</a>
              </div>
            </div>
          )}
        </div>

        {/* DARK MODE */}
        <button 
          className="icon-btn" 
          onClick={toggleTheme}
          title={isDarkMode ? "Modo Claro" : "Modo Escuro"}
        >
          {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* PERFIL */}
        <div className="profile-dropdown-wrapper">
          <div 
            className="user-avatar" 
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            style={{ cursor: 'pointer' }}
          >
            {user?.name ? user.name.substring(0, 2).toUpperCase() : 'AD'}
          </div>

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

              {/* 🔥 BOTÃO SAIR COM LOGOUT FORÇADO */}
              <div 
                className="profile-dropdown-item danger"
                onClick={handleLogout}
                style={{ cursor: 'pointer' }}
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
