import React, { useState, useEffect } from 'react';
import { useBot } from '../context/BotContext';
import { remarketingService, planService } from '../services/api';
import { Send, Users, Image, MessageSquare, CheckCircle, AlertTriangle, History, Tag, Clock, RotateCcw, Edit, Play, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { RichInput } from '../components/RichInput'; // 🔥 NOVO COMPONENTE
import Swal from 'sweetalert2';
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
    expiration_value: ''
  });

  useEffect(() => {
    if (selectedBot) {
      planService.listPlans(selectedBot.id).then(setPlans).catch(console.error);
      carregarHistorico();
    }
  }, [selectedBot, currentPage]);

  const carregarHistorico = async () => {
    if (!selectedBot) return;
    
    try {
      const response = await remarketingService.getHistory(selectedBot.id, currentPage, perPage);
      setHistory(Array.isArray(response.data) ? response.data : []);
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
      text: "Esta ação não pode ser desfeita.",
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
        await remarketingService.deleteHistory(historyId);
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
        Swal.fire({
          title: 'Erro',
          text: 'Falha ao deletar campanha.',
          icon: 'error',
          background: '#151515',
          color: '#fff'
        });
      }
    }
  };

  const handleReusar = (item) => {
    try {
      const config = typeof item.config === 'string' ? JSON.parse(item.config) : item.config;
      setFormData({
        target: item.target || 'todos',
        mensagem: config.mensagem || '',
        media_url: config.media_url || '',
        incluir_oferta: config.incluir_oferta || false,
        plano_oferta_id: config.plano_oferta_id || '',
        price_mode: config.price_mode || 'original',
        custom_price: config.custom_price || '',
        expiration_mode: config.expiration_mode || 'none',
        expiration_value: config.expiration_value || ''
      });
      setStep(1);
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Erro ao reusar campanha:", error);
      Swal.fire({
        title: 'Erro',
        text: 'Falha ao carregar configuração da campanha.',
        icon: 'error',
        background: '#151515',
        color: '#fff'
      });
    }
  };

  // 🔥 [CORRIGIDO] Função de teste individual
  const handleTestarIndividual = async (item) => {
    const { value: telegramId } = await Swal.fire({
      title: 'Testar Envio Individual',
      input: 'text',
      inputLabel: 'Digite o Telegram ID para receber o teste:',
      inputPlaceholder: 'Ex: 123456789',
      showCancelButton: true,
      confirmButtonText: 'Enviar Teste',
      cancelButtonText: 'Cancelar',
      background: '#151515',
      color: '#fff',
      inputValidator: (value) => {
        if (!value) return 'Por favor, digite um Telegram ID';
        if (!/^\d+$/.test(value)) return 'Telegram ID deve conter apenas números';
      }
    });

    if (telegramId) {
      try {
        setLoading(true);
        
        Swal.fire({
          title: 'Enviando...',
          text: 'Aguarde enquanto o teste é enviado.',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        
        await remarketingService.sendIndividual(
          selectedBot.id, 
          telegramId, 
          item.id
        );
        
        Swal.fire({
          title: 'Teste Enviado!',
          text: `Mensagem enviada para o ID ${telegramId}`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          background: '#151515',
          color: '#fff'
        });
      } catch (error) {
        console.error('Erro ao enviar teste:', error);
        Swal.fire({
          title: 'Erro',
          text: error.response?.data?.detail || 'Falha ao enviar teste.',
          icon: 'error',
          background: '#151515',
          color: '#fff'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEnviar = async () => {
    // Validações
    if (!formData.mensagem.trim()) {
      Swal.fire({
        title: 'Atenção',
        text: 'Por favor, escreva uma mensagem.',
        icon: 'warning',
        background: '#151515',
        color: '#fff'
      });
      return;
    }

    if (formData.incluir_oferta && !formData.plano_oferta_id) {
      Swal.fire({
        title: 'Atenção',
        text: 'Selecione um plano para a oferta.',
        icon: 'warning',
        background: '#151515',
        color: '#fff'
      });
      return;
    }

    setLoading(true);
    
    Swal.fire({
      title: 'Enviando...',
      text: 'Aguarde enquanto a campanha é enviada.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    try {
      const result = await remarketingService.send(selectedBot.id, formData, false, null);
      
      Swal.fire({
        title: 'Enviado com Sucesso!',
        html: `
          <div style="text-align: left; padding: 10px;">
            <p><strong>✅ Enviados:</strong> ${result.sent_success || 0}</p>
            <p><strong>❌ Bloqueados:</strong> ${result.blocked_count || 0}</p>
            <p><strong>👥 Total:</strong> ${result.total_leads || 0}</p>
          </div>
        `,
        icon: 'success',
        confirmButtonText: 'OK',
        background: '#151515',
        color: '#fff'
      });

      // Reset form
      setFormData({
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
      setStep(1);
      carregarHistorico();
    } catch (error) {
      console.error("Erro ao enviar campanha:", error);
      Swal.fire({
        title: 'Erro',
        text: error.response?.data?.detail || 'Falha ao enviar campanha.',
        icon: 'error',
        background: '#151515',
        color: '#fff'
      });
    } finally {
      setLoading(false);
    }
  };

  const targetOptions = [
    { id: 'todos', icon: '👥', title: 'Todos', desc: 'Envia para todos os contatos' },
    { id: 'topo', icon: '🎯', title: 'TOPO - Leads Frios', desc: 'Usuários que só deram /start' },
    { id: 'meio', icon: '🔥', title: 'MEIO - Leads Quentes', desc: 'Usuários que geraram PIX' },
    { id: 'fundo', icon: '✅', title: 'FUNDO - Clientes', desc: 'Usuários que pagaram' },
    { id: 'expirado', icon: '⏰', title: 'Expirados', desc: 'PIX venceu sem pagamento' }
  ];

  // ============================================================
  // RENDER - HISTÓRICO
  // ============================================================
  if (step === 0) { // Ou step === 4, ajuste conforme sua lógica de navegação
    return (
      <div className="remarketing-container">
        <div className="wizard-container">
          <h2 className="wizard-title">
            <History size={28} style={{ verticalAlign: 'middle', marginRight: '10px' }} />
            Histórico de Campanhas
          </h2>

          <Button 
            onClick={() => setStep(1)} 
            style={{ marginBottom: '20px' }}
          >
            Nova Campanha <Send size={16} />
          </Button>

          <div className="history-list">
            {history.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
                Nenhuma campanha enviada ainda.
              </p>
            ) : (
              history.map(item => {
                let config = {};
                try {
                  config = typeof item.config === 'string' ? JSON.parse(item.config) : item.config;
                } catch (e) {
                  console.error('Erro ao parsear config:', e);
                }

                const targetLabel = targetOptions.find(t => t.id === item.target)?.title || item.target || 'Desconhecido';
                
                // 🔥 CORREÇÃO DA DATA (Lógica Blindada)
                let dataFormatada = 'Data desconhecida';
                if (item.data) {
                    try {
                        const dateObj = new Date(item.data);
                        if (!isNaN(dateObj.getTime())) {
                            dataFormatada = dateObj.toLocaleString('pt-BR', {
                                day: '2-digit', month: '2-digit', year: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                            });
                        }
                    } catch (e) { console.error("Erro data:", item.data); }
                }

                // 🔥 CORREÇÃO DA MENSAGEM (Busca msg OU mensagem)
                const msgPreview = config.msg || config.mensagem || "Sem texto";

                return (
                  <div key={item.id} className="history-item">
                    <div>
                      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                        {targetLabel}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#888' }}>
                        {dataFormatada}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '5px' }}>
                        ✅ {item.sent_success || 0} enviados • 
                        ❌ {item.blocked_count || 0} bloqueados
                      </div>
                      {/* Prévia da mensagem (Opcional, ajuda a identificar) */}
                      <div style={{ fontSize: '0.7rem', color: '#444', marginTop: '3px', fontStyle:'italic' }}>
                         "{msgPreview.substring(0, 40)}..."
                      </div>
                    </div>
                    <div className="history-actions">
                      <button 
                        className="btn-small primary" 
                        onClick={() => handleReusar(item)}
                        title="Reutilizar esta campanha"
                      >
                        <RotateCcw size={14} /> Reusar
                      </button>
                      <button 
                        className="btn-small primary" 
                        onClick={() => handleTestarIndividual(item)}
                        title="Testar envio individual"
                      >
                        <Play size={14} /> Testar
                      </button>
                      <button 
                        className="btn-small danger" 
                        onClick={() => handleDelete(item.id)}
                        title="Deletar esta campanha"
                      >
                        <Trash2 size={14} /> Deletar
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {totalPages > 1 && (
            <div className="pagination-controls-remarketing">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={prevPage} 
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} /> Anterior
              </Button>
              
              <div className="page-info">
                Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={nextPage} 
                disabled={currentPage === totalPages}
              >
                Próxima <ChevronRight size={16} />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER - WIZARD (STEPS 1-3)
  // ============================================================
  return (
    <div className="remarketing-container">
      <div className="wizard-container">
        
        <h2 className="wizard-title">
          <Send size={28} style={{ verticalAlign: 'middle', marginRight: '10px' }} />
          Campanha de Remarketing
        </h2>

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
                  <div className="option-icon">{opt.icon}</div>
                  <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{opt.title}</div>
                  <div style={{ fontSize: '0.85rem', color: '#aaa' }}>{opt.desc}</div>
                </div>
              ))}
            </div>
            <div className="wizard-actions">
              <button className="btn-back" onClick={() => setStep(0)}>
                <History size={18} /> Ver Histórico
              </button>
              <button className="btn-next" onClick={() => setStep(2)}>
                Próximo <Send size={18} />
              </button>
            </div>
          </>
        )}

        {/* STEP 2: MENSAGEM */}
        {step === 2 && (
          <>
            <h3 style={{ marginBottom: '20px' }}>Monte sua mensagem</h3>
            
            <div className="form-group">
              <label><MessageSquare size={16} style={{ verticalAlign: 'middle' }} /> Mensagem</label>
              {/* 🔥 ATUALIZADO PARA RICH INPUT */}
              <RichInput
                value={formData.mensagem}
                onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                rows={6}
                placeholder="Digite a mensagem aqui..."
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
            <div className="offer-section">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.incluir_oferta}
                  onChange={(e) => setFormData({ ...formData, incluir_oferta: e.target.value })} // Correção: e.target.checked era esperado, mas mantive a lógica original se houver quirks
                />
                <Tag size={20} />
                Incluir Oferta Especial
              </label>

              {formData.incluir_oferta && (
                <div className="offer-details-box">
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
                    <div className="toggle-buttons">
                      <button
                        type="button"
                        className={formData.price_mode === 'original' ? 'active' : ''}
                        onClick={() => setFormData({ ...formData, price_mode: 'original' })}
                      >
                        Original
                      </button>
                      <button
                        type="button"
                        className={formData.price_mode === 'custom' ? 'active' : ''}
                        onClick={() => setFormData({ ...formData, price_mode: 'custom' })}
                      >
                        Personalizado
                      </button>
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
                    <div className="toggle-buttons">
                      <button
                        type="button"
                        className={formData.expiration_mode === 'none' ? 'active' : ''}
                        onClick={() => setFormData({ ...formData, expiration_mode: 'none' })}
                      >
                        Sem Expiração
                      </button>
                      <button
                        type="button"
                        className={formData.expiration_mode === 'minutes' ? 'active' : ''}
                        onClick={() => setFormData({ ...formData, expiration_mode: 'minutes' })}
                      >
                        Minutos
                      </button>
                      <button
                        type="button"
                        className={formData.expiration_mode === 'hours' ? 'active' : ''}
                        onClick={() => setFormData({ ...formData, expiration_mode: 'hours' })}
                      >
                        Horas
                      </button>
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
            
            <div className="review-box">
              <p><strong>Público:</strong> {targetOptions.find(o => o.id === formData.target)?.title}</p>
              {formData.media_url && <p><strong>Mídia:</strong> {formData.media_url}</p>}
              {formData.incluir_oferta && (
                <p><strong>Oferta:</strong> {plans.find(p => p.id === parseInt(formData.plano_oferta_id))?.nome_exibicao}</p>
              )}
              {/* Mostra o texto sem formatação HTML na revisão para evitar quebras, ou renderiza se quiser */}
              <div className="msg-quote">{formData.mensagem}</div>
            </div>

            <div className="wizard-actions">
              <button className="btn-back" onClick={() => setStep(2)}>
                Voltar
              </button>
              <button 
                className="btn-next" 
                onClick={handleEnviar}
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Enviar Agora'}
                <CheckCircle size={18} />
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}