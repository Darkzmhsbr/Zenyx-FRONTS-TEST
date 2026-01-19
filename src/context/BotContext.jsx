import React, { createContext, useState, useEffect, useContext } from 'react';
import { botService } from '../services/api';
// 👇 1. Importamos o Auth para saber quando o usuário muda
import { useAuth } from './AuthContext';

const BotContext = createContext();

export function BotProvider({ children }) {
  const [bots, setBots] = useState([]);
  const [selectedBot, setSelectedBot] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 👇 2. Pegamos o usuário atual do sistema
  const { user } = useAuth();

  // Carrega bots ao iniciar E SEMPRE que o usuário mudar
  useEffect(() => {
    loadBots();
  }, [user]); // 👈 O segredo está aqui: Mudou o user? Recarrega os bots!

  async function loadBots() {
    try {
      setLoading(true);
      
      // 1. Busca TODOS os bots do banco (Raw Data)
      const allBots = await botService.listBots();
      
      // 2. Identifica quem está logado (Usa o user do Contexto ou do Storage por garantia)
      const loggedUser = user || JSON.parse(localStorage.getItem('zenyx_admin_user'));
      
      let finalBots = allBots;

      // 3. 🕵️‍♂️ APLICA O FILTRO DE VISÃO (Blindado)
      if (loggedUser && loggedUser.role !== 'master') {
          const allowed = loggedUser.allowed_bots || [];
          
          // 🔥 FILTRO BLINDADO: Converte tudo para String para evitar erro (3 vs "3")
          finalBots = allBots.filter(bot => 
            allowed.map(String).includes(String(bot.id))
          );
      }

      setBots(finalBots);
      
      // 4. Lógica de Seleção Automática
      if (finalBots.length > 0) {
          // Se o bot selecionado anteriormente não é permitido, muda para o primeiro da lista
          if (selectedBot && !finalBots.find(b => b.id === selectedBot.id)) {
             setSelectedBot(finalBots[0]);
             localStorage.setItem('zenyx_selected_bot', finalBots[0].id);
          } 
          // Se não tem nada selecionado, pega o salvo ou o primeiro
          else if (!selectedBot) {
             const savedBotId = localStorage.getItem('zenyx_selected_bot');
             const found = finalBots.find(b => String(b.id) === String(savedBotId));
             setSelectedBot(found || finalBots[0]);
          }
      } else {
          // Se não sobrou nenhum bot (lista vazia), limpa a seleção
          setSelectedBot(null);
      }

    } catch (error) {
      console.error("Erro ao carregar bots no contexto:", error);
    } finally {
      setLoading(false);
    }
  }

  const changeBot = (bot) => {
    setSelectedBot(bot);
    localStorage.setItem('zenyx_selected_bot', bot.id);
  };

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

export function useBot() {
  return useContext(BotContext);
}