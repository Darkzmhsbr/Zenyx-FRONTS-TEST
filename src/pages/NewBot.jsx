import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { ArrowLeft, Bot, ShieldCheck, Zap, LayoutTemplate, MessageSquare, ShoppingBag, ChevronRight } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { botService } from '../services/api';
import { useBot } from '../context/BotContext';
import './Bots.css';

export function NewBot() {
  const navigate = useNavigate();
  const { refreshBots } = useBot();
  
  // Controle de Passos: 'selection' | 'form'
  const [step, setStep] = useState('selection');
  // Define para onde ir após criar: 'geral' ou 'miniapp'
  const [targetTab, setTargetTab] = useState('geral');

  // Estados do Formulário
  const [token, setToken] = useState('');
  const [channelId, setChannelId] = useState('');
  const [botName, setBotName] = useState('');
  const [loading, setLoading] = useState(false);

  // Seleciona o tipo e avança para o formulário
  const handleSelectType = (type) => {
    setTargetTab(type === 'custom' ? 'miniapp' : 'geral');
    setStep('form');
  };

  const handleSave = async () => {
    if (!token || !channelId) return Swal.fire('Erro', 'Preencha o Token e o ID do Canal!', 'warning');
    
    setLoading(true);

    try {
      const dados = {
        nome: botName || "Bot Zenyx",
        token: token.trim(),
        id_canal_vip: channelId.trim()
      };

      // 1. Cria o Bot
      const response = await botService.createBot(dados);
      
      // 2. Atualiza lista no contexto
      await refreshBots();

      Swal.fire({
        title: 'Sucesso!',
        text: 'Bot conectado com sucesso.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        background: '#151515', color: '#fff'
      });

      // 3. Redireciona para a configuração JÁ NA ABA CERTA
      // Passamos 'initialTab' no state da navegação
      navigate(`/bots/config/${response.id}`, { 
        state: { initialTab: targetTab } 
      });

    } catch (error) {
      console.error(error);
      Swal.fire({
        title: 'Erro!',
        text: error.response?.data?.detail || 'Falha ao criar bot.',
        icon: 'error',
        background: '#151515', color: '#fff'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-bot-container" style={{ padding: '30px', maxWidth: '900px', margin: '0 auto', color: '#fff' }}>
      
      {/* HEADER COM VOLTAR */}
      <div style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <Button variant="ghost" onClick={() => step === 'form' ? setStep('selection') : navigate('/bots')}>
          <ArrowLeft size={20} /> Voltar
        </Button>
        <h1 style={{ margin: 0, fontSize: '1.8rem' }}>
          {step === 'selection' ? 'Qual o seu objetivo?' : 'Conectar Novo Bot'}
        </h1>
      </div>

      {/* --- PASSO 1: SELEÇÃO --- */}
      {step === 'selection' && (
        <div className="selection-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          
          {/* CARD 1: TRADICIONAL */}
          <div 
            onClick={() => handleSelectType('traditional')}
            className="selection-card"
            style={{
              background: '#151515', border: '1px solid #333', borderRadius: '12px', padding: '30px',
              cursor: 'pointer', transition: 'all 0.2s', position: 'relative', overflow: 'hidden'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#c333ff'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#333'}
          >
            <div style={{ background: 'rgba(195, 51, 255, 0.1)', width: 60, height: 60, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <MessageSquare size={32} color="#c333ff" />
            </div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '10px' }}>Bot Tradicional</h3>
            <p style={{ color: '#888', lineHeight: '1.5', marginBottom: '20px' }}>
              Focado em atendimento e vendas diretas. Configurar planos, mensagens automáticas, remarketing e gestão de assinaturas.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', color: '#c333ff', fontWeight: 'bold', fontSize: '0.9rem' }}>
              Configurar Chat <ChevronRight size={16} />
            </div>
          </div>

          {/* CARD 2: PERSONALIZADO (LOJA) */}
          <div 
            onClick={() => handleSelectType('custom')}
            className="selection-card"
            style={{
              background: '#151515', border: '1px solid #333', borderRadius: '12px', padding: '30px',
              cursor: 'pointer', transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#10b981'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#333'}
          >
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', width: 60, height: 60, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <ShoppingBag size={32} color="#10b981" />
            </div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '10px' }}>Bot Personalizado (Loja)</h3>
            <p style={{ color: '#888', lineHeight: '1.5', marginBottom: '20px' }}>
              Crie uma experiência visual rica com Mini App. Configure interface de loja, categorias, mídias, banners e catálogo de produtos.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', color: '#10b981', fontWeight: 'bold', fontSize: '0.9rem' }}>
              Criar Loja / MiniApp <ChevronRight size={16} />
            </div>
          </div>

        </div>
      )}

      {/* --- PASSO 2: FORMULÁRIO (Igual ao anterior) --- */}
      {step === 'form' && (
        <div className="form-container" style={{ maxWidth: '500px', margin: '0 auto', animation: 'fadeIn 0.3s ease' }}>
          <div style={{ background: '#151515', padding: '30px', borderRadius: '12px', border: '1px solid #333' }}>
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
              <div style={{ 
                background: targetTab === 'miniapp' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(195, 51, 255, 0.1)', 
                color: targetTab === 'miniapp' ? '#10b981' : '#c333ff',
                padding: '10px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '8px' 
              }}>
                {targetTab === 'miniapp' ? <ShoppingBag size={20}/> : <MessageSquare size={20}/>}
                <span>Criando {targetTab === 'miniapp' ? 'Bot Loja' : 'Bot Tradicional'}</span>
              </div>
            </div>

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

            <div style={{ paddingTop: '20px', marginTop: '10px' }}>
              <Button onClick={handleSave} style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Conectando...' : <><ShieldCheck size={18} /> Salvar e Continuar</>}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}