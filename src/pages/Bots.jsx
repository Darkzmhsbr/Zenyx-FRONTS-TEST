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
  const toggleBotStatus = async (id) => {
    try {
      // Chama API para persistir a mudança
      const updatedBot = await botService.toggleBot(id);
      
      // Atualiza visualmente
      setBots(bots.map(bot => {
        if (bot.id === id) {
          return { ...bot, status: updatedBot.status };
        }
        return bot;
      }));
    } catch (error) {
      Swal.fire('Erro', 'Não foi possível alterar o status.', 'error');
    }
  };

  // --- EXCLUIR BOT ---
  const handleDeleteBot = async (id) => {
    // Fecha o menu
    setActiveMenu(null);

    const result = await Swal.fire({
      title: 'Tem certeza?',
      text: "Isso apagará o bot, histórico de vendas e configurações. Não pode ser desfeito!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#333',
      confirmButtonText: 'Sim, excluir',
      background: '#151515',
      color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        await botService.deleteBot(id);
        setBots(bots.filter(b => b.id !== id)); // Remove da lista visualmente
        Swal.fire({
          title: 'Excluído!',
          text: 'O bot foi removido com sucesso.',
          icon: 'success',
          background: '#151515',
          color: '#fff'
        });
      } catch (error) {
        Swal.fire('Erro', 'Falha ao excluir o bot.', 'error');
      }
    }
  };

  return (
    <div className="bots-container" onClick={() => setActiveMenu(null)}>
      
      <div className="bots-header">
        <div>
          <h1>Meus Bots</h1>
          <p style={{ color: 'var(--muted-foreground)' }}>Gerencie suas instâncias e conexões.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="ghost" onClick={carregarBots}>
            <RefreshCcw size={18} />
          </Button>
          <Button onClick={() => navigate('/bots/new')}>
            <Plus size={18} /> Novo Bot
          </Button>
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted-foreground)', textAlign: 'center', marginTop: '40px' }}>
          Carregando seus bots...
        </p>
      ) : bots.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', border: '1px dashed var(--card-border)', borderRadius: '12px' }}>
          <p style={{ color: 'var(--muted-foreground)' }}>Nenhum bot encontrado.</p>
          <Button variant="outline" style={{ marginTop: '10px' }} onClick={() => navigate('/bots/new')}>
            Cadastrar meu primeiro Bot
          </Button>
        </div>
      ) : (
        <div className="bots-grid">
          {bots.map((bot) => (
            <Card key={bot.id} className="bot-card">
              <CardContent>
                
                <div className="bot-header-row" style={{position: 'relative'}}>
                  <div className="bot-identity">
                    <div className="bot-icon">
                      <Send size={24} />
                    </div>
                    <div className="bot-info">
                      <h3>{bot.nome}</h3> 
                      <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                        Token: {bot.token ? bot.token.substring(0, 10) + '...' : '****'}
                      </p>
                    </div>
                  </div>
                  
                  {/* --- MENU DE TRÊS PONTOS --- */}
                  <div style={{position: 'relative'}}>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      style={{ color: 'var(--muted-foreground)' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenu(activeMenu === bot.id ? null : bot.id);
                      }}
                    >
                      <MoreVertical size={20} />
                    </Button>

                    {/* DROPDOWN MENU */}
                    {activeMenu === bot.id && (
                      <div className="dropdown-menu" style={{
                        position: 'absolute',
                        right: 0,
                        top: '40px',
                        background: '#1a1a1a',
                        border: '1px solid #333',
                        borderRadius: '8px',
                        zIndex: 100,
                        width: '150px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                      }}>
                        <button 
                          onClick={() => handleDeleteBot(bot.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            width: '100%', padding: '10px 15px',
                            background: 'transparent', border: 'none',
                            color: '#ef4444', cursor: 'pointer', textAlign: 'left',
                            fontSize: '0.9rem'
                          }}
                        >
                          <Trash2 size={16} /> Excluir Bot
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bot-stats">
                  <div className="stat-item">
                    <span className="stat-label">Leads</span>
                    <span className="stat-value">{bot.leads || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Receita</span>
                    <span className="stat-value" style={{ color: '#10b981' }}>
                      R$ {(bot.revenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="bot-footer">
                  {/* Status Visual: Online = Verde / Pausado ou Erro = Vermelho */}
                  <div className={`status-indicator ${bot.status === 'conectado' ? 'online' : 'offline'}`}>
                    <span className="dot"></span>
                    {bot.status === 'conectado' ? 'Online' : 'Parado'}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {/* BOTÃO LIGA/DESLIGA */}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => toggleBotStatus(bot.id)}
                      style={{
                        borderColor: bot.status === 'conectado' ? '#ef4444' : '#10b981',
                        color: bot.status === 'conectado' ? '#ef4444' : '#10b981'
                      }}
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