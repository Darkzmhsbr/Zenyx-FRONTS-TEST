import React, { useState, useEffect } from 'react';
import { useBot } from '../context/BotContext';
import { remarketingService, planService } from '../services/api';
import { Send, Users, Image, MessageSquare, CheckCircle, AlertTriangle, History } from 'lucide-react';
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
    incluir_oferta: false,
    plano_oferta_id: ''
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
    if (!formData.mensagem) return Swal.fire('Erro', 'Escreva uma mensagem!', 'error');
    if (formData.incluir_oferta && !formData.plano_oferta_id) return Swal.fire('Erro', 'Selecione um plano para a oferta!', 'error');
    
    setLoading(true);
    try {
      await remarketingService.send({
        bot_id: selectedBot.id,
        ...formData
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
      setFormData({ ...formData, mensagem: '', media_url: '' });
      // Atualiza histórico
      setTimeout(() => {
        remarketingService.getHistory(selectedBot.id).then(setHistory).catch(console.error);
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

              {formData.incluir_oferta && (
                <div className="form-group fade-in">
                  <label>Qual plano ofertar no botão?</label>
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
                <p><strong>Oferta:</strong> {formData.incluir_oferta ? 'Sim (Botão incluído)' : 'Não'}</p>
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
                            <span>Alvo: {h.config ? JSON.parse(h.config).target : 'Desconhecido'}</span>
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