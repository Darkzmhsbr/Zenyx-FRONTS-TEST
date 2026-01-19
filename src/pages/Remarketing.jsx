import React, { useState, useEffect } from 'react';
// CORREÇÃO DOS CAMINHOS (DE ../../ PARA ../)
import { useBot } from '../context/BotContext';
import { remarketingService, planService } from '../services/api';
import { Send, Users, Image, MessageSquare, CheckCircle, AlertTriangle, History, Tag, Clock, RotateCcw, Edit, Play, Trash2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { RichInput } from '../components/RichInput';
import Swal from 'sweetalert2';
// O CSS geralmente fica na mesma pasta, então ./ funciona
import './Remarketing.css';

export function Remarketing() {
  const { selectedBot } = useBot();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [history, setHistory] = useState([]);
  
  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [perPage] = useState(10);
  
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
          // Ajuste para garantir que leia os dados corretos do backend
          const response = await remarketingService.getHistory(selectedBot.id, currentPage, perPage);
          setHistory(response.data || []);
          setTotalCount(response.total || 0);
          setTotalPages(response.total_pages || 1);
      } catch (error) {
          console.error("Erro ao carregar histórico:", error);
          setHistory([]);
      }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  const handleDelete = async (historyId) => {
    const result = await Swal.fire({
      title: 'Deletar campanha?',
      text: "Esta ação remove apenas do histórico visual.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, deletar',
      cancelButtonText: 'Cancelar',
      background: '#151515',
      color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        await remarketingService.deleteHistory(selectedBot.id, historyId);
        Swal.fire({
          title: 'Deletado!',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: '#151515',
          color: '#fff'
        });
        carregarHistorico();
      } catch (error) {
        console.error('Erro ao deletar:', error);
        Swal.fire({ title: 'Erro', text: 'Falha ao deletar.', icon: 'error', background: '#151515', color: '#fff' });
      }
    }
  };

  // 🔥 [CORREÇÃO CRÍTICA] LÓGICA DE REUTILIZAR DADOS
  // Essa função traduz os dados salvos no banco (msg, media) para o formulário (mensagem, media_url)
  const handleReusar = (item) => {
    try {
      let config = {};
      // Tenta parsear se for string, ou usa direto se for objeto
      if (typeof item.config === 'string') {
          try { config = JSON.parse(item.config); } catch (e) { config = {}; }
      } else {
          config = item.config || {};
      }
      
      // Mapeamento Inteligente: Tenta chaves novas E antigas
      const novaMsg = config.msg || config.mensagem || '';
      const novaMedia = config.media || config.media_url || '';
      // Offer pode ser booleano false, então checamos undefined
      const novaOferta = config.offer !== undefined ? config.offer : (config.incluir_oferta || false);
      const novoPlanoId = config.plano_id || config.plano_oferta_id || '';
      const novoPrecoCustom = config.custom_price || '';

      setFormData({
        target: item.target || 'todos',
        mensagem: novaMsg,
        media_url: novaMedia,
        incluir_oferta: novaOferta,
        plano_oferta_id: novoPlanoId,
        price_mode: novoPrecoCustom ? 'custom' : 'original',
        custom_price: novoPrecoCustom,
        expiration_mode: config.expiration_mode || 'none',
        expiration_value: config.expiration_value || '',
        tipo_envio: 'massivo',
        agendar: false
      });

      setStep(1); // Vai para a tela de edição
      window.scrollTo(0, 0);
      
      const Toast = Swal.mixin({toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true});
      Toast.fire({icon: 'success', title: 'Configurações recuperadas!'});

    } catch (error) {
      console.error("Erro ao reusar campanha:", error);
      Swal.fire({
        title: 'Erro',
        text: 'Falha ao carregar configuração.',
        icon: 'error',
        background: '#151515', color: '#fff'
      });
    }
  };

  const handleTestarIndividual = async (item) => {
    const { value: telegramId } = await Swal.fire({
      title: 'Testar Envio Individual',
      input: 'text',
      inputLabel: 'Digite o Telegram ID:',
      inputPlaceholder: 'Ex: 123456789',
      showCancelButton: true,
      confirmButtonText: 'Enviar Teste',
      background: '#151515', color: '#fff'
    });

    if (telegramId) {
      try {
        setLoading(true);
        await remarketingService.sendIndividual({
          bot_id: selectedBot.id,
          user_telegram_id: telegramId,
          campaign_history_id: item.id
        });
        
        Swal.fire({
          title: 'Teste Enviado!',
          text: `Mensagem enviada para o ID ${telegramId}`,
          icon: 'success',
          timer: 2000, showConfirmButton: false, background: '#151515', color: '#fff'
        });
      } catch (error) {
        console.error('Erro ao enviar teste:', error);
        Swal.fire({ title: 'Erro', text: 'Falha ao enviar teste.', icon: 'error', background: '#151515', color: '#fff' });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEnviar = async () => {
    // Validações
    if (!selectedBot?.id) return;
    if (!formData.mensagem.trim()) {
      Swal.fire({ title: 'Atenção', text: 'Escreva uma mensagem.', icon: 'warning', background: '#151515', color: '#fff' });
      return;
    }
    if (formData.incluir_oferta && !formData.plano_oferta_id) {
      Swal.fire({ title: 'Atenção', text: 'Selecione um plano.', icon: 'warning', background: '#151515', color: '#fff' });
      return;
    }

    setLoading(true);
    
    try {
      const result = await remarketingService.send(selectedBot.id, formData);
      
      Swal.fire({
        title: 'Enviado com Sucesso!',
        html: `
          <div style="text-align: left; padding: 10px;">
            <p>✅ Enviados: ${result.sent_success || 0}</p>
            <p>❌ Bloqueados: ${result.blocked_count || 0}</p>
            <p>👥 Total Processado: ${result.total_leads || 0}</p>
          </div>
        `,
        icon: 'success',
        confirmButtonText: 'OK',
        background: '#151515', color: '#fff'
      });

      // Reset
      setFormData({
        target: 'todos', mensagem: '', media_url: '', incluir_oferta: false, plano_oferta_id: '',
        price_mode: 'original', custom_price: '', expiration_mode: 'none', expiration_value: ''
      });
      setStep(1);
      carregarHistorico();
    } catch (error) {
      console.error("Erro ao enviar:", error);
      Swal.fire({ title: 'Erro', text: 'Falha ao processar campanha.', icon: 'error', background: '#151515', color: '#fff' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="remarketing-container">
      
      {/* HEADER TABS (LAYOUT QUE VOCÊ GOSTA) */}
      <div className="tabs-header">
          <button className={`tab-btn ${step < 4 ? 'active' : ''}`} onClick={() => setStep(1)}>
              <Send size={18}/> Nova Campanha
          </button>
          <button className={`tab-btn ${step === 4 ? 'active' : ''}`} onClick={() => { setStep(4); carregarHistorico(); }}>
              <History size={18}/> Histórico
          </button>
      </div>

      {/* HISTÓRICO */}
      {step === 4 ? (
          <div className="history-section">
            <div className="history-list">
                {history.length === 0 ? (
                  <p style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
                    Nenhuma campanha enviada ainda.
                  </p>
                ) : (
                  history.map(item => {
                    let config = {};
                    try { config = typeof item.config === 'string' ? JSON.parse(item.config) : item.config; } catch (e) {}

                    // Normalização para exibição
                    const displayMsg = config.msg || config.mensagem || "Sem texto";
                    const targetLabel = targetOptions.find(t => t.id === item.target)?.title || item.target || 'Desconhecido';
                    const dataFormatada = item.data_envio 
                      ? new Date(item.data_envio).toLocaleString('pt-BR')
                      : 'Data desconhecida';

                    return (
                      <div key={item.id} className="history-card">
                        <div className="h-header">
                            <span className="h-date">{dataFormatada}</span>
                            <span className={`h-badge ${item.target}`}>{targetLabel}</span>
                        </div>
                        <div className="h-body">
                            {/* Exibe HTML formatado na prévia */}
                            <div className="h-msg" dangerouslySetInnerHTML={{__html: displayMsg.substring(0, 100) + '...'}} />
                            
                            <div className="h-stats">
                                <span>✅ {item.sent_success || 0} enviados</span>
                                <span>🚫 {item.blocked_count || 0} bloqueados</span>
                            </div>
                        </div>
                        <div className="h-actions">
                          <button 
                            className="btn-icon" 
                            onClick={() => handleReusar(item)}
                            title="Reutilizar (Preenche o formulário)"
                          >
                            <RotateCcw size={16} />
                          </button>
                          <button 
                            className="btn-icon" 
                            onClick={() => handleTestarIndividual(item)}
                            title="Testar envio individual"
                          >
                            <Play size={16} />
                          </button>
                          <button 
                            className="btn-icon danger" 
                            onClick={() => handleDelete(item.id)}
                            title="Deletar esta campanha"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
            </div>
            
            {totalPages > 1 && (
              <div className="pagination-controls-remarketing">
                <button onClick={prevPage} disabled={currentPage === 1}><ChevronLeft size={16}/></button>
                <div className="page-info">
                    Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
                </div>
                <button onClick={nextPage} disabled={currentPage === totalPages}><ChevronRight size={16}/></button>
              </div>
            )}
          </div>
      ) : (
          /* WIZARD (MANTIDO EXATAMENTE COMO NO SEU ARQUIVO DE REFERÊNCIA) */
          <div className="wizard-container">
            <div className="wizard-step-indicator">
              Passo {step} de 3
            </div>

            {/* STEP 1: PÚBLICO */}
            {step === 1 && (
              <>
                <h3 style={{ marginBottom: '20px' }}>Quem vai receber esta campanha?</h3>
                <div className="wizard-options-grid">
                  {targetOptions.map(opt => (
                    <div 
                      key={opt.id} 
                      className={`option-card ${formData.target === opt.id ? 'selected' : ''}`}
                      onClick={() => setFormData({ ...formData, target: opt.id })}
                    >
                      <div className="opt-icon">{opt.icon}</div>
                      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{opt.title}</div>
                      <div style={{ fontSize: '0.85rem', color: '#aaa' }}>{opt.desc}</div>
                    </div>
                  ))}
                </div>
                <div className="wizard-footer">
                  <button className="btn-next" onClick={() => setStep(2)}>
                    Próximo <ChevronRight size={18} />
                  </button>
                </div>
              </>
            )}

            {/* STEP 2: MENSAGEM */}
            {step === 2 && (
              <>
                <h3 style={{ marginBottom: '20px' }}>Monte sua mensagem</h3>
                
                <div className="form-group">
                  <label><MessageSquare size={16} style={{ verticalAlign: 'middle' }} /> Mensagem (HTML)</label>
                  <RichInput 
                    value={formData.mensagem} 
                    onChange={(val) => setFormData({ ...formData, mensagem: val })}
                    rows={6}
                    placeholder="Use <b>negrito</b>, <i>itálico</i>..."
                  />
                </div>

                <div className="form-group">
                  <label><Image size={16} style={{ verticalAlign: 'middle' }} /> URL da Mídia (Opcional)</label>
                  <input
                    className="input-field"
                    type="text"
                    placeholder="https://exemplo.com/imagem.jpg"
                    value={formData.media_url}
                    onChange={(e) => setFormData({ ...formData, media_url: e.target.value })}
                  />
                </div>

                {/* OFERTA ESPECIAL */}
                <div className="offer-toggle-box">
                  <div className="toggle-header">
                    <input 
                      type="checkbox" 
                      id="offer_chk"
                      checked={formData.incluir_oferta}
                      onChange={(e) => setFormData({ ...formData, incluir_oferta: e.target.checked })}
                    />
                    <label htmlFor="offer_chk">Incluir Botão de Oferta</label>
                  </div>
                  
                  {formData.incluir_oferta && (
                    <div className="offer-details">
                      <div className="form-group">
                        <label>Plano da Oferta</label>
                        <select 
                          className="input-field"
                          value={formData.plano_oferta_id}
                          onChange={(e) => setFormData({ ...formData, plano_oferta_id: e.target.value })}
                        >
                          <option value="">Selecione um plano</option>
                          {plans.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.nome_exibicao} - R$ {p.preco_atual}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Preço</label>
                        <div className="price-mode-row">
                            <div className="radio-group">
                                <label>
                                    <input type="radio" name="pmode" value="original"
                                        checked={formData.price_mode === 'original'}
                                        onChange={() => setFormData({ ...formData, price_mode: 'original' })}
                                    /> Original
                                </label>
                                <label>
                                    <input type="radio" name="pmode" value="custom"
                                        checked={formData.price_mode === 'custom'}
                                        onChange={() => setFormData({ ...formData, price_mode: 'custom' })}
                                    /> Promo
                                </label>
                            </div>
                        </div>
                        {formData.price_mode === 'custom' && (
                          <input
                            className="input-field"
                            type="number"
                            step="0.01"
                            placeholder="Ex: 9.90"
                            value={formData.custom_price}
                            onChange={(e) => setFormData({ ...formData, custom_price: e.target.value })}
                            style={{ marginTop: '10px' }}
                          />
                        )}
                      </div>

                      <div className="form-group">
                        <label><Clock size={16} /> Expiração da Oferta</label>
                        <div className="price-mode-row">
                            <div className="radio-group">
                                <label>
                                    <input type="radio" name="expmode" value="none"
                                        checked={formData.expiration_mode === 'none'}
                                        onChange={() => setFormData({ ...formData, expiration_mode: 'none' })}
                                    /> Sem Expiração
                                </label>
                                <label>
                                    <input type="radio" name="expmode" value="minutes"
                                        checked={formData.expiration_mode === 'minutes'}
                                        onChange={() => setFormData({ ...formData, expiration_mode: 'minutes' })}
                                    /> Minutos
                                </label>
                                <label>
                                    <input type="radio" name="expmode" value="hours"
                                        checked={formData.expiration_mode === 'hours'}
                                        onChange={() => setFormData({ ...formData, expiration_mode: 'hours' })}
                                    /> Horas
                                </label>
                            </div>
                        </div>
                        {formData.expiration_mode !== 'none' && (
                          <input
                            className="input-field"
                            type="number"
                            placeholder="Quantidade"
                            value={formData.expiration_value}
                            onChange={(e) => setFormData({ ...formData, expiration_value: e.target.value })}
                            style={{ marginTop: '10px' }}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="wizard-actions">
                  <button className="btn-back" onClick={() => setStep(1)}>
                    Voltar
                  </button>
                  <button className="btn-next" onClick={() => setStep(3)}>
                    Próximo
                  </button>
                </div>
              </>
            )}

            {/* STEP 3: REVISÃO */}
            {step === 3 && (
              <>
                <h3 style={{ marginBottom: '20px' }}>Revisão Final</h3>
                
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

                <div className="wizard-actions">
                  <button className="btn-back" onClick={() => setStep(2)}>
                    Voltar
                  </button>
                  <button 
                    className="btn-send-final" 
                    onClick={handleEnviar}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="spin" size={18}/> : <Send size={18} />}
                    {loading ? 'Enviando...' : 'Enviar Agora'}
                  </button>
                </div>
              </>
            )}
          </div>
      )}
    </div>
  );
}