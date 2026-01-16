import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, MessageSquare, Clock, Shield, Key, Power, Activity, Headphones } from 'lucide-react';
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { botService } from '../services/api'; 
import Swal from 'sweetalert2';
import './Bots.css';

export function BotConfig() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Estado para configurações + STATUS
  const [config, setConfig] = useState({
    nome: '',
    token: '',
    id_canal_vip: '',
    admin_principal_id: '',
    suporte_username: '', // 🔥 NOVO CAMPO
    status: 'desconectado'
  });

  // Estados visuais das mensagens (Mantidos)
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
          admin_principal_id: currentBot.admin_principal_id || '', 
          suporte_username: currentBot.suporte_username || '', // 🔥 CARREGA
          status: currentBot.status || 'desconectado'
        });
      }
    } catch (error) {
      console.error("Erro ao carregar bot", error);
      Swal.fire('Erro', 'Falha ao carregar dados do bot', 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- FUNÇÃO: LIGAR/DESLIGAR BOT ---
  const handleToggleBot = async () => {
    try {
      const response = await botService.toggleBot(id);
      setConfig(prev => ({ ...prev, status: response.status }));
      
      const isAtivo = response.status === 'ativo';
      Swal.fire({
        title: isAtivo ? 'Bot Ativado! 🟢' : 'Bot Pausado! 🔴',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        background: '#151515', color: '#fff'
      });
    } catch (error) {
      Swal.fire('Erro', 'Falha ao alterar status do bot.', 'error');
    }
  };

  // Função de Salvar Configurações
  const handleSaveConnection = async () => {
    try {
      await botService.updateBot(id, {
        nome: config.nome,
        token: config.token,
        id_canal_vip: config.id_canal_vip,
        admin_principal_id: config.admin_principal_id,
        suporte_username: config.suporte_username // 🔥 SALVA
      });
      
      Swal.fire({
        title: 'Atualizado!',
        text: 'Configurações e Menu salvos com sucesso.',
        icon: 'success',
        background: '#151515', color: '#fff'
      });
    } catch (error) {
      console.error(error);
      Swal.fire('Erro', 'Falha ao atualizar configurações.', 'error');
    }
  };

  const isOnline = config.status === 'ativo';

  return (
    <div className="bots-container">
      
      <div className="bots-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Button variant="ghost" size="icon" onClick={() => navigate('/bots')}>
            <ArrowLeft size={24} />
          </Button>
          <div>
            <h1>Configurar: {config.nome || `Bot #${id}`}</h1>
            <p style={{ color: 'var(--muted-foreground)' }}>Gerencie conexão, admins e status.</p>
          </div>
        </div>
      </div>

      {loading ? <p style={{color:'#888', marginLeft:'20px'}}>Carregando configurações...</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* --- CARD 0: CONTROLE DE STATUS --- */}
          <Card style={{ border: isOnline ? '1px solid #10b981' : '1px solid #ef4444', background: isOnline ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)' }}>
            <CardContent>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: isOnline ? '#10b981' : '#ef4444' }}>
                        <Activity size={24} />
                        <div>
                            <h3 style={{ margin: 0, color: '#fff' }}>Status do Bot: {isOnline ? 'ATIVO' : 'PAUSADO'}</h3>
                            <p style={{margin:0, fontSize:'0.85rem', color:'#aaa'}}>
                                {isOnline ? 'O bot está respondendo mensagens normalmente.' : 'O bot está ignorando todas as mensagens.'}
                            </p>
                        </div>
                    </div>
                    <Button 
                        onClick={handleToggleBot}
                        style={{
                            background: isOnline ? '#ef4444' : '#10b981', 
                            color: '#fff',
                            minWidth: '120px'
                        }}
                    >
                        <Power size={18} style={{marginRight:'8px'}}/>
                        {isOnline ? 'PAUSAR' : 'ATIVAR'}
                    </Button>
                </div>
            </CardContent>
          </Card>

          {/* --- CARD 1: CREDENCIAIS --- */}
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

           {/* --- CARD 2: ADMINISTRAÇÃO E SUPORTE --- */}
           <Card style={{ border: '1px solid #3b82f6', background: 'rgba(59, 130, 246, 0.05)' }}>
            <CardContent>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: '#3b82f6' }}>
                <Shield size={24} />
                <h3 style={{ margin: 0, color: '#fff' }}>Administração e Suporte</h3>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="form-group">
                    <label style={{marginBottom:'5px', color:'#ccc'}}>ID do Admin Principal</label>
                    <input 
                    className="input-field" 
                    placeholder="Ex: 123456789"
                    value={config.admin_principal_id}
                    onChange={e => setConfig({...config, admin_principal_id: e.target.value})}
                    style={{width: '100%', padding: '10px', background: '#0a0a0a', border: '1px solid #333', color: '#fff', borderRadius: '6px'}}
                    />
                    <small style={{color:'#666'}}>Recebe alertas de vendas.</small>
                </div>

                {/* 🔥 NOVO CAMPO: USERNAME DO SUPORTE */}
                <div className="form-group">
                    <label style={{marginBottom:'5px', color:'#ccc', display:'flex', alignItems:'center', gap:'5px'}}>
                        <Headphones size={16}/> Username do Suporte
                    </label>
                    <input 
                    className="input-field" 
                    placeholder="Ex: SeuUsuario (sem @)"
                    value={config.suporte_username}
                    onChange={e => setConfig({...config, suporte_username: e.target.value})}
                    style={{width: '100%', padding: '10px', background: '#0a0a0a', border: '1px solid #333', color: '#fff', borderRadius: '6px'}}
                    />
                    <small style={{color:'#666'}}>Aparece ao digitar /suporte.</small>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botão de Salvar Global */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={handleSaveConnection} style={{background: '#10b981', color:'#fff', width:'100%', padding:'12px'}}>
              <Save size={18} /> Salvar Configurações e Atualizar Menu
            </Button>
          </div>

          {/* --- ÁREA DE MENSAGENS (Visual apenas) --- */}
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