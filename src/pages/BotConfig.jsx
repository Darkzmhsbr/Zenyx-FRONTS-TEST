import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, MessageSquare, Clock, Shield, Key } from 'lucide-react';
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { botService } from '../services/api';
import Swal from 'sweetalert2';
import './Bots.css';

export function BotConfig() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Estado para configurações (Fundido: Antigo + Novo Campo Admin)
  const [config, setConfig] = useState({
    nome: '',
    token: '',
    id_canal_vip: '',
    admin_principal_id: '' // NOVO CAMPO INSERIDO
  });

  // Estados visuais (Mantidos)
  const [welcomeMsg, setWelcomeMsg] = useState("Olá! Seja bem-vindo ao nosso atendimento.");
  const [fallbackMsg, setFallbackMsg] = useState("Não entendi. Digite /ajuda para ver as opções.");

  useEffect(() => {
    carregarDados();
  }, [id]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const bots = await botService.listBots();
      const currentBot = bots.find(b => b.id === parseInt(id));
      
      if (currentBot) {
        setConfig({
          nome: currentBot.nome || '',
          token: currentBot.token || '',
          id_canal_vip: currentBot.id_canal_vip || '',
          admin_principal_id: currentBot.admin_principal_id || '' // Carrega do banco
        });
      }
    } catch (error) {
      console.error("Erro ao carregar bot", error);
      Swal.fire('Erro', 'Falha ao carregar dados do bot', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Função de Salvar Atualizada (Salva tudo, incluindo o Admin ID)
  const handleSaveConnection = async () => {
    try {
      await botService.updateBot(id, {
        nome: config.nome,
        token: config.token,
        id_canal_vip: config.id_canal_vip,
        admin_principal_id: config.admin_principal_id // Envia o novo campo
      });
      
      Swal.fire({
        title: 'Atualizado!',
        text: 'Configurações salvas com sucesso.',
        icon: 'success',
        background: '#151515',
        color: '#fff'
      });
    } catch (error) {
      console.error(error);
      Swal.fire('Erro', 'Falha ao atualizar configurações.', 'error');
    }
  };

  return (
    <div className="bots-container">
      <div className="bots-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Button variant="ghost" size="icon" onClick={() => navigate('/bots')}>
            <ArrowLeft size={24} />
          </Button>
          <div>
            <h1>Configurar: {config.nome || `Bot #${id}`}</h1>
            <p style={{ color: 'var(--muted-foreground)' }}>Gerencie conexão, admins e respostas.</p>
          </div>
        </div>
      </div>

      {loading ? <p style={{color:'#888', marginLeft:'20px'}}>Carregando configurações...</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* --- CARD 1: CREDENCIAIS (Estrutura Antiga Preservada) --- */}
          <Card style={{ border: '1px solid #c333ff', background: 'rgba(195, 51, 255, 0.05)' }}>
            <CardContent>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: '#c333ff' }}>
                <Key size={24} />
                <h3 style={{ margin: 0, color: '#fff' }}>Credenciais de Conexão</h3>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label style={{display:'flex', alignItems:'center', gap:'5px', marginBottom:'5px', color:'#ccc'}}>
                    Token do Bot (Telegram)
                  </label>
                  <input 
                    className="input-field"
                    type="text"
                    value={config.token}
                    onChange={e => setConfig({...config, token: e.target.value})}
                    placeholder="123456:ABC-def..."
                    style={{width: '100%', padding: '10px', background: '#0a0a0a', border: '1px solid #333', color: '#fff', borderRadius: '6px'}}
                  />
                </div>

                <div className="form-group">
                  <label style={{marginBottom:'5px', color:'#ccc'}}>ID do Canal VIP</label>
                  <input 
                    className="input-field"
                    type="text"
                    value={config.id_canal_vip}
                    onChange={e => setConfig({...config, id_canal_vip: e.target.value})}
                    placeholder="-100..."
                    style={{width: '100%', padding: '10px', background: '#0a0a0a', border: '1px solid #333', color: '#fff', borderRadius: '6px'}}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

           {/* --- CARD 2: ADMINISTRAÇÃO (NOVO - Inserido aqui) --- */}
           <Card style={{ border: '1px solid #3b82f6', background: 'rgba(59, 130, 246, 0.05)' }}>
            <CardContent>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: '#3b82f6' }}>
                <Shield size={24} />
                <h3 style={{ margin: 0, color: '#fff' }}>Notificações ao Admin</h3>
              </div>
              
              <div className="form-group">
                <label style={{marginBottom:'5px', color:'#ccc'}}>ID do Admin Principal (Telegram)</label>
                <p style={{fontSize:'0.8rem', color:'#888', marginBottom:'8px'}}>
                    Receberá avisos de vendas aprovadas e alertas do sistema.
                </p>
                <input 
                  className="input-field" 
                  placeholder="Ex: 123456789"
                  value={config.admin_principal_id}
                  onChange={e => setConfig({...config, admin_principal_id: e.target.value})}
                  style={{width: '100%', padding: '10px', background: '#0a0a0a', border: '1px solid #333', color: '#fff', borderRadius: '6px'}}
                />
              </div>
              
              <div style={{marginTop:'15px', padding:'10px', background:'rgba(59, 130, 246, 0.1)', borderRadius:'8px', fontSize:'0.85rem', border:'1px solid rgba(59, 130, 246, 0.2)'}}>
                  <p style={{margin:'0 0 5px 0', fontWeight:'bold', color:'#60a5fa'}}>🔔 Você será notificado quando:</p>
                  <ul style={{margin:0, paddingLeft:'20px', color:'#ccc'}}>
                      <li>Uma venda for aprovada (PIX pago).</li>
                      <li>O bot for pausado ou ativado.</li>
                  </ul>
              </div>
            </CardContent>
          </Card>

          {/* Botão de Salvar Global */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={handleSaveConnection} style={{background: '#10b981', color:'#fff', width:'100%', padding:'12px'}}>
              <Save size={18} /> Salvar Todas as Configurações
            </Button>
          </div>

          {/* --- ÁREA DE MENSAGENS (Mantida Visualmente apenas, pois é editada no Flow) --- */}
          <div className="bots-grid" style={{ gridTemplateColumns: '1fr 1fr', marginTop:'10px' }}>
            <Card>
              <CardContent>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', color: '#10b981' }}>
                  <MessageSquare size={24} />
                  <h3 style={{ margin: 0, color: 'var(--foreground)' }}>Boas-vindas</h3>
                </div>
                <textarea 
                  className="input-field" 
                  style={{ minHeight: '100px', resize: 'vertical', fontFamily: 'inherit', width: '100%', padding:'10px', background:'#0a0a0a', border:'1px solid #333', color:'#fff', borderRadius:'6px' }}
                  value={welcomeMsg}
                  onChange={(e) => setWelcomeMsg(e.target.value)}
                  placeholder="Edite no menu Flow Chat..."
                  disabled 
                />
                <small style={{color:'#666'}}>*Edite no menu Flow Chat</small>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', color: '#f59e0b' }}>
                  <Clock size={24} />
                  <h3 style={{ margin: 0, color: 'var(--foreground)' }}>Mensagem de Erro</h3>
                </div>
                <textarea 
                  className="input-field" 
                  style={{ minHeight: '100px', resize: 'vertical', fontFamily: 'inherit', width: '100%', padding:'10px', background:'#0a0a0a', border:'1px solid #333', color:'#fff', borderRadius:'6px' }}
                  value={fallbackMsg}
                  onChange={(e) => setFallbackMsg(e.target.value)}
                  placeholder="Edite no menu Flow Chat..."
                  disabled 
                />
                 <small style={{color:'#666'}}>*Edite no menu Flow Chat</small>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}