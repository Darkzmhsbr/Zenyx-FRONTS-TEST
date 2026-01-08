import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, MessageSquare, Clock, Shield, Key } from 'lucide-react';
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { botService } from '../services/api'; // Serviço de API
import Swal from 'sweetalert2';
import './Bots.css';

export function BotConfig() {
  const { id } = useParams(); // Pega o ID do bot da URL
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Estado para configurações do Bot (Conexão)
  const [config, setConfig] = useState({
    nome: '',
    token: '',
    id_canal_vip: ''
  });

  // Estados visuais para mensagens (Mantidos da estrutura original)
  const [welcomeMsg, setWelcomeMsg] = useState("Olá! Seja bem-vindo ao nosso atendimento.");
  const [fallbackMsg, setFallbackMsg] = useState("Não entendi. Digite /ajuda para ver as opções.");

  // Carrega os dados reais do bot ao abrir a página
  useEffect(() => {
    carregarDados();
  }, [id]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      // Busca a lista para encontrar o bot atual (padrão do projeto)
      const bots = await botService.listBots();
      const currentBot = bots.find(b => b.id === parseInt(id));
      
      if (currentBot) {
        setConfig({
          nome: currentBot.nome,
          token: currentBot.token,
          id_canal_vip: currentBot.id_canal_vip
        });
      }
    } catch (error) {
      console.error("Erro ao carregar bot", error);
      Swal.fire('Erro', 'Falha ao carregar dados do bot', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Função para salvar as credenciais (Token/ID)
  const handleSaveConnection = async () => {
    try {
      await botService.updateBot(id, {
        nome: config.nome,
        token: config.token,
        id_canal_vip: config.id_canal_vip
      });
      
      Swal.fire({
        title: 'Atualizado!',
        text: 'Configurações de conexão salvas. O Webhook foi reconfigurado automaticamente.',
        icon: 'success',
        background: '#151515',
        color: '#fff'
      });
    } catch (error) {
      console.error(error);
      Swal.fire('Erro', 'Falha ao atualizar conexão.', 'error');
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
            <p style={{ color: 'var(--muted-foreground)' }}>Gerencie conexão e respostas.</p>
          </div>
        </div>
      </div>

      {loading ? <p style={{color:'#888', marginLeft:'20px'}}>Carregando configurações...</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* --- NOVA ÁREA: CREDENCIAIS DE CONEXÃO --- */}
          <Card style={{ border: '1px solid #c333ff', background: 'rgba(195, 51, 255, 0.05)' }}>
            <CardContent>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: '#c333ff' }}>
                <Shield size={24} />
                <h3 style={{ margin: 0, color: '#fff' }}>Credenciais de Conexão</h3>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label style={{display:'flex', alignItems:'center', gap:'5px', marginBottom:'5px', color:'#ccc'}}>
                    <Key size={14}/> Token do Bot (Telegram)
                  </label>
                  <input 
                    className="input-field"
                    type="text"
                    value={config.token}
                    onChange={e => setConfig({...config, token: e.target.value})}
                    placeholder="123456:ABC-def..."
                    style={{width: '100%', padding: '10px', background: '#0a0a0a', border: '1px solid #333', color: '#fff', borderRadius: '6px'}}
                  />
                  <small style={{color:'#aaa', fontSize:'0.8rem'}}>Alterar isso desconecta o bot atual e conecta o novo imediatamente.</small>
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
                  <small style={{color:'#aaa', fontSize:'0.8rem'}}>Onde o bot adiciona/remove usuários.</small>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={handleSaveConnection} style={{background: '#c333ff'}}>
                  🔄 Atualizar Conexão
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* --- ÁREA DE MENSAGENS (MANTIDA DA ESTRUTURA ORIGINAL) --- */}
          <div className="bots-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            
            {/* Card de Boas-vindas */}
            <Card>
              <CardContent>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', color: 'var(--primary)' }}>
                  <MessageSquare size={24} />
                  <h3 style={{ margin: 0, color: 'var(--foreground)' }}>Boas-vindas</h3>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)', marginBottom: '15px' }}>
                  Enviada assim que o usuário clica em "Começar" ou envia a primeira mensagem.
                </p>
                <textarea 
                  className="input-field" 
                  style={{ minHeight: '120px', resize: 'vertical', fontFamily: 'inherit', width: '100%', padding:'10px', background:'#0a0a0a', border:'1px solid #333', color:'#fff', borderRadius:'6px' }}
                  value={welcomeMsg}
                  onChange={(e) => setWelcomeMsg(e.target.value)}
                  placeholder="Edite no menu Flow Chat..."
                  disabled // Desabilitado visualmente para focar na conexão
                />
              </CardContent>
            </Card>

            {/* Card de Resposta Padrão */}
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
                  disabled // Desabilitado visualmente para focar na conexão
                />
              </CardContent>
            </Card>

          </div>
        </div>
      )}
    </div>
  );
}