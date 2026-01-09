import React, { useState, useEffect } from 'react';
import { useBot } from '../context/BotContext';
import { remarketingService, planService } from '../services/api';
// IMPORTANTE: Adicionei os ícones que faltavam para o visual bonito
import { Send, Users, Image, MessageSquare, CheckCircle, AlertTriangle, History, Tag, Clock } from 'lucide-react';
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import Swal from 'sweetalert2';
import './Remarketing.css';

export function Remarketing() {
  const { selectedBot } = useBot();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  
  // Estado do Formulário
  const [formData, setFormData] = useState({
    target: 'todos', 
    mensagem: '',
    media_url: '',
    incluir_oferta: false,
    plano_oferta_id: '',
    price_mode: 'original',
    custom_price: '',
    expiration_mode: 'none',
    expiration_value: ''
  });

  useEffect(() => {
    if (selectedBot) {
      planService.listPlans(selectedBot.id).then(setPlans).catch(console.error);
    }
  }, [selectedBot]);

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSend = async () => {
    if (!formData.mensagem) return Swal.fire('Erro', 'Escreva uma mensagem!', 'error');
    
    setLoading(true);
    try {
      const payload = {
        bot_id: selectedBot.id,
        tipo_envio: formData.target,
        mensagem: formData.mensagem,
        media_url: formData.media_url || null,
        incluir_oferta: formData.incluir_oferta,
        plano_oferta_id: formData.plano_oferta_id || null,
        custom_price: formData.custom_price ? parseFloat(formData.custom_price) : 0.0,
        valor_oferta: formData.custom_price ? parseFloat(formData.custom_price) : 0.0,
        expiration_value: formData.expiration_value ? parseInt(formData.expiration_value) : 0,
        price_mode: formData.price_mode,
        expiration_mode: formData.expiration_mode,
        expire_timestamp: 0
      };
      
      await remarketingService.send(payload);
      
      Swal.fire({ title: 'Sucesso!', text: 'Campanha enviada.', icon: 'success', background: '#151515', color: '#fff' });
      setStep(1);
    } catch (error) {
      Swal.fire('Erro', 'Falha ao enviar.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // OPÇÕES DE PÚBLICO (CONFIGURAÇÃO VISUAL)
  const targetOptions = [
      { id: 'todos', label: 'Todos os Leads', sub: 'Pagantes, Pendentes e Expirados', icon: <Users /> },
      { id: 'pendentes', label: 'Pendentes', sub: 'Geraram PIX mas não pagaram', icon: <AlertTriangle color="#f59e0b"/> },
      { id: 'pagantes', label: 'Clientes Ativos', sub: 'Já compraram acesso', icon: <CheckCircle color="#10b981"/> },
      { id: 'expirados', label: 'Expirados', sub: 'Acesso vencido (Win-back)', icon: <History color="#ef4444"/> },
  ];

  if (!selectedBot) return <div className="empty-state"><h2>Selecione um bot.</h2></div>;

  return (
    <div className="remarketing-container">
      <div className="wizard-container">
          <h1 className="wizard-title">Campanha de Remarketing</h1>
          <p style={{textAlign:'center', color:'#888', marginBottom:'20px'}}>Envie mensagens em massa para recuperar vendas ou avisar clientes.</p>
          
          <div className="wizard-step-indicator">
             {step === 1 && "1. Público"} 
             {step === 2 && "2. Conteúdo"} 
             {step === 3 && "3. Enviar"}
          </div>

          <Card style={{border: '1px solid #333', background: '#0f0f0f'}}>
            <CardContent>
              {/* PASSO 1: PÚBLICO (RESTAURADO O GRID BONITO) */}
              {step === 1 && (
                <div className="fade-in">
                  <h3 style={{marginBottom:'20px', color:'#fff'}}>Quem deve receber?</h3>
                  
                  {/* AQUI ESTAVA O ERRO: USAMOS AS CLASSES CERTAS AGORA */}
                  <div className="wizard-options-grid">
                    {targetOptions.map(opt => (
                        <div 
                            key={opt.id} 
                            className={`option-card ${formData.target === opt.id ? 'selected' : ''}`} 
                            onClick={() => setFormData({...formData, target: opt.id})}
                        >
                            <div className="option-icon">{opt.icon}</div>
                            <div className="option-text">
                                <strong>{opt.label}</strong>
                                <span>{opt.sub}</span>
                            </div>
                        </div>
                    ))}
                  </div>
                  
                  <div className="wizard-actions" style={{justifyContent: 'flex-end'}}>
                      <button className="btn-next" onClick={handleNext}>Próximo</button>
                  </div>
                </div>
              )}

              {/* PASSO 2: CONTEÚDO */}
              {step === 2 && (
                <div className="fade-in">
                  <h3>Conteúdo da Mensagem</h3>
                  
                  <div className="form-group">
                    <label>Mensagem de Texto</label>
                    <textarea 
                        className="input-field" 
                        rows={4}
                        placeholder="Olá! Temos uma oferta especial..."
                        value={formData.mensagem} 
                        onChange={e => setFormData({...formData, mensagem: e.target.value})}
                        style={{width:'100%', background:'#1a1a1a', color:'#fff', padding:'10px', borderRadius:'8px', border:'1px solid #333'}}
                    />
                  </div>

                  <div className="form-group">
                    <label>Mídia (Link da Imagem ou Vídeo) - Opcional</label>
                    <input 
                        className="input-field" 
                        placeholder="https://..."
                        value={formData.media_url} 
                        onChange={e => setFormData({...formData, media_url: e.target.value})}
                        style={{width:'100%', background:'#1a1a1a', color:'#fff', padding:'10px', borderRadius:'8px', border:'1px solid #333'}}
                    />
                  </div>
                  
                  <div style={{margin: '20px 0', padding:'15px', border:'1px solid #333', borderRadius:'8px', background:'#151515'}}>
                    <label style={{display:'flex', alignItems:'center', gap:'10px', cursor:'pointer', fontWeight:'bold'}}>
                      <input 
                        type="checkbox" 
                        checked={formData.incluir_oferta} 
                        onChange={e => setFormData({...formData, incluir_oferta: e.target.checked})} 
                        style={{transform:'scale(1.2)'}}
                      />
                      <Tag size={18} color="#c333ff"/> Incluir Botão de Oferta?
                    </label>

                    {formData.incluir_oferta && (
                        <div style={{marginTop:'15px', paddingLeft:'25px', display:'flex', flexDirection:'column', gap:'10px'}}>
                            <select 
                                className="input-field" 
                                value={formData.plano_oferta_id} 
                                onChange={e => setFormData({...formData, plano_oferta_id: e.target.value})}
                                style={{padding:'10px', background:'#222', color:'#fff', border:'1px solid #444', borderRadius:'6px'}}
                            >
                                <option value="">Selecione o Plano para vender...</option>
                                {plans.map(p => <option key={p.id} value={p.id}>{p.nome_exibicao} - (R$ {p.preco_atual})</option>)}
                            </select>
                            <p style={{fontSize:'0.8rem', color:'#888'}}>Isso criará um botão abaixo da mensagem levando para o checkout.</p>
                        </div>
                    )}
                  </div>

                  <div className="wizard-actions">
                    <button className="btn-back" onClick={handleBack}>Voltar</button>
                    <button className="btn-next" onClick={handleNext}>Revisar</button>
                  </div>
                </div>
              )}

              {/* PASSO 3: REVISÃO */}
              {step === 3 && (
                <div className="fade-in">
                  <div style={{textAlign:'center', marginBottom:'30px'}}>
                      <h3>Tudo pronto?</h3>
                      <p style={{color:'#ccc'}}>Revise os dados antes de disparar.</p>
                  </div>

                  <div style={{background:'#222', padding:'20px', borderRadius:'10px', border:'1px solid #333', marginBottom:'20px'}}>
                    <p><strong>Público Alvo:</strong> {formData.target.toUpperCase()}</p>
                    <p><strong>Tem Oferta?</strong> {formData.incluir_oferta ? <span style={{color:'#10b981'}}>SIM</span> : 'NÃO'}</p>
                    <div style={{marginTop:'10px', padding:'10px', background:'#111', borderRadius:'5px', fontStyle:'italic', color:'#aaa'}}>
                        "{formData.mensagem}"
                    </div>
                  </div>

                  <div className="wizard-actions">
                    <button className="btn-back" onClick={handleBack}>Voltar</button>
                    <button 
                        className="btn-next" 
                        onClick={handleSend} 
                        disabled={loading} 
                        style={{background: loading ? '#555' : '#10b981', minWidth:'150px'}}
                    >
                      {loading ? 'Enviando...' : 'ENVIAR AGORA 🚀'}
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
      </div>
    </div>
  );
}
