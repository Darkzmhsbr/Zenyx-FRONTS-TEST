import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Send, Settings, Power, MoreVertical, RefreshCcw, Trash2 } from 'lucide-react';
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { botService } from '../services/api'; 
import Swal from 'sweetalert2';
import './Bots.css';

export function Bots() {
  const navigate = useNavigate();
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null); // Controla qual menu está aberto

  useEffect(() => {
    carregarBots();
    // Fecha o menu se clicar fora
    const handleClickOutside = () => setActiveMenu(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const carregarBots = async () => {
    try {
      setLoading(true);
      const dados = await botService.listBots();
      setBots(dados);
    } catch (error) {
      console.error("Erro ao buscar bots:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- LIGA / DESLIGA BOT ---
  const toggleBotStatus = async (e, id) => {
    e.stopPropagation(); // Evita abrir o menu se clicar no botão
    try {
      const updatedBot = await botService.toggleBot(id);
      
      // Atualiza visualmente
      setBots(bots.map(bot => {
        if (bot.id === id) {
          return { ...bot, status: updatedBot.status };
        }
        return bot;
      }));
      
      const isAtivo = updatedBot.status === 'ativo';
      
      const Toast = Swal.mixin({
        toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
        background: '#151515', color: '#fff'
      });
      Toast.fire({
        icon: isAtivo ? 'success' : 'warning',
        title: isAtivo ? 'Bot Ativado!' : 'Bot Pausado'
      });

    } catch (error) {
      Swal.fire('Erro', 'Falha ao alterar status.', 'error');
    }
  };

  // --- EXCLUIR BOT ---
  const handleDeleteBot = async (e, bot) => {
      e.stopPropagation();
      const result = await Swal.fire({
          title: `Excluir ${bot.nome}?`,
          text: "Isso apagará todo o histórico e configurações. Confirmar?",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Sim, excluir',
          background: '#151515', color: '#fff'
      });

      if (result.isConfirmed) {
          try {
              await botService.deleteBot(bot.id);
              setBots(bots.filter(b => b.id !== bot.id));
              Swal.fire({title: 'Excluído!', icon: 'success', background: '#151515', color: '#fff'});
          } catch (error) {
              Swal.fire('Erro', 'Falha ao excluir bot.', 'error');
          }
      }
  };

  return (
    <div className="bots-container">
      
      <div className="bots-header">
        <div>
            <h1>Meus Bots</h1>
            <p style={{color: 'var(--muted-foreground)'}}>Gerencie seus assistentes de venda.</p>
        </div>
        <Button onClick={() => navigate('/bots/new')}>
          <Plus size={20} /> Criar Novo Bot
        </Button>
      </div>

      {loading ? (
        <div style={{textAlign: 'center', padding: '50px', color: '#666'}}>
            <RefreshCcw className="spin" /> Carregando bots...
        </div>
      ) : bots.length === 0 ? (
        <div className="empty-state" style={{textAlign:'center', marginTop:'50px', color:'#555'}}>
            <h2>Você ainda não tem bots.</h2>
            <p>Clique em "Criar Novo Bot" para começar.</p>
        </div>
      ) : (
        <div className="bots-grid">
          {bots.map((bot) => (
            <Card key={bot.id} className="bot-card">
              <CardContent>
                
                <div className="bot-header-row">
                    <div className="bot-identity">
                        <div className="bot-icon">
                            <Send size={24} />
                        </div>
                        <div className="bot-info">
                            <h3>{bot.nome}</h3>
                            {/* Lógica do @ corrigida (Versão Antiga que funciona) */}
                            <p style={{color:'#888', fontSize:'0.9rem'}}>
                                {bot.username 
                                  ? (bot.username.toString().startsWith('@') ? bot.username : `@${bot.username}`) 
                                  : '...'}
                            </p>
                        </div>
                    </div>
                    
                    {/* MENU DE OPÇÕES (3 Pontinhos Moderno) */}
                    <div style={{position: 'relative'}} onClick={(e) => e.stopPropagation()}>
                        <button className="icon-btn" onClick={() => setActiveMenu(activeMenu === bot.id ? null : bot.id)}>
                            <MoreVertical size={20} color="#888" />
                        </button>
                        {activeMenu === bot.id && (
                            <div className="dropdown-menu glass-menu">
                                <div className="menu-item" onClick={() => navigate(`/bots/config/${bot.id}`)}>
                                    <Settings size={14}/> Configurar
                                </div>
                                <div className="menu-item danger" onClick={(e) => handleDeleteBot(e, bot)}>
                                    <Trash2 size={14}/> Excluir
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bot-stats">
                  <div className="stat-item">
                    <span className="stat-label">Leads Total</span>
                    {/* [CORREÇÃO 1] Mudado de leads_count para leads */}
                    <span className="stat-value">{bot.leads || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Receita Total</span>
                    {/* [CORREÇÃO 2] Mudado de vendas_total para revenue */}
                    <span className="stat-value highlight">
                        R$ {bot.revenue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                    </span>
                  </div>
                </div>

                <div className="bot-footer">
                  {/* Status Visual: Online = Verde / Pausado = Vermelho */}
                  <div className={`status-indicator ${bot.status === 'ativo' ? 'online' : 'offline'}`}>
                    <span className="dot"></span>
                    {bot.status === 'ativo' ? 'Online' : 'Parado'}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {/* BOTÃO LIGA/DESLIGA */}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={(e) => toggleBotStatus(e, bot.id)}
                      style={{
                        borderColor: bot.status === 'ativo' ? '#ef4444' : '#10b981',
                        color: bot.status === 'ativo' ? '#ef4444' : '#10b981'
                      }}
                      title={bot.status === 'ativo' ? "Pausar Bot" : "Ativar Bot"}
                    >
                      <Power size={16} />
                    </Button>
                    
                    <Button variant="primary" size="sm" onClick={() => navigate(`/bots/config/${bot.id}`)}>
                      <Settings size={16} /> Configurar
                    </Button>
                  </div>
                </div>

              </CardContent>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
}
