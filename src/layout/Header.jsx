import React, { useState } from 'react';
import { useBot } from '../context/BotContext';
import { Bot, ChevronDown, Check, Bell, Moon, Menu } from 'lucide-react'; // Importei o Menu
import './Header.css'; 

export function Header({ onToggleMenu }) {
  const { bots, selectedBot, changeBot } = useBot();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
            className={`bot-selector-btn ${isMenuOpen ? 'active' : ''}`} 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className="bot-icon-circle">
              <Bot size={20} />
            </div>
            <span className="bot-name">
              {selectedBot ? selectedBot.nome : "Selecione um Bot"}
            </span>
            <ChevronDown size={16} />
          </button>

          {/* Menu Dropdown */}
          {isMenuOpen && (
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
                      setIsMenuOpen(false);
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
        
        {/* Outros ícones */}
        <button className="icon-btn"><Bell size={20} /></button>
        <button className="icon-btn"><Moon size={20} /></button>
        <div className="user-avatar">AD</div>
      </div>
    </header>
  );
}