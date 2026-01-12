import React, { createContext, useState, useEffect, useContext } from 'react';
import { botService } from '../services/api';

const BotContext = createContext();

export function BotProvider({ children }) {
  const [bots, setBots] = useState([]);
  const [selectedBot, setSelectedBot] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carrega bots ao iniciar
  useEffect(() => {
    loadBots();
  }, []);

  // [NOVO] Função para carregar/recarregar bots
  async function loadBots() {
    try {
      setLoading(true);
      const data = await botService.listBots();
      setBots(data);
      
      // Se houver bots e nenhum selecionado, seleciona o primeiro automaticamente
      if (data.length > 0 && !selectedBot) {
          const savedBotId = localStorage.getItem('zenyx_selected_bot');
          const found = data.find(b => b.id.toString() === savedBotId);
          setSelectedBot(found || data[0]);
      }
      
      // [NOVO] Se o bot selecionado foi deletado, seleciona outro
      if (selectedBot && !data.find(b => b.id === selectedBot.id)) {
          setSelectedBot(data.length > 0 ? data[0] : null);
      }
    } catch (error) {
      console.error("Erro ao carregar bots no contexto:", error);
    } finally {
      setLoading(false);
    }
  }

  // Função para trocar de bot
  const changeBot = (bot) => {
    setSelectedBot(bot);
    localStorage.setItem('zenyx_selected_bot', bot.id);
  };

  // [NOVO] Função para forçar atualização da lista (chama após criar/deletar bot)
  const refreshBots = async () => {
    await loadBots();
  };

  return (
    <BotContext.Provider value={{ 
      bots, 
      selectedBot, 
      changeBot, 
      refreshBots,  // [NOVO] Expõe a função de refresh
      loading 
    }}>
      {children}
    </BotContext.Provider>
  );
}

// Hook personalizado para facilitar o uso
export function useBot() {
  return useContext(BotContext);
}
