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

  // [NOVO] Função para carregar/recarregar bots COM FILTRAGEM
  async function loadBots() {
    try {
      setLoading(true);
      
      // 1. Busca TODOS os bots do banco (Raw Data)
      const allBots = await botService.listBots();
      
      // 2. Identifica quem está logado
      const loggedUser = JSON.parse(localStorage.getItem('zenyx_admin_user'));
      
      let finalBots = allBots;

      // 3. 🕵️‍♂️ APLICA O FILTRO DE VISÃO
      // Se existe usuário E ele NÃO é Master, aplica o filtro
      if (loggedUser && loggedUser.role !== 'master') {
          const allowed = loggedUser.allowed_bots || [];
          
          // Mantém apenas os bots cujo ID esteja na lista de permitidos
          finalBots = allBots.filter(bot => allowed.includes(bot.id));
      }

      setBots(finalBots);
      
      // 4. Lógica de Seleção Automática
      // Se houver bots visíveis e nenhum selecionado
      if (finalBots.length > 0 && !selectedBot) {
          const savedBotId = localStorage.getItem('zenyx_selected_bot');
          // Tenta achar o bot salvo dentro da lista PERMITIDA
          const found = finalBots.find(b => b.id.toString() === savedBotId);
          setSelectedBot(found || finalBots[0]);
      }
      
      // 5. Segurança: Se o bot selecionado sumiu (foi deletado ou perdeu permissão)
      if (selectedBot && !finalBots.find(b => b.id === selectedBot.id)) {
          setSelectedBot(finalBots.length > 0 ? finalBots[0] : null);
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

  // Função para forçar atualização da lista (chama após criar/deletar bot)
  const refreshBots = async () => {
    await loadBots();
  };

  return (
    <BotContext.Provider value={{ 
      bots, 
      selectedBot, 
      changeBot, 
      refreshBots,
      loading 
    }}>
      {children}
    </BotContext.Provider>
  );
}

// Hook personalizado
export function useBot() {
  return useContext(BotContext);
}