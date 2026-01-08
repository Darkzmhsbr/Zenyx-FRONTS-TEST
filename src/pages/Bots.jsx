import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Send, Settings, Power, MoreVertical, RefreshCcw } from 'lucide-react';
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { botService } from '../services/api'; // Importando a API
import './Bots.css';

export function Bots() {
  const navigate = useNavigate();
  
  // Estado agora começa vazio e espera os dados da API
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔄 CARREGAR BOTS DO BACKEND
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

  // Função visual (backend ainda não tem endpoint de pausar bot, então é apenas visual)
  const toggleBotStatus = (id) => {
    setBots(bots.map(bot => {
      if (bot.id === id) {
        return { ...bot, status: bot.status === 'conectado' ? 'desconectado' : 'conectado' };
      }
      return bot;
    }));
  };

  return (
    <div className="bots-container">
      
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
                
                <div className="bot-header-row">
                  <div className="bot-identity">
                    <div className="bot-icon">
                      <Send size={24} />
                    </div>
                    <div className="bot-info">
                      <h3>{bot.nome}</h3> 
                      {/* Mascara o token para segurança visual */}
                      <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                        Token: {bot.token ? bot.token.substring(0, 10) + '...' : '****'}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" style={{ color: 'var(--muted-foreground)' }}>
                    <MoreVertical size={20} />
                  </Button>
                </div>

                <div className="bot-stats">
                  <div className="stat-item">
                    <span className="stat-label">Leads</span>
                    {/* EXIBE OS LEADS REAIS DO BANCO DE DADOS */}
                    <span className="stat-value">{bot.leads || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Receita</span>
                    {/* EXIBE A RECEITA REAL FORMATADA */}
                    <span className="stat-value" style={{ color: '#10b981' }}>
                        R$ {(bot.revenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="bot-footer">
                  {/* Status agora verifica 'conectado' vindo do banco */}
                  <div className={`status-indicator ${bot.status === 'conectado' ? 'online' : 'offline'}`}>
                    <span className="dot"></span>
                    {bot.status === 'conectado' ? 'Online' : 'Parado'}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button variant="outline" size="sm" onClick={() => toggleBotStatus(bot.id)}>
                      <Power size={16} color={bot.status === 'conectado' ? '#ef4444' : '#10b981'} />
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