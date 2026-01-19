import React, { useState, useEffect } from 'react';
import { CreditCard, Save, CheckCircle, XCircle, ShieldCheck, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { integrationService } from '../services/api';
import { useBot } from '../context/BotContext'; // 🔥 [NOVO] Importante para saber qual bot é
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { Input } from '../components/Input';
import './Integrations.css';

export function Integrations() {
  const { selectedBot } = useBot(); // 🔥 Pega o bot selecionado no menu (Ex: ZeKinha)
  const [pushinStatus, setPushinStatus] = useState('verificando');
  const [tokenMask, setTokenMask] = useState('');
  const [newToken, setNewToken] = useState('');
  const [loading, setLoading] = useState(false);

  // Carrega status ao abrir a tela ou trocar de bot
  useEffect(() => {
    if (selectedBot) {
      carregarStatus();
    }
  }, [selectedBot]);

  const carregarStatus = async () => {
    if (!selectedBot) return;

    try {
      // 🔥 [CORREÇÃO] Passa o ID do bot selecionado
      const dados = await integrationService.getPushinStatus(selectedBot.id);
      
      if(dados) {
        setPushinStatus(dados.status || 'desconectado');
        setTokenMask(dados.token_mask || '');
        setNewToken(''); // Limpa o campo
      }
    } catch (error) {
      console.error("Erro ao carregar status:", error);
      setPushinStatus('desconectado');
    }
  };

  const handleSave = async () => {
    if (!selectedBot) {
        return Swal.fire('Atenção', 'Selecione um bot no menu superior primeiro.', 'warning');
    }
    if (!newToken) return Swal.fire('Erro', 'Cole o token primeiro!', 'warning');
    
    setLoading(true);
    try {
      // 🔥 [CORREÇÃO CRÍTICA] Envia o ID do Bot + O Token
      await integrationService.savePushinToken(selectedBot.id, newToken);
      
      Swal.fire({
        title: 'Conectado!',
        text: `Token salvo com sucesso para o bot ${selectedBot.nome}.`,
        icon: 'success',
        background: '#1b1730',
        color: '#fff'
      });
      
      carregarStatus(); // Atualiza a tela
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: 'Erro',
        text: 'Falha ao salvar. Verifique se o token está correto.',
        icon: 'error',
        background: '#1b1730',
        color: '#fff'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!selectedBot) {
    return (
      <div className="integrations-container" style={{textAlign: 'center', marginTop: '50px'}}>
        <AlertCircle size={50} color="#c333ff" style={{marginBottom: '20px'}} />
        <h2>Nenhum Bot Selecionado</h2>
        <p style={{color: '#888'}}>Selecione um bot no menu superior para configurar o pagamento.</p>
      </div>
    );
  }

  return (
    <div className="integrations-container">
      <div style={{ marginBottom: '40px' }}>
        <h1>Integrações de Pagamento</h1>
        <p style={{ color: 'var(--muted-foreground)' }}>
          Configurando gateway para: <strong style={{color: '#c333ff'}}>{selectedBot.nome}</strong>
        </p>
      </div>

      <div className="integrations-grid">
        
        {/* Card do PushinPay */}
        <Card>
          <CardContent>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ 
                  width: '50px', height: '50px', borderRadius: '12px', 
                  background: 'linear-gradient(135deg, #00e676, #00a855)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' 
                }}>
                  <CreditCard size={28} />
                </div>
                <div>
                  <h3 style={{ margin: 0, color: 'var(--foreground)' }}>PushinPay</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>Pix Automático</p>
                </div>
              </div>

              {/* Badge de Status */}
              <div className={`status-badge ${pushinStatus === 'conectado' ? 'status-connected' : 'status-disconnected'}`}>
                {pushinStatus === 'conectado' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                {pushinStatus}
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
              <Input 
                label="Token da API (Bearer Token)" 
                placeholder={tokenMask ? "Token salvo (Oculto por segurança)" : "Cole seu token aqui..."}
                value={newToken}
                onChange={e => setNewToken(e.target.value)}
              />
              
              {tokenMask && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#10b981', marginTop: '8px' }}>
                  <ShieldCheck size={14} />
                  Token seguro: {tokenMask}
                </div>
              )}

              <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid var(--card-border)' }}>
                <Button onClick={handleSave} style={{ width: '100%' }} disabled={loading}>
                  {loading ? 'Salvando...' : <><Save size={18} /> Salvar Configuração</>}
                </Button>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Placeholder para MercadoPago ou Outros */}
        <Card style={{ opacity: 0.6, pointerEvents: 'none' }}>
          <CardContent>
             <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                <div style={{ 
                  width: '50px', height: '50px', borderRadius: '12px', 
                  background: '#222', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' 
                }}>
                  <CreditCard size={28} />
                </div>
                <div>
                  <h3 style={{ margin: 0, color: 'var(--muted-foreground)' }}>Mercado Pago</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#555' }}>Em breve</p>
                </div>
             </div>
             <p style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)' }}>Integração em desenvolvimento.</p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}