import React, { useState, useEffect } from 'react';
import { useBot } from '../context/BotContext';
import { remarketingService, planService } from '../services/api';
import { Send, Users, Image, MessageSquare, CheckCircle, AlertTriangle, History, Tag, Clock, Repeat } from 'lucide-react';
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
  
  // Estado do Formulário (Estrutura Antiga Completa)
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
      carregarHistorico();
    }
  }, [selectedBot]);

  const carregarHistorico = () => {
    remarketingService.getHistory(selectedBot.id).then(setHistory).catch(console.error);
  };

  // --- NOVA FUNÇÃO: REUTILIZAR CAMPANHA (Do pedido anterior) ---
  const handleReuse = (campaign) => {
    try {
        // Blinda o parse: se já for objeto, usa direto; se for string, parseia
        let config = {};
        if (typeof campaign.config === 'object') {
            config = campaign.config;
        } else {
            try { config = JSON.parse(campaign.config); } catch (e) { config = {}; }
        }

        setFormData({
            target: campaign.target || 'todos',
            mensagem: config.msg || '',
            media_url: config.media || '',
            incluir_oferta: config.offer || false,
            plano_oferta_id: campaign.plano_id || '',
            price_mode: 'custom', // Ao reutilizar, forçamos custom para manter o preço histórico
            custom_price: campaign.promo_price || '',
            expiration_mode: 'none', // Resetamos validade por segurança
            expiration_value: ''
        });

        setStep(1); // Volta para o inicio
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        Swal.fire({
            title: 'Dados Carregados!',
            text: 'Configure a validade novamente se necessário.',
            icon: 'info',
            timer: 2000,
            showConfirmButton: false,
            background: '#151515', color: '#fff'
        });

    } catch (e) {
        console.error(e);
        Swal.fire('Erro', 'Não foi possível reutilizar esta campanha.', 'error');
    }
  };

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSend = async () => {
    // Validações
    if (!formData.mensagem) return Swal.fire('Erro', 'Escreva uma mensagem!', 'error');
    
    if (formData.incluir_oferta) {
        if (!formData.plano_oferta_id) return Swal.fire('Erro', 'Selecione um plano para a oferta!', 'error');
        if (formData.price_mode === 'custom' && !formData.custom_price) return Swal.fire('Erro', 'Defina o valor promocional!', 'error');
        if (formData.expiration_mode !== 'none' && !formData.expiration_value) return Swal.fire('Erro', 'Defina o tempo de duração!', 'error');
    }
    
    setLoading(true);
    try {
      await remarketingService.send({
        bot_id: selectedBot.id,
        ...formData,
        custom_price: formData.price_mode === 'custom' ? parseFloat(formData.custom_price) : 0,
        expiration_value: formData.expiration_mode !== 'none' ? parseInt(formData.expiration_value) : 0
      });
      
      Swal.fire({
        title: 'Enviando! 🚀',
        text: 'A campanha começou a ser enviada em segundo plano.',
        icon: 'success',
        background: '#151515', color: '#fff'
      });
      
      setStep(1);
      setFormData({ 
        ...formData, mensagem: '', media_url: '', incluir_oferta: false, custom_price: '', expiration_value: ''
      });
      
      setTimeout(carregarHistorico, 2000);
      
    } catch (error) {
      Swal.fire('Erro', 'Falha ao iniciar campanha.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedBot) return <div className="remarketing-container empty-state"><h2>Selecione um bot.</h2></div>;

  return (
    <div className="remarketing-container">
      <div className="wizard-header">
        <h1>Campanha de Remarketing</h1>
        <p>Envie mensagens em massa para recuperar vendas ou avisar clientes.</p>
        
        <div className="steps-indicator">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>1. Público</div>
          <div className="line"></div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>2. Conteúdo</div>
          <div className="line"></div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>3. Enviar</div>
        </div>
      </div>

      <Card className="wizard-card">
        <CardContent>
          {/* PASSO 1: PÚBLICO */}
          {step === 1 && (
            <div className="step-content fade-in">
              <h3>Quem deve receber?</h3>
              <div className="target-grid">
                {['todos', 'pendentes', 'pagantes', 'expirados'].map(type => (
                    <div 
                        key={type}
                        className={`target-option ${formData.target === type ? 'selected' : ''}`}
                        onClick={() => setFormData({...formData, target: type})}
                    >
                        {type === 'todos' && <Users size={24} />}
                        {type === 'pendentes' && <AlertTriangle size={24} color="#f59e0b" />}
                        {type === 'pagantes' && <CheckCircle size={24} color="#10b981" />}
                        {type === 'expirados' && <History size={24} color="#ef4444" />}
                        <span style={{textTransform: 'capitalize'}}>{type}</span>
                    </div>
                ))}
              </div>
              <div className="wizard-actions right"><Button onClick={handleNext}>Próximo</Button></div>
            </div>
          )}

          {/* PASSO 2: CONTEÚDO */}
          {step === 2 && (
            <div className="step-content fade-in">
              <h3>Configure a Mensagem</h3>
              <div className="form-group">
                <label><MessageSquare size={16}/> Mensagem de Texto</label>
                <textarea 
                  className="input-field area" placeholder="Digite sua mensagem..."
                  value={formData.mensagem} onChange={e => setFormData({...formData, mensagem: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label><Image size={16}/> URL da Mídia (Opcional)</label>
                <input 
                  type="text" className="input-field" placeholder="https://..."
                  value={formData.media_url} onChange={e => setFormData({...formData, media_url: e.target.value})}
                />
              </div>

              <div className="offer-toggle">
                <label>
                  <input type="checkbox" checked={formData.incluir_oferta} onChange={e => setFormData({...formData, incluir_oferta: e.target.checked})} />
                  Incluir Botão de Compra?
                </label>
              </div>

              {formData.incluir_oferta && (
                <div className="offer-details fade-in" style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginTop: '10px' }}>
                  <div className="form-group">
                    <label>Qual plano ofertar?</label>
                    <select className="input-field" value={formData.plano_oferta_id} onChange={e => setFormData({...formData, plano_oferta_id: e.target.value})}>
                      <option value="">Selecione um plano...</option>
                      {plans.map(p => <option key={p.id} value={p.id}>{p.nome_exibicao} - R$ {p.preco_atual}</option>)}
                    </select>
                  </div>
                  <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <div className="form-group">
                          <label><Tag size={14}/> Preço</label>
                          <select className="input-field" value={formData.price_mode} onChange={e => setFormData({...formData, price_mode: e.target.value})}>
                              <option value="original">Original</option>
                              <option value="custom">Promocional</option>
                          </select>
                      </div>
                      {formData.price_mode === 'custom' && (
                          <div className="form-group">
                              <label>Valor (R$)</label>
                              <input type="number" className="input-field" value={formData.custom_price} onChange={e => setFormData({...formData, custom_price: e.target.value})} />
                          </div>
                      )}
                  </div>
                  <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '10px' }}>
                      <div className="form-group">
                          <label><Clock size={14}/> Validade</label>
                          <select className="input-field" value={formData.expiration_mode} onChange={e => setFormData({...formData, expiration_mode: e.target.value})}>
                              <option value="none">Sem Validade</option>
                              <option value="minutes">Minutos</option>
                              <option value="hours">Horas</option>
                              <option value="days">Dias</option>
                          </select>
                      </div>
                      {formData.expiration_mode !== 'none' && (
                          <div className="form-group">
                              <label>Tempo</label>
                              <input type="number" className="input-field" value={formData.expiration_value} onChange={e => setFormData({...formData, expiration_value: e.target.value})} />
                          </div>
                      )}
                  </div>
                </div>
              )}
              <div className="wizard-actions">
                <Button variant="outline" onClick={handleBack}>Voltar</Button>
                <Button onClick={handleNext}>Revisar</Button>
              </div>
            </div>
          )}

          {/* PASSO 3: REVISÃO */}
          {step === 3 && (
            <div className="step-content review fade-in">
              <h3>Resumo</h3>
              <div className="review-box">
                <p><strong>Bot:</strong> {selectedBot.nome}</p>
                <p><strong>Público:</strong> <span className="highlight">{formData.target.toUpperCase()}</span></p>
                <p><strong>Oferta:</strong> {formData.incluir_oferta ? 'Sim' : 'Não'}</p>
                <div className="msg-preview"><strong>Msg:</strong><br/>{formData.mensagem}</div>
              </div>
              <div className="wizard-actions">
                <Button variant="outline" onClick={handleBack}>Voltar</Button>
                <Button onClick={handleSend} disabled={loading} style={{background: '#10b981', color: '#fff'}}>
                  <Send size={18} /> {loading ? 'Enviando...' : 'Enviar Agora'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Histórico CORRIGIDO (Proteção JSON) */}
      <div className="history-section">
        <h3>Histórico Recente</h3>
        <div className="history-list">
            {history.length === 0 ? <p style={{color:'#666'}}>Nenhuma campanha recente.</p> : (
                history.map(h => {
                    // Lógica de Parse Segura para evitar o erro [object Object]
                    let parsedConfig = {};
                    try {
                        if (typeof h.config === 'object') {
                            parsedConfig = h.config;
                        } else {
                            parsedConfig = JSON.parse(h.config || '{}');
                        }
                    } catch (e) {
                        parsedConfig = { msg: 'Erro ao ler config' };
                    }

                    return (
                        <div key={h.id} className="history-item">
                            <div className="h-info">
                                <strong>{h.data}</strong>
                                <span>Alvo: {h.target || parsedConfig.target || 'Desconhecido'}</span>
                                <small style={{display:'block', color:'#666', marginTop:'2px'}}>
                                    {parsedConfig.msg ? parsedConfig.msg.substring(0, 30) + '...' : ''}
                                </small>
                            </div>
                            <div className="h-actions" style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                <div className="h-stats">
                                    <span className="sent">✅ {h.sent}</span>
                                    <span className="blocked">🚫 {h.blocked}</span>
                                </div>
                                {/* BOTÃO REUTILIZAR NOVO */}
                                <Button 
                                    onClick={() => handleReuse(h)} 
                                    style={{padding:'5px 10px', fontSize:'0.8rem', height:'auto', background:'#333', border:'1px solid #555'}}
                                >
                                    <Repeat size={14} />
                                </Button>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
      </div>
    </div>
  );
}