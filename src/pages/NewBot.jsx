import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { ArrowLeft, Bot, ShieldCheck, Wifi } from 'lucide-react';
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { Input } from '../components/Input';
import { botService } from '../services/api';
import './Bots.css';

export function NewBot() {
  const navigate = useNavigate();
  
  const [token, setToken] = useState('');
  const [channelId, setChannelId] = useState('');
  const [botName, setBotName] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle');

  const handleSave = async () => {
    if (!token || !channelId) return Swal.fire('Erro', 'Preencha o Token e o ID do Canal!', 'warning');
    
    setLoading(true);
    setStatus('connecting');

    try {
      // 🔧 CORREÇÃO AQUI: Os nomes dos campos devem ser IGUAIS ao main.py (BotCreate)
      const dados = {
        nome: botName || "Bot Zenyx",     // Antes era 'name', agora é 'nome'
        token: token.trim(),              // 'token' continua igual
        id_canal_vip: channelId.trim()    // Antes era 'channel_id', agora é 'id_canal_vip'
      };

      console.log("📤 Enviando payload correto:", dados);

      await botService.createBot(dados);
      
      setStatus('success');
      Swal.fire({
        title: 'Conectado!',
        text: 'Bot configurado com sucesso no Railway.',
        icon: 'success',
        background: '#1b1730',
        color: '#fff'
      });
      
      setTimeout(() => navigate('/bots'), 1500);

    } catch (error) {
      console.error(error);
      setStatus('error');
      
      // Mensagem de erro amigável
      let msg = 'Erro desconhecido.';
      if (error.response?.status === 422) {
         msg = 'Erro de Validação: O backend rejeitou os dados. Verifique o console.';
      } else if (error.response?.data?.detail) {
         msg = error.response.data.detail;
      }

      Swal.fire({
        title: 'Falha na Conexão',
        text: msg,
        icon: 'error',
        background: '#1b1730',
        color: '#fff'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bots-container">
      <div className="bots-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft size={24} />
          </Button>
          <div>
            <h1>Cadastrar Novo Bot</h1>
            <p style={{ color: 'var(--muted-foreground)' }}>Conecte seu bot do Telegram e configure o Canal VIP.</p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <Card>
          <CardContent>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              
              {/* Status Visual */}
              <div style={{ 
                textAlign: 'center', padding: '20px', 
                background: status === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(42, 171, 238, 0.1)', 
                borderRadius: '12px', 
                border: status === 'error' ? '1px solid #ef4444' : 'none'
              }}>
                <Bot size={48} style={{ marginBottom: '10px', color: status === 'success' ? '#10b981' : '#2AABEE' }} />
                <h3 style={{ margin: '0 0 5px 0', color: 'var(--foreground)' }}>Status da Conexão</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                   <Wifi size={16} color={status === 'success' ? '#10b981' : (status === 'error' ? '#ef4444' : '#666')} />
                   <span style={{ fontWeight: 'bold', color: status === 'success' ? '#10b981' : (status === 'error' ? '#ef4444' : '#888') }}>
                     {status === 'idle' && 'Aguardando dados...'}
                     {status === 'connecting' && 'Enviando ao Servidor...'}
                     {status === 'success' && 'CONEXÃO ESTABELECIDA!'}
                     {status === 'error' && 'FALHA NA CONEXÃO'}
                   </span>
                </div>
              </div>

              {/* Formulário */}
              <Input 
                label="Nome Interno" 
                placeholder="Ex: Bot Principal" 
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
              />

              <Input 
                label="Token do Bot (BotFather)" 
                placeholder="Ex: 123456789:AAH..." 
                value={token}
                onChange={(e) => setToken(e.target.value)}
                helper="Copie o token gerado pelo @BotFather no Telegram."
              />

              <Input 
                label="ID do Canal VIP" 
                placeholder="Ex: -1001234567890" 
                value={channelId}
                onChange={(e) => setChannelId(e.target.value)}
                helper="O bot deve ser ADMIN do canal. Pegue o ID com o @userinfobot."
              />

              <div style={{ paddingTop: '10px', borderTop: '1px solid var(--card-border)', marginTop: '10px' }}>
                <Button onClick={handleSave} style={{ width: '100%' }} disabled={loading}>
                  {loading ? 'Conectando...' : <><ShieldCheck size={18} /> Salvar e Conectar</>}
                </Button>
              </div>

            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}