import React, { useState, useEffect } from 'react';
import { useBot } from '../context/BotContext';
import { remarketingService, planService } from '../services/api';
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
  const [history, setHistory] = useState([]);
  
  // Estado do Formulário
  const [formData, setFormData] = useState({
    target: 'todos', // 'todos', 'pendentes', 'pagantes', 'expirados'
    mensagem: '',
    media_url: '',
    
    // Oferta
    incluir_oferta: false,
    plano_oferta_id: '',
    
    // Preço e Validade (Novos Campos)
    price_mode: 'original', // 'original' ou 'custom'
    custom_price: '',
    expiration_mode: 'none', // 'none', 'minutes', 'hours', 'days'
    expiration_value: ''
  });

  useEffect(() => {
    if (selectedBot) {
      // Carregar planos para o dropdown
      planService.listPlans(selectedBot.id).then(setPlans).catch(console.error);
      // Carregar histórico
      remarketingService.getHistory(selectedBot.id).then(setHistory).catch(console.error);
    }
  }, [selectedBot]);

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
        // Converte strings para números
        custom_price: formData.price_mode === 'custom' ? parseFloat(formData.custom_price) : 0,
        expiration_value: formData.expiration_mode !== 'none' ? parseInt(formData.expiration_value) : 0
      });
      
      Swal.fire({
        title: 'Enviando! 🚀',
        text: 'A campanha começou a ser enviada em segundo plano.',
        icon: 'success',
        background: '#151515',
        color: '#fff'
      });
      
      // Reset para passo 1
      setStep(1);
      setFormData({ 
        ...formData, 
        mensagem: '', 
        media_url: '', 
        incluir_oferta: false,
        custom_price: '',
        expiration_value: ''
      });
      
      // Atualiza histórico após um tempo
      setTimeout(() => {
        if (selectedBot) {
            remarketingService.getHistory(selectedBot.id).then(setHistory).catch(console.error);
        }
      }, 2000);
      
    } catch (error) {
      Swal.fire('Erro', 'Falha ao iniciar campanha.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedBot) return (
    <div className="remarketing-container empty-state">
        <h2>Selecione um bot no topo da tela para acessar o Remarketing.</h2>
    </div>
  );

  return (
    <div className="remarketing-container">
      <div className="wizard-header">
        <h1>Campanha de Remarketing</h1>
        <p>Envie mensagens em massa para recuperar vendas ou avisar clientes.</p>
        
        {/* Barra de Progresso */}
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
          
          {/* PASSO 1: PÚBLICO ALVO */}
          {step === 1 && (
            <div className="step-content fade-in">
              <h3>Quem deve receber?</h3>
              <div className="target-grid">
                <div 
                  className={`target-option ${formData.target === 'todos' ? 'selected' : ''}`}
                  onClick={() => setFormData({...formData, target: 'todos'})}
                >
                  <Users size={24} />
                  <span>Todos os Leads</span>
                  <small>Pagantes, Pendentes e Expirados</small>
                </div>

                <div 
                  className={`target-option ${formData.target === 'pendentes' ? 'selected' : ''}`}
                  onClick={() => setFormData({...formData, target: 'pendentes'})}
                >
                  <AlertTriangle size={24} color="#f59e0b" />
                  <span>Pendentes</span>
                  <small>Geraram PIX mas não pagaram</small>
                </div>

                <div 
                  className={`target-option ${formData.target === 'pagantes' ? 'selected' : ''}`}
                  onClick={() => setFormData({...formData, target: 'pagantes'})}
                >
                  <CheckCircle size={24} color="#10b981" />
                  <span>Clientes Ativos</span>
                  <small>Já compraram acesso</small>
                </div>

                <div 
                  className={`target-option ${formData.target === 'expirados' ? 'selected' : ''}`}
                  onClick={() => setFormData({...formData, target: 'expirados'})}
                >
                  <History size={24} color="#ef4444" />
                  <span>Expirados</span>
                  <small>Acesso vencido (Win-back)</small>
                </div>
              </div>
              <div className="wizard-actions right">
                <Button onClick={handleNext}>Próximo</Button>
              </div>
            </div>
          )}

          {/* PASSO 2: CONTEÚDO */}
          {step === 2 && (
            <div className="step-content fade-in">
              <h3>Configure a Mensagem</h3>
              
              <div className="form-group">
                <label><MessageSquare size={16}/> Mensagem de Texto</label>
                <textarea 
                  className="input-field area"
                  placeholder="Ex: Olá! Vi que você não finalizou sua compra. Aproveite o desconto hoje!"
                  value={formData.mensagem}
                  onChange={e => setFormData({...formData, mensagem: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label><Image size={16}/> URL da Mídia (Opcional - Foto/Vídeo)</label>
                <input 
                  type="text" 
                  className="input-field"
                  placeholder="https://imgur.com/exemplo.jpg"
                  value={formData.media_url}
                  onChange={e => setFormData({...formData, media_url: e.target.value})}
                />
              </div>

              <div className="offer-toggle">
                <label>
                  <input 
                    type="checkbox" 
                    checked={formData.incluir_oferta}
                    onChange={e => setFormData({...formData, incluir_oferta: e.target.checked})}
                  />
                  Incluir Botão de Compra?
                </label>
              </div>

              {/* ÁREA DE OFERTA (Expandida) */}
              {formData.incluir_oferta && (
                <div className="offer-details fade-in" style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginTop: '10px' }}>
                  
                  <div className="form-group">
                    <label>Qual plano ofertar?</label>
                    <select 
                      className="input-field"
                      value={formData.plano_oferta_id}
                      onChange={e => setFormData({...formData, plano_oferta_id: e.target.value})}
                    >
                      <option value="">Selecione um plano...</option>
                      {plans.map(p => (
                        <option key={p.id} value={p.id}>{p.nome_exibicao} - R$ {p.preco_atual}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <div className="form-group">
                          <label><Tag size={14}/> Preço</label>
                          <select 
                              className="input-field" 
                              value={formData.price_mode} 
                              onChange={e => setFormData({...formData, price_mode: e.target.value})}
                          >
                              <option value="original">Original do Plano</option>
                              <option value="custom">Promocional (Custom)</option>
                          </select>
                      </div>
                      
                      {formData.price_mode === 'custom' && (
                          <div className="form-group">
                              <label>Valor (R$)</label>
                              <input 
                                  type="number" 
                                  className="input-field" 
                                  placeholder="Ex: 9.90"
                                  value={formData.custom_price}
                                  onChange={e => setFormData({...formData, custom_price: e.target.value})}
                              />
                          </div>
                      )}
                  </div>

                  <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '10px' }}>
                      <div className="form-group">
                          <label><Clock size={14}/> Validade (Escassez)</label>
                          <select 
                              className="input-field" 
                              value={formData.expiration_mode} 
                              onChange={e => setFormData({...formData, expiration_mode: e.target.value})}
                          >
                              <option value="none">Sem Validade (Eterno)</option>
                              <option value="minutes">Minutos</option>
                              <option value="hours">Horas</option>
                              <option value="days">Dias</option>
                          </select>
                      </div>
                      
                      {formData.expiration_mode !== 'none' && (
                          <div className="form-group">
                              <label>Tempo ({formData.expiration_mode})</label>
                              <input 
                                  type="number" 
                                  className="input-field" 
                                  placeholder="Ex: 30"
                                  value={formData.expiration_value}
                                  onChange={e => setFormData({...formData, expiration_value: e.target.value})}
                              />
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
              <h3>Resumo da Campanha</h3>
              
              <div className="review-box">
                <p><strong>Bot:</strong> {selectedBot.nome}</p>
                <p><strong>Público Alvo:</strong> <span className="highlight">{formData.target.toUpperCase()}</span></p>
                
                {formData.incluir_oferta ? (
                    <>
                        <p><strong>Oferta:</strong> Sim (Botão incluído)</p>
                        <p><strong>Preço:</strong> {formData.price_mode === 'original' ? 'Original do Plano' : `R$ ${formData.custom_price}`}</p>
                        <p><strong>Validade:</strong> {formData.expiration_mode === 'none' ? 'Sem limite' : `${formData.expiration_value} ${formData.expiration_mode}`}</p>
                    </>
                ) : (
                    <p><strong>Oferta:</strong> Não</p>
                )}

                <div className="msg-preview">
                  <strong>Mensagem:</strong><br/>
                  {formData.mensagem}
                </div>
                {formData.media_url && <div className="media-preview">📷 Mídia incluída</div>}
              </div>

              <div className="wizard-actions">
                <Button variant="outline" onClick={handleBack}>Voltar</Button>
                <Button 
                  onClick={handleSend} 
                  disabled={loading}
                  style={{background: '#10b981', color: '#fff'}}
                >
                  <Send size={18} /> {loading ? 'Enviando...' : 'Enviar Campanha Agora'}
                </Button>
              </div>
            </div>
          )}

        </CardContent>
      </Card>

      {/* Histórico */}
      <div className="history-section">
        <h3>Histórico Recente</h3>
        <div className="history-list">
            {history.length === 0 ? <p style={{color:'#666'}}>Nenhuma campanha recente.</p> : (
                history.map(h => (
                    <div key={h.id} className="history-item">
                        <div className="h-info">
                            <strong>{h.data}</strong>
                            {/* Tenta fazer parse do config JSON para mostrar detalhes, com fallback */}
                            <span>
                                {(() => {
                                    try {
                                        const cfg = JSON.parse(h.config);
                                        return `Alvo: ${h.target || cfg.target || '?'}`;
                                    } catch {
                                        return 'Config antiga';
                                    }
                                })()}
                            </span>
                        </div>
                        <div className="h-stats">
                            <span className="sent">✅ {h.sent}</span>
                            <span className="blocked">🚫 {h.blocked}</span>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
}