import React, { useState, useEffect } from 'react';
import { useBot } from '../../context/BotContext';
import { remarketingService, planService } from '../../services/api';
import { Send, Users, Image, MessageSquare, CheckCircle, AlertTriangle, History, Tag, Clock, RotateCcw, Edit, Play, Trash2, ChevronLeft, ChevronRight, Zap, Loader2 } from 'lucide-react';
import { Button } from '../../components/Button';
import { Card, CardContent } from '../../components/Card';
import { RichInput } from '../../components/RichInput';
import Swal from 'sweetalert2';
import './Remarketing.css';

export function Remarketing() {
  const { selectedBot } = useBot();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [history, setHistory] = useState([]);
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [perPage] = useState(10);
  
  // Formulário
  const [formData, setFormData] = useState({
    target: 'todos', 
    mensagem: '',
    media_url: '',
    incluir_oferta: false,
    plano_oferta_id: '',
    price_mode: 'original',
    custom_price: '',
    expiration_mode: 'none',
    expiration_value: '',
    agendar: false,
    data_agendamento: '',
    tipo_envio: 'massivo'
  });

  const targetOptions = [
    { id: 'todos', title: 'Todos os Contatos', desc: 'Envia para toda a base (Leads + Clientes).', icon: <Users size={20} color="#3b82f6"/> },
    { id: 'pendentes', title: 'Leads Pendentes', desc: 'Apenas quem iniciou mas NÃO comprou.', icon: <Clock size={20} color="#f59e0b"/> },
    { id: 'ativos', title: 'Assinantes Ativos', desc: 'Clientes com plano em dia (Upsell).', icon: <CheckCircle size={20} color="#10b981"/> },
    { id: 'expirados', title: 'Ex-Assinantes', desc: 'Clientes que não renovaram (Winback).', icon: <RotateCcw size={20} color="#ef4444"/> }
  ];

  useEffect(() => {
    if (selectedBot?.id) {
      loadPlans();
      carregarHistorico();
    }
  }, [selectedBot, currentPage]);

  const loadPlans = async () => {
    try {
      const data = await planService.listPlans(selectedBot.id);
      setPlans(data);
    } catch (e) { console.error(e); }
  };

  const carregarHistorico = async () => {
      if (!selectedBot?.id) return;
      try {
          const data = await remarketingService.getHistory(selectedBot.id, currentPage, perPage);
          setHistory(data.data || []);
          setTotalCount(data.total || 0);
          setTotalPages(data.total_pages || 1); // Correção: total_pages
      } catch (e) { console.error(e); setHistory([]); }
  };

  const handleDeleteHistory = async (id) => {
      const result = await Swal.fire({
          title: 'Excluir registro?',
          text: "Isso removerá apenas do histórico.",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          confirmButtonText: 'Sim, excluir',
          background: '#151515', color: '#fff'
      });

      if (result.isConfirmed) {
          try {
              await remarketingService.deleteHistory(selectedBot.id, id);
              carregarHistorico();
              Swal.fire({title:'Excluído!', icon:'success', timer:1500, showConfirmButton:false, background:'#151515', color:'#fff'});
          } catch (e) { Swal.fire('Erro', 'Falha ao excluir', 'error'); }
      }
  };

  // 🔥 [CORREÇÃO CRÍTICA] REUTILIZAR DADOS
  const handleReusar = (item) => {
    try {
      // 1. Garante que config é objeto
      const config = typeof item.config === 'string' ? JSON.parse(item.config) : item.config;
      
      // 2. Mapeamento Inteligente (Backend vs Frontend)
      // O backend salva como 'msg', 'media', 'offer'. O form usa 'mensagem', 'media_url'.
      const msg = config.msg || config.mensagem || '';
      const media = config.media || config.media_url || '';
      const offer = config.offer !== undefined ? config.offer : (config.incluir_oferta || false);
      const pid = config.plano_id || config.plano_oferta_id || '';
      const customPrice = config.custom_price || '';

      setFormData({
        target: item.target || 'todos',
        mensagem: msg,
        media_url: media,
        incluir_oferta: offer,
        plano_oferta_id: pid,
        price_mode: customPrice ? 'custom' : 'original',
        custom_price: customPrice,
        expiration_mode: config.expiration_mode || 'none',
        expiration_value: config.expiration_value || '',
        tipo_envio: 'massivo',
        agendar: false
      });

      setStep(1); // Vai para o passo 1
      window.scrollTo(0, 0); // Sobe a tela
      
      // Feedback visual rápido
      const Toast = Swal.mixin({toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true});
      Toast.fire({icon: 'success', title: 'Dados carregados do histórico!'});

    } catch (error) {
      console.error("Erro ao reusar:", error);
      Swal.fire('Erro', 'Dados da campanha corrompidos.', 'error');
    }
  };

  const handleResendIndividual = async (campaignId) => {
      const { value: userId } = await Swal.fire({
          title: 'Teste Rápido',
          input: 'text',
          inputLabel: 'Digite o ID do Telegram (User ID)',
          inputPlaceholder: '123456789',
          showCancelButton: true,
          background: '#151515', color: '#fff'
      });

      if (userId) {
          try {
              setLoading(true);
              await remarketingService.sendIndividual({
                  bot_id: selectedBot.id,
                  user_telegram_id: userId,
                  campaign_history_id: campaignId
              });
              Swal.fire({title:'Sucesso', text:'Teste enviado!', icon:'success', timer:2000, background:'#151515', color:'#fff'});
          } catch (e) {
              Swal.fire('Erro', 'Falha ao reenviar', 'error');
          } finally {
              setLoading(false);
          }
      }
  };

  const handleEnviar = async () => {
    if (!selectedBot?.id) return;
    if (!formData.mensagem) return Swal.fire('Atenção', 'Escreva uma mensagem.', 'warning');
    if (formData.incluir_oferta && !formData.plano_oferta_id) return Swal.fire('Atenção', 'Selecione um plano.', 'warning');

    setLoading(true);
    
    try {
      const result = await remarketingService.send(selectedBot.id, formData);
      
      Swal.fire({
        title: 'Enviado com Sucesso!',
        html: `
          <div style="text-align:left; color:#ccc;">
            <p>✅ Enviados: <b>${result.sent_success || 0}</b></p>
            <p>🚫 Bloqueados: <b>${result.blocked_count || 0}</b></p>
            <p>📊 Total Processado: <b>${result.total_leads || 0}</b></p>
          </div>
        `,
        icon: 'success',
        background: '#151515', color: '#fff'
      });

      setStep(4);
      carregarHistorico();
    } catch (error) {
      console.error(error);
      Swal.fire('Erro', 'Falha ao enviar campanha', 'error');
    } finally {
      setLoading(false);
    }
  };

  const nextPage = () => currentPage < totalPages && setCurrentPage(p => p + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(p => p - 1);

  return (
    <div className="remarketing-container">
      
      <div className="tabs-header">
          <button className={`tab-btn ${step < 4 ? 'active' : ''}`} onClick={() => setStep(1)}>
              <Send size={18}/> Nova Campanha
          </button>
          <button className={`tab-btn ${step === 4 ? 'active' : ''}`} onClick={() => setStep(4)}>
              <History size={18}/> Histórico
          </button>
      </div>

      {step === 4 ? (
          <div className="history-section">
              <div className="history-list">
                  {history.map(h => {
                      let cfg = {};
                      try { cfg = typeof h.config === 'string' ? JSON.parse(h.config) : h.config; } catch (e) {}
                      
                      // Fallback para exibir mensagem mesmo se chaves mudarem
                      const displayMsg = cfg.msg || cfg.mensagem || "Sem texto";
                      const targetName = targetOptions.find(t => t.id === h.target)?.title || h.target;

                      return (
                        <div key={h.id} className="history-card">
                            <div className="h-header">
                                <span className="h-date">{h.data}</span>
                                <span className={`h-badge ${h.target}`}>{targetName}</span>
                            </div>
                            <div className="h-body">
                                <div className="h-msg" dangerouslySetInnerHTML={{__html: displayMsg.substring(0, 100) + '...'}} />
                                <div className="h-stats">
                                    <span>✅ {h.sent_success || 0} Enviados</span>
                                    <span>🚫 {h.blocked_count || 0} Bloqueados</span>
                                </div>
                            </div>
                            <div className="h-actions">
                                <button onClick={() => handleReusar(h)} className="btn-icon" title="Reutilizar">
                                    <Edit size={16}/>
                                </button>
                                <button onClick={() => handleResendIndividual(h.id)} className="btn-icon" title="Testar Envio">
                                    <Play size={16}/>
                                </button>
                                <button onClick={() => handleDeleteHistory(h.id)} className="btn-icon danger" title="Excluir">
                                    <Trash2 size={16}/>
                                </button>
                            </div>
                        </div>
                      );
                  })}
                  {history.length === 0 && <p style={{textAlign:'center', color:'#666', padding: 40}}>Nenhum disparo recente.</p>}
              </div>
              
              {totalPages > 1 && (
                  <div className="pagination-controls-remarketing">
                      <button onClick={prevPage} disabled={currentPage === 1}><ChevronLeft size={16}/></button>
                      <span>Página {currentPage} de {totalPages}</span>
                      <button onClick={nextPage} disabled={currentPage === totalPages}><ChevronRight size={16}/></button>
                  </div>
              )}
          </div>
      ) : (
          <div className="wizard-container">
            <div className="wizard-step-indicator">Passo {step} de 3</div>

            {step === 1 && (
              <>
                <h2 className="wizard-title">Quem deve receber?</h2>
                <div className="wizard-options-grid">
                    {targetOptions.map(opt => (
                        <div 
                            key={opt.id} 
                            className={`option-card ${formData.target === opt.id ? 'selected' : ''}`}
                            onClick={() => setFormData({...formData, target: opt.id})}
                        >
                            <div className="opt-icon">{opt.icon}</div>
                            <h4>{opt.title}</h4>
                            <p>{opt.desc}</p>
                        </div>
                    ))}
                </div>
                <div className="wizard-footer">
                    <button className="btn-next" onClick={() => setStep(2)}>Próximo <ChevronRight size={18}/></button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="wizard-title">Conteúdo da Mensagem</h2>
                <div className="content-form">
                    <div className="form-group">
                        <label><MessageSquare size={16}/> Mensagem (HTML)</label>
                        <RichInput 
                            value={formData.mensagem} 
                            onChange={(val) => setFormData({...formData, mensagem: val})}
                            placeholder="Use <b>negrito</b>, <i>itálico</i>..."
                        />
                    </div>
                    
                    <div className="form-group">
                        <label><Image size={16}/> Mídia (Opcional)</label>
                        <input 
                            className="input-field" 
                            placeholder="URL da Imagem ou Vídeo (.mp4)"
                            value={formData.media_url}
                            onChange={(e) => setFormData({...formData, media_url: e.target.value})}
                        />
                    </div>

                    <div className="offer-toggle-box">
                        <div className="toggle-header">
                            <input 
                                type="checkbox" 
                                id="offer_chk"
                                checked={formData.incluir_oferta}
                                onChange={(e) => setFormData({...formData, incluir_oferta: e.target.checked})}
                            />
                            <label htmlFor="offer_chk">Incluir Botão de Oferta</label>
                        </div>
                        
                        {formData.incluir_oferta && (
                            <div className="offer-details">
                                <label>Selecione o Plano:</label>
                                <select 
                                    className="input-field"
                                    value={formData.plano_oferta_id}
                                    onChange={(e) => setFormData({...formData, plano_oferta_id: e.target.value})}
                                >
                                    <option value="">Selecione...</option>
                                    {plans.map(p => (
                                        <option key={p.id} value={p.id}>{p.nome_exibicao} (R$ {p.preco_atual})</option>
                                    ))}
                                </select>

                                <div className="price-mode-row" style={{marginTop: 15}}>
                                    <label>Preço:</label>
                                    <div className="radio-group">
                                        <label>
                                            <input 
                                                type="radio" name="pmode" value="original"
                                                checked={formData.price_mode === 'original'}
                                                onChange={() => setFormData({...formData, price_mode: 'original'})}
                                            /> Original
                                        </label>
                                        <label>
                                            <input 
                                                type="radio" name="pmode" value="custom"
                                                checked={formData.price_mode === 'custom'}
                                                onChange={() => setFormData({...formData, price_mode: 'custom'})}
                                            /> Promo
                                        </label>
                                    </div>
                                </div>
                                {formData.price_mode === 'custom' && (
                                    <input 
                                        type="number" className="input-field" 
                                        placeholder="Valor Promocional (Ex: 9.90)"
                                        style={{marginTop: 5}}
                                        value={formData.custom_price}
                                        onChange={(e) => setFormData({...formData, custom_price: e.target.value})}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <div className="wizard-footer">
                    <button className="btn-back" onClick={() => setStep(1)}>Voltar</button>
                    <button className="btn-next" onClick={() => setStep(3)}>Revisar <ChevronRight size={18}/></button>
                </div>
              </>
            )}

            {step === 3 && (
                <>
                    <h2 className="wizard-title">Confirmar Disparo</h2>
                    <div className="review-card">
                        <div className="review-item">
                            <span>Público:</span>
                            <strong>{targetOptions.find(o => o.id === formData.target)?.title}</strong>
                        </div>
                        <div className="review-item">
                            <span>Mídia:</span>
                            <strong>{formData.media_url ? 'Sim (URL definida)' : 'Apenas Texto'}</strong>
                        </div>
                        {formData.incluir_oferta && (
                            <div className="review-item">
                                <span>Oferta:</span>
                                <strong>
                                    {plans.find(p => p.id == formData.plano_oferta_id)?.nome_exibicao} 
                                    {formData.price_mode === 'custom' ? ` (R$ ${formData.custom_price})` : ''}
                                </strong>
                            </div>
                        )}
                        <div className="preview-msg-box">
                            <small>Pré-visualização:</small>
                            <div dangerouslySetInnerHTML={{__html: formData.mensagem}} />
                        </div>
                    </div>
                    <div className="wizard-footer">
                        <button className="btn-back" onClick={() => setStep(2)}>Editar</button>
                        <button className="btn-send-final" onClick={handleEnviar} disabled={loading}>
                            {loading ? <Loader2 className="spin"/> : <Send size={18}/>} 
                            DISPARAR AGORA
                        </button>
                    </div>
                </>
            )}
          </div>
      )}
    </div>
  );
}