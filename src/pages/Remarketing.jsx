import React, { useState, useEffect } from 'react';
import { useBot } from '../context/BotContext';
import { remarketingService, planService } from '../services/api';
import { Send, Users, Image, MessageSquare, CheckCircle, AlertTriangle, History, Tag, Clock, RotateCcw, Edit, Play } from 'lucide-react';
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import Swal from 'sweetalert2';
import './Remarketing.css';

export function Remarketing() {
  const { selectedBot } = useBot();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [history, setHistory] = useState([]);
  
  // Estado do Formulário
  const [formData, setFormData] = useState({
    target: 'todos', 
    mensagem: '',
    media_url: '',
    incluir_oferta: false,
    plano_oferta_id: '',
    
    // NOVOS CAMPOS
    price_mode: 'original', // 'original' ou 'custom'
    custom_price: '',
    expiration_mode: 'none', // 'none', 'minutes', 'hours', 'days'
    expiration_value: ''
  });

  useEffect(() => {
    if (selectedBot) {
      planService.listPlans(selectedBot.id).then(setPlans).catch(console.error);
      carregarHistorico();
    }
  }, [selectedBot]);

  const carregarHistorico = () => {
    remarketingService.getHistory(selectedBot.id).then(setHistory).catch(console.error);
  };

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  // --- FUNÇÃO DE ENVIAR (CORRIGIDA PARA A NOVA API) ---
  const handleSend = async (isTest = false) => {
    if (!formData.mensagem) return Swal.fire('Erro', 'Escreva uma mensagem!', 'error');
    
    // Se for teste e não tiver Admin configurado
    let testId = null;
    if (isTest) {
        // Aqui você poderia colocar lógica para pedir um ID específico se quiser
        // Por enquanto enviamos null, e o backend pega o admin principal
    }

    setLoading(true);
    try {
      // 🚨 AQUI ESTÁ A MUDANÇA PRINCIPAL:
      // Passamos os parâmetros na ordem que o api.js espera:
      // 1. ID do Bot
      // 2. Os dados do formulário (formData direto)
      // 3. Flag de teste
      // 4. ID específico (se houver)
      await remarketingService.send(selectedBot.id, formData, isTest, testId);
      
      if (isTest) {
          Swal.fire({ title: 'Teste Enviado!', text: 'Verifique no seu Telegram.', icon: 'info', background: '#151515', color: '#fff' });
      } else {
          Swal.fire({ title: 'Sucesso!', text: 'Campanha iniciada.', icon: 'success', background: '#151515', color: '#fff' });
          setStep(1); // Volta para o passo 1
          setTimeout(carregarHistorico, 2000); // Atualiza histórico
      }
      
    } catch (error) {
      console.error(error);
      Swal.fire('Erro', 'Falha ao enviar. Verifique o console.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- FUNÇÃO DE REUTILIZAR (HISTÓRICO) ---
  const handleReuse = (item, mode) => {
      // Reconstrói o estado com base no histórico salvo (JSON)
      try {
          const config = JSON.parse(item.config?.content_data || item.config);
          
          setFormData({
              target: item.target || 'todos',
              mensagem: config.msg || '',
              media_url: config.media || '',
              incluir_oferta: config.offer || false,
              // Tenta recuperar outros dados se salvou no JSON, senão reseta
              plano_oferta_id: '', 
              price_mode: 'original',
              custom_price: '',
              expiration_mode: 'none',
              expiration_value: ''
          });

          if (mode === 'edit') {
              setStep(2); // Vai para edição
          } else {
              setStep(3); // Vai para revisão direto
          }
          
          // Rola para o topo
          window.scrollTo(0,0);
          
      } catch (e) {
          console.error("Erro ao carregar histórico", e);
      }
  };

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
          
          <div className="wizard-step-indicator">
             {step === 1 && "1. Público"} 
             {step === 2 && "2. Conteúdo e Oferta"} 
             {step === 3 && "3. Revisão e Teste"}
          </div>

          <Card style={{border: '1px solid #333', background: '#0f0f0f'}}>
            <CardContent>
              {/* PASSO 1: PÚBLICO */}
              {step === 1 && (
                <div className="fade-in">
                  <h3 style={{marginBottom:'20px', color:'#fff'}}>Quem deve receber?</h3>
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

              {/* PASSO 2: CONTEÚDO AVANÇADO */}
              {step === 2 && (
                <div className="fade-in">
                  <h3>Conteúdo da Mensagem</h3>
                  
                  <div className="form-group">
                    <label>Mensagem</label>
                    <textarea 
                        className="input-field" rows={4}
                        placeholder="Olá! Temos uma oferta especial..."
                        value={formData.mensagem} 
                        onChange={e => setFormData({...formData, mensagem: e.target.value})}
                    />
                  </div>

                  <div className="form-group">
                    <label>Mídia (URL Opcional)</label>
                    <input className="input-field" placeholder="https://..." value={formData.media_url} onChange={e => setFormData({...formData, media_url: e.target.value})} />
                  </div>
                  
                  {/* --- SESSÃO DE OFERTA AVANÇADA --- */}
                  <div className="offer-section">
                    <label className="checkbox-label">
                      <input type="checkbox" checked={formData.incluir_oferta} onChange={e => setFormData({...formData, incluir_oferta: e.target.checked})} />
                      <Tag size={18} color="#c333ff"/> Incluir Botão de Oferta?
                    </label>

                    {formData.incluir_oferta && (
                        <div className="offer-details-box">
                            {/* Seleção do Plano */}
                            <div className="form-group">
                                <label>Qual plano ofertar?</label>
                                <select className="input-field" value={formData.plano_oferta_id} onChange={e => setFormData({...formData, plano_oferta_id: e.target.value})}>
                                    <option value="">Selecione...</option>
                                    {plans.map(p => <option key={p.id} value={p.id}>{p.nome_exibicao} (R$ {p.preco_atual})</option>)}
                                </select>
                            </div>

                            {/* Preço Personalizado */}
                            <div className="form-row">
                                <div className="form-group half">
                                    <label>Tipo de Preço</label>
                                    <div className="toggle-buttons">
                                        <button className={formData.price_mode === 'original' ? 'active' : ''} onClick={() => setFormData({...formData, price_mode: 'original'})}>Original</button>
                                        <button className={formData.price_mode === 'custom' ? 'active' : ''} onClick={() => setFormData({...formData, price_mode: 'custom'})}>Com Desconto</button>
                                    </div>
                                </div>
                                {formData.price_mode === 'custom' && (
                                    <div className="form-group half">
                                        <label>Valor da Oferta (R$)</label>
                                        <input type="number" className="input-field" placeholder="Ex: 9.90" value={formData.custom_price} onChange={e => setFormData({...formData, custom_price: e.target.value})} />
                                    </div>
                                )}
                            </div>

                            {/* Expiração / Escassez */}
                            <div className="form-row">
                                <div className="form-group half">
                                    <label><Clock size={14}/> Validade da Oferta</label>
                                    <select className="input-field" value={formData.expiration_mode} onChange={e => setFormData({...formData, expiration_mode: e.target.value})}>
                                        <option value="none">Sem validade (Sempre ativo)</option>
                                        <option value="minutes">Minutos</option>
                                        <option value="hours">Horas</option>
                                        <option value="days">Dias</option>
                                    </select>
                                </div>
                                {formData.expiration_mode !== 'none' && (
                                    <div className="form-group half">
                                        <label>Duração ({formData.expiration_mode})</label>
                                        <input type="number" className="input-field" placeholder="Ex: 3" value={formData.expiration_value} onChange={e => setFormData({...formData, expiration_value: e.target.value})} />
                                    </div>
                                )}
                            </div>
                            <small style={{color:'#666', display:'block', marginTop:'5px'}}>* Se o usuário clicar após o tempo, receberá aviso de "Esgotado".</small>
                        </div>
                    )}
                  </div>

                  <div className="wizard-actions">
                    <button className="btn-back" onClick={handleBack}>Voltar</button>
                    <button className="btn-next" onClick={handleNext}>Revisar</button>
                  </div>
                </div>
              )}

              {/* PASSO 3: REVISÃO E TESTE */}
              {step === 3 && (
                <div className="fade-in">
                  <h3>Tudo pronto?</h3>
                  <div className="review-box">
                    <p><strong>Público:</strong> {formData.target.toUpperCase()}</p>
                    <p><strong>Oferta:</strong> {formData.incluir_oferta ? (formData.price_mode === 'custom' ? `R$ ${formData.custom_price}` : 'Preço Original') : 'Não'}</p>
                    <p><strong>Validade:</strong> {formData.expiration_mode === 'none' ? 'Infinita' : `${formData.expiration_value} ${formData.expiration_mode}`}</p>
                    <div className="msg-quote">"{formData.mensagem}"</div>
                  </div>

                  <div className="wizard-actions">
                    <button className="btn-back" onClick={handleBack}>Voltar</button>
                    
                    <div style={{display:'flex', gap:'10px'}}>
                        {/* BOTÃO DE TESTE */}
                        <button className="btn-reuse" onClick={() => handleSend(true)} disabled={loading}>
                            <Play size={16}/> Enviar Teste (Admin)
                        </button>

                        {/* BOTÃO DE ENVIO REAL */}
                        <button className="btn-next" onClick={() => handleSend(false)} disabled={loading} style={{background: loading ? '#555' : '#10b981'}}>
                            {loading ? 'Enviando...' : 'ENVIAR PARA TODOS 🚀'}
                        </button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* --- HISTÓRICO DE DISPAROS --- */}
          <div style={{marginTop:'40px'}}>
              <h3 style={{color:'#fff', marginBottom:'15px', display:'flex', alignItems:'center', gap:'10px'}}><History /> Histórico de Campanhas</h3>
              {history.length === 0 ? <p style={{color:'#666'}}>Nenhum disparo recente.</p> : (
                  <div className="history-list">
                      {history.map(h => (
                          <div key={h.id} className="history-item">
                              <div>
                                  <div style={{fontWeight:'bold', color:'#fff'}}>{h.data}</div>
                                  <div style={{fontSize:'0.85rem', color:'#888'}}>
                                      Enviado para: {h.total} leads • Bloqueados: {h.blocked}
                                  </div>
                              </div>
                              <div className="history-actions">
                                  <button className="btn-small" onClick={() => handleReuse(h, 'edit')}><Edit size={14}/> Editar</button>
                                  <button className="btn-small primary" onClick={() => handleReuse(h, 'direct')}><RotateCcw size={14}/> Reutilizar</button>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      </div>
    </div>
  );
}
