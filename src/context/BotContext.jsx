import React, { createContext, useState, useEffect, useContext } from 'react';
import { botService } from '../services/api';

const BotContext = createContext();

export function BotProvider({ children }) {
  const [bots, setBots] = useState([]);
  const [selectedBot, setSelectedBot] = useState(null); // Objeto completo do bot
  const [loading, setLoading] = useState(true);

  // Carrega bots ao iniciar
  useEffect(() => {
    async function loadBots() {
      try {
        const data = await botService.listBots();
        setBots(data);
        
        // Se houver bots e nenhum selecionado, seleciona o primeiro automaticamente
        if (data.length > 0 && !selectedBot) {
            // Tenta recuperar do localStorage ou pega o primeiro
            const savedBotId = localStorage.getItem('zenyx_selected_bot');
            const found = data.find(b => b.id.toString() === savedBotId);
            setSelectedBot(found || data[0]);
        }
      } catch (error) {
        console.error("Erro ao carregar bots no contexto:", error);
      } finally {
        setLoading(false);
      }
    }
    loadBots();
  }, []);

  // Função para trocar de bot
  const changeBot = (bot) => {
    setSelectedBot(bot);
    localStorage.setItem('zenyx_selected_bot', bot.id); // Salva na memória
  };

  return (
    <BotContext.Provider value={{ bots, selectedBot, changeBot, loading }}>
      {children}
    </BotContext.Provider>
  );
}

// Hook personalizado para facilitar o uso
export function useBot() {
  return useContext(BotContext);
}