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
  
  // Estado do Formulário (Estrutura Antiga)
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

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSend = async () => {
    // Validações básicas
    if (!formData.mensagem) return Swal.fire('Erro', 'Escreva uma mensagem!', 'error');
    if (formData.incluir_oferta && !formData.plano_oferta_id) return Swal.fire('Erro', 'Selecione um plano!', 'error');
    
    setLoading(true);
    try {
      // --- AQUI ESTÁ A CORREÇÃO DO ERRO 422 ---
      // Convertemos strings vazias para 0 ou null antes de enviar
      const payload = {
        bot_id: selectedBot.id,
        tipo_envio: formData.target, // Backend novo espera 'tipo_envio'
        mensagem: formData.mensagem,
        media_url: formData.media_url || null,
        
        incluir_oferta: formData.incluir_oferta,
        plano_oferta_id: formData.plano_oferta_id || null,
        
        // Converte preço e validade para números
        valor_oferta: (formData.price_mode === 'custom' && formData.custom_price) ? parseFloat(formData.custom_price) : 0.0,
        expire_timestamp: 0, // Backend novo usa isso, mas calculamos depois se precisar
        
        // Campos de suporte para o Backend "Permissivo"
        price_mode: formData.price_mode,
        custom_price: parseFloat(formData.custom_price) || 0.0,
        expiration_mode: formData.expiration_mode,
        expiration_value: parseInt(formData.expiration_value) || 0
      };
      
      await remarketingService.send(payload);
      
      Swal.fire({
        title: 'Enviando! 🚀',
        text: 'Campanha iniciada com sucesso.',
        icon: 'success',
        background: '#151515',
        color: '#fff'
      });
      
      // Reset
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

  if (!selectedBot) return <div className="empty-state"><h2>Selecione um bot.</h2></div>;

  return (
    <div className="remarketing-container">
      <div className="wizard-header">
        <h1>Campanha de Remarketing</h1>
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
          
          {/* PASSO 1 */}
          {step === 1 && (
            <div className="step-content fade-in">
              <h3>Quem deve receber?</h3>
              <div className="target-grid">
                {['todos', 'pendentes', 'pagantes', 'expirados'].map(t => (
                    <div key={t} 
                      className={`target-option ${formData.target === t ? 'selected' : ''}`}
                      onClick={() => setFormData({...formData, target: t})}
                    >
                      <span>{t.toUpperCase()}</span>
                    </div>
                ))}
              </div>
              <div className="wizard-actions right">
                <Button onClick={handleNext}>Próximo</Button>
              </div>
            </div>
          )}

          {/* PASSO 2 */}
          {step === 2 && (
            <div className="step-content fade-in">
              <h3>Conteúdo</h3>
              <div className="form-group">
                <label>Mensagem</label>
                <textarea 
                  className="input-field area"
                  value={formData.mensagem}
                  onChange={e => setFormData({...formData, mensagem: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Mídia (URL)</label>
                <input 
                  className="input-field"
                  value={formData.media_url}
                  onChange={e => setFormData({...formData, media_url: e.target.value})}
                />
              </div>
              
              <div className="offer-toggle">
                <label>
                  <input type="checkbox" checked={formData.incluir_oferta} onChange={e => setFormData({...formData, incluir_oferta: e.target.checked})} />
                  Incluir Oferta?
                </label>
              </div>

              {formData.incluir_oferta && (
                  <div className="offer-details">
                      <select className="input-field" value={formData.plano_oferta_id} onChange={e => setFormData({...formData, plano_oferta_id: e.target.value})}>
                          <option value="">Selecione o Plano...</option>
                          {plans.map(p => <option key={p.id} value={p.id}>{p.nome_exibicao}</option>)}
                      </select>
                      {/* Inputs de preço e validade aqui se necessário, mantendo simples por enquanto */}
                  </div>
              )}

              <div className="wizard-actions">
                <Button variant="outline" onClick={handleBack}>Voltar</Button>
                <Button onClick={handleNext}>Revisar</Button>
              </div>
            </div>
          )}

          {/* PASSO 3 */}
          {step === 3 && (
            <div className="step-content review fade-in">
              <h3>Revisão</h3>
              <div className="review-box">
                <p><strong>Alvo:</strong> {formData.target}</p>
                <p><strong>Oferta:</strong> {formData.incluir_oferta ? 'Sim' : 'Não'}</p>
                <div className="msg-preview">{formData.mensagem}</div>
              </div>
              <div className="wizard-actions">
                <Button variant="outline" onClick={handleBack}>Voltar</Button>
                <Button onClick={handleSend} disabled={loading} style={{background: '#10b981'}}>
                  {loading ? 'Enviando...' : 'Enviar Agora 🚀'}
                </Button>
              </div>
            </div>
          )}

        </CardContent>
      </Card>
      
      {/* Histórico Simples */}
      <div className="history-section">
          <h3>Histórico</h3>
          {history.map(h => (
              <div key={h.id} className="history-item">
                  <span>{h.data} - {h.target}</span>
                  <span>✅ {h.sent}</span>
              </div>
          ))}
      </div>
    </div>
  );
}