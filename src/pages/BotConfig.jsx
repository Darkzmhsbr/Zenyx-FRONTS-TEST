import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, MessageSquare, Clock, Shield } from 'lucide-react';
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { botService } from '../services/api'; 
import Swal from 'sweetalert2';
import './Bots.css';

export function BotConfig() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Estado para configurações do Bot
  const [config, setConfig] = useState({
    nome: '',
    token: '',
    id_canal_vip: '',
    admin_principal_id: '' // NOVO CAMPO
  });

  // Estados visuais para mensagens (Mantidos da sua versão original)
  const [welcomeMsg, setWelcomeMsg] = useState("Olá! Seja bem-vindo ao nosso atendimento.");
  const [fallbackMsg, setFallbackMsg] = useState("Não entendi. Digite /ajuda para ver as opções.");

  useEffect(() => {
    carregarDados();
  }, [id]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const bots = await botService.listBots();
      // Converte id da URL para número para comparar
      const botAtual = bots.find(b => b.id === parseInt(id));
      
      if (botAtual) {
        setConfig({
          nome: botAtual.nome || '',
          token: botAtual.token || '',
          id_canal_vip: botAtual.id_canal_vip || '',
          admin_principal_id: botAtual.admin_principal_id || '' // Carrega do banco
        });
        
        // Se a API retornar flow, poderíamos setar welcomeMsg aqui também
        // Por enquanto mantemos o estado local visual
      }
    } catch (error) {
      Swal.fire('Erro', 'Falha ao carregar dados do bot', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await botService.updateBot(id, config);
      Swal.fire('Sucesso', 'Configurações salvas com sucesso!', 'success');
    } catch (error) {
      Swal.fire('Erro', 'Falha ao salvar as configurações.', 'error');
    }
  };

  return (
    <div className="bot-config-container">
      <div className="config-header">
        <Button variant="outline" onClick={() => navigate('/bots')}>
          <ArrowLeft size={18} /> Voltar
        </Button>
        <h1>Configurar Bot</h1>
      </div>

      <div className="config-grid">
        {/* Card de Conexão */}
        <Card>
          <CardContent>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: '#c333ff' }}>
              <MessageSquare size={24} />
              <h3 style={{ margin: 0, color: 'var(--foreground)' }}>Conexão com Telegram</h3>
            </div>

            <div className="form-group">
              <label>Nome do Bot (Interno)</label>
              <input 
                className="input-field" 
                value={config.nome}
                onChange={e => setConfig({...config, nome: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Token do Bot (BotFather)</label>
              <input 
                className="input-field" 
                value={config.token}
                onChange={e => setConfig({...config, token: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>ID do Canal VIP (Ex: -100...)</label>
              <input 
                className="input-field" 
                value={config.id_canal_vip}
                onChange={e => setConfig({...config, id_canal_vip: e.target.value})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Card de Boas Vindas (Mantido da sua versão) */}
        <Card>
          <CardContent>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', color: '#10b981' }}>
              <MessageSquare size={24} />
              <h3 style={{ margin: 0, color: 'var(--foreground)' }}>Mensagem de Boas-vindas</h3>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)', marginBottom: '15px' }}>
              Esta mensagem será enviada quando o usuário clicar em "Começar" (/start).
            </p>
            <textarea 
              className="input-field" 
              style={{ minHeight: '120px', resize: 'vertical', fontFamily: 'inherit', width: '100%', padding:'10px', background:'#0a0a0a', border:'1px solid #333', color:'#fff', borderRadius:'6px' }}
              value={welcomeMsg}
              onChange={(e) => setWelcomeMsg(e.target.value)}
              placeholder="Edite no menu Flow Chat..."
              disabled // Desabilitado visualmente para focar na conexão neste menu
            />
            <small style={{color:'#666', marginTop:'5px', display:'block'}}>*Para editar o fluxo completo, vá no menu "Flow Chat".</small>
          </CardContent>
        </Card>

        {/* Card de Resposta Padrão (Mantido da sua versão) */}
        <Card>
          <CardContent>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', color: '#f59e0b' }}>
              <Clock size={24} />
              <h3 style={{ margin: 0, color: 'var(--foreground)' }}>Mensagem de Erro/Padrão</h3>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)', marginBottom: '15px' }}>
              Enviada quando o bot não entende o comando do usuário.
            </p>
            <textarea 
              className="input-field" 
              style={{ minHeight: '120px', resize: 'vertical', fontFamily: 'inherit', width: '100%', padding:'10px', background:'#0a0a0a', border:'1px solid #333', color:'#fff', borderRadius:'6px' }}
              value={fallbackMsg}
              onChange={(e) => setFallbackMsg(e.target.value)}
              placeholder="Edite no menu Flow Chat..."
              disabled
            />
          </CardContent>
        </Card>

        {/* Card de Administração e Notificações (NOVO - ADICIONADO AQUI) */}
        <Card>
          <CardContent>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: '#3b82f6' }}>
              <Shield size={24} />
              <h3 style={{ margin: 0, color: 'var(--foreground)' }}>Notificações ao Admin</h3>
            </div>

            <div className="form-group">
              <label>ID do Admin Principal (Telegram)</label>
              <p style={{fontSize:'0.8rem', color:'#888', marginBottom:'8px'}}>
                Cole aqui o seu ID numérico do Telegram. O bot enviará avisos de vendas aprovadas e status para este ID.
              </p>
              <input 
                className="input-field" 
                placeholder="Ex: 123456789"
                value={config.admin_principal_id}
                onChange={e => setConfig({...config, admin_principal_id: e.target.value})}
              />
            </div>
            
            <div style={{marginTop:'15px', padding:'10px', background:'rgba(59, 130, 246, 0.1)', borderRadius:'8px', fontSize:'0.85rem', border:'1px solid rgba(59, 130, 246, 0.2)'}}>
                <p style={{margin:'0 0 5px 0', fontWeight:'bold', color:'#60a5fa'}}>🔔 Você será notificado quando:</p>
                <ul style={{margin:0, paddingLeft:'20px', color:'#ccc'}}>
                    <li>Uma venda for aprovada (PIX pago).</li>
                    <li>O bot for pausado ou ativado pelo painel.</li>
                </ul>
            </div>

            <div style={{ marginTop: '30px', textAlign: 'right' }}>
              <Button onClick={handleSave} style={{ width: '100%', background: '#10b981', color: '#fff', padding:'12px' }}>
                <Save size={18} /> Salvar Todas as Configurações
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}