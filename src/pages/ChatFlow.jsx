import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Save, MessageSquare, ArrowDown, Zap, Image as ImageIcon, Video, Plus, Trash2, Edit, Clock, Layout, Globe, Smartphone } from 'lucide-react';
import { flowService } from '../services/api'; 
import { useBot } from '../context/BotContext'; 
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { Input } from '../components/Input';
import { RichInput } from '../components/RichInput';
import './ChatFlow.css';

export function ChatFlow() {
  const { selectedBot } = useBot(); 
  const [loading, setLoading] = useState(false);
  
  // Estado do Fluxo
  const [flow, setFlow] = useState({
    start_mode: 'padrao', // 'padrao' ou 'miniapp'
    miniapp_url: '',
    miniapp_btn_text: 'ABRIR LOJA 🛍️',
    msg_boas_vindas: '',
    media_url: '',
    btn_text_1: '',
    autodestruir_1: false,
    msg_2_texto: '',
    msg_2_media: '',
    mostrar_planos_2: true,
    mostrar_planos_1: false 
  });

  // Estado dos Passos Dinâmicos (Lista)
  const [steps, setSteps] = useState([]);
  
  // Estado do Modal
  const [showModal, setShowModal] = useState(false);
  const [editingStep, setEditingStep] = useState(null); 
  const [modalData, setModalData] = useState({
    msg_texto: '',
    msg_media: '',
    btn_texto: 'Próximo ▶️',
    autodestruir: false,
    mostrar_botao: true,
    delay_seconds: 0 
  });

  // Carrega tudo ao mudar o bot
  useEffect(() => {
    if (selectedBot) {
      carregarTudo();
    }
  }, [selectedBot]);

  const carregarTudo = async () => {
    setLoading(true);
    try {
        // 1. Carrega Fluxo Fixo
        const flowData = await flowService.getFlow(selectedBot.id);
        if (flowData) {
            setFlow({
                ...flowData,
                start_mode: flowData.start_mode || 'padrao',
                miniapp_btn_text: flowData.miniapp_btn_text || 'ABRIR LOJA 🛍️',
                msg_boas_vindas: flowData.msg_boas_vindas || '',
                media_url: flowData.media_url || '',
                btn_text_1: flowData.btn_text_1 || '🔓 DESBLOQUEAR ACESSO',
                autodestruir_1: flowData.autodestruir_1 || false,
                msg_2_texto: flowData.msg_2_texto || '',
                msg_2_media: flowData.msg_2_media || '',
                mostrar_planos_2: flowData.mostrar_planos_2 !== false,
                mostrar_planos_1: flowData.mostrar_planos_1 || false
            });
        }

        // 2. Carrega Passos Dinâmicos
        const stepsData = await flowService.getSteps(selectedBot.id);
        setSteps(stepsData || []);

    } catch (error) {
        console.error("Erro ao carregar fluxo:", error);
    } finally {
        setLoading(false);
    }
  };

  // Salva apenas a parte fixa
  const handleSaveFixed = async () => {
    if (flow.start_mode === 'miniapp' && !flow.miniapp_url) {
        return Swal.fire('Atenção', 'Cole o link do seu Mini App para salvar.', 'warning');
    }

    try {
      await flowService.saveFlow(selectedBot.id, flow);
      Swal.fire({
        icon: 'success',
        title: 'Fluxo Salvo!',
        toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
        background: '#151515', color: '#fff'
      });
    } catch (error) {
      Swal.fire('Erro', 'Falha ao salvar.', 'error');
    }
  };

  // Abre modal para CRIAR
  const handleOpenCreateModal = () => {
    setEditingStep(null);
    setModalData({
      msg_texto: '',
      msg_media: '',
      btn_texto: 'Próximo ▶️',
      autodestruir: false,
      mostrar_botao: true,
      delay_seconds: 0
    });
    setShowModal(true);
  };

  // Abre modal para EDITAR
  const handleOpenEditModal = (step) => {
    setEditingStep(step);
    setModalData({
      msg_texto: step.msg_texto || '',
      msg_media: step.msg_media || '',
      btn_texto: step.btn_texto || 'Próximo ▶️',
      autodestruir: step.autodestruir || false,
      mostrar_botao: step.mostrar_botao !== false,
      delay_seconds: step.delay_seconds || 0
    });
    setShowModal(true);
  };

  // Salva o passo
  const handleSaveStep = async () => {
    if (!modalData.msg_texto && !modalData.msg_media) {
      return Swal.fire('Atenção', 'O passo precisa ter texto ou mídia!', 'warning');
    }
    
    try {
        if (editingStep) {
            await flowService.updateStep(selectedBot.id, editingStep.id, modalData);
            Swal.fire({ 
                icon: 'success', title: 'Passo Atualizado!', timer: 1500, showConfirmButton: false, 
                background: '#151515', color: '#fff' 
            });
        } else {
            await flowService.addStep(selectedBot.id, {
                ...modalData,
                step_order: steps.length + 1
            });
            Swal.fire({ 
                icon: 'success', title: 'Passo Adicionado!', timer: 1500, showConfirmButton: false, 
                background: '#151515', color: '#fff' 
            });
        }
        
        setShowModal(false);
        setEditingStep(null);
        carregarTudo(); 
        
    } catch (error) {
        Swal.fire('Erro', 'Falha ao salvar passo.', 'error');
    }
  };

  // Exclui passo
  const handleDeleteStep = async (stepId) => {
    const result = await Swal.fire({
        title: 'Excluir Passo?',
        text: "Isso removerá esta mensagem do fluxo.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sim, excluir',
        background: '#151515', 
        color: '#fff'
    });

    if (result.isConfirmed) {
        try {
            await flowService.deleteStep(selectedBot.id, stepId);
            carregarTudo();
        } catch (error) {
            Swal.fire('Erro', 'Falha ao excluir.', 'error');
        }
    }
  };

  if (!selectedBot) return <div className="chatflow-container">Selecione um bot...</div>;

  return (
    <div className="chatflow-container">
      
      <div className="page-header">
        <div className="header-titles">
          <h1>Editor de Fluxo</h1>
          <p>Configure a sequência de mensagens do seu bot.</p>
        </div>
        <div className="header-actions">
          <Button onClick={handleSaveFixed} disabled={loading} className="btn-save-main">
            <Save size={20} /> <span className="btn-text">Salvar Alterações</span>
          </Button>
        </div>
      </div>

      <div className="flow-steps">
        
        {/* ============================================================ */}
        {/* 1. SELETOR DE MODO DE INÍCIO */}
        {/* ============================================================ */}
        <Card className="step-card start-mode-card">
            <CardContent>
                <div className="card-header-row">
                    <Layout size={24} color="#c333ff" />
                    <h3>Modo de Início do Bot (/start)</h3>
                </div>

                <div className="mode-selector-grid">
                    {/* OPÇÃO 1: PADRÃO */}
                    <div 
                        className={`mode-card ${flow.start_mode === 'padrao' ? 'selected-padrao' : ''}`}
                        onClick={() => setFlow({...flow, start_mode: 'padrao'})}
                    >
                        <div className="mode-icon"><MessageSquare size={28} /></div>
                        <div className="mode-info">
                            <h4>Fluxo Padrão</h4>
                            <p>Mensagem + Botão que libera conteúdo dentro do Telegram.</p>
                        </div>
                        {flow.start_mode === 'padrao' && <div className="check-badge">ATIVO</div>}
                    </div>

                    {/* OPÇÃO 2: MINI APP */}
                    <div 
                        className={`mode-card ${flow.start_mode === 'miniapp' ? 'selected-miniapp' : ''}`}
                        onClick={() => setFlow({...flow, start_mode: 'miniapp'})}
                    >
                        <div className="mode-icon"><Smartphone size={28} /></div>
                        <div className="mode-info">
                            <h4>Mini App / Loja</h4>
                            <p>Botão Web App que abre a loja e identifica o usuário automaticamente.</p>
                        </div>
                        {flow.start_mode === 'miniapp' && <div className="check-badge">ATIVO</div>}
                    </div>
                </div>

                {/* CONFIGURAÇÃO EXTRA DO MODO MINI APP */}
                {flow.start_mode === 'miniapp' && (
                    <div className="miniapp-config-box">
                        <h4 className="config-title">Configuração do Botão Web App</h4>
                        
                        <div className="config-group">
                            <Input 
                                label="Link da Loja / Mini App (HTTPS)"
                                placeholder={`https://${window.location.host}/loja/${selectedBot.id}`}
                                value={flow.miniapp_url}
                                onChange={e => setFlow({...flow, miniapp_url: e.target.value})}
                                icon={<Globe size={16} />}
                            />
                            <p className="hint-text">
                                Dica: Copie o link da sua loja no menu "Extras" ou use o link do Vercel/Railway.
                            </p>
                        </div>

                        <Input 
                            label="Texto do Botão"
                            value={flow.miniapp_btn_text}
                            onChange={e => setFlow({...flow, miniapp_btn_text: e.target.value})}
                            placeholder="ABRIR LOJA 🛍️"
                        />
                    </div>
                )}
            </CardContent>
        </Card>

        {/* --- PASSO 1: BOAS VINDAS --- */}
        <Card className="step-card">
          <div className="step-badge">Passo 1 (Início)</div>
          <CardContent>
            <div className="step-header">
              <div className="step-title-row">
                  <MessageSquare size={20} color="#d65ad1"/>
                  <h3>Mensagem de Boas-Vindas</h3>
              </div>
            </div>

            <div className="form-grid">
              <RichInput 
                label="Texto da Mensagem" 
                value={flow.msg_boas_vindas}
                onChange={val => {
                    // 🔥 CORREÇÃO MANTIDA: Garante string
                    const textValue = typeof val === 'object' ? val.target.value : val;
                    setFlow({...flow, msg_boas_vindas: textValue});
                }}
              />

              <Input 
                label="Link da Mídia (Opcional)" 
                placeholder="Ex: https://..." 
                value={flow.media_url}
                onChange={e => setFlow({...flow, media_url: e.target.value})}
                icon={<ImageIcon size={16}/>}
              />
              
              {flow.start_mode === 'padrao' && (
                  <div className="buttons-config">
                      <div className="toggle-wrapper full-width">
                        <label>Mostrar botões de Planos (Checkout) nesta mensagem?</label>
                        <div 
                          className={`custom-toggle ${flow.mostrar_planos_1 ? 'active-green' : ''}`}
                          onClick={() => setFlow({...flow, mostrar_planos_1: !flow.mostrar_planos_1})}
                        >
                          <div className="toggle-handle"></div>
                          <span className="toggle-label">{flow.mostrar_planos_1 ? 'SIM' : 'NÃO'}</span>
                        </div>
                      </div>

                      {!flow.mostrar_planos_1 && (
                          <div className="row-inputs">
                              <Input 
                                  label="Texto do Botão de Ação" 
                                  value={flow.btn_text_1}
                                  onChange={e => setFlow({...flow, btn_text_1: e.target.value})}
                              />
                              <div className="toggle-wrapper">
                                  <label>Auto-destruir ao clicar?</label>
                                  <div 
                                      className={`custom-toggle ${flow.autodestruir_1 ? 'active' : ''}`}
                                      onClick={() => setFlow({...flow, autodestruir_1: !flow.autodestruir_1})}
                                  >
                                      <div className="toggle-handle"></div>
                                      <span className="toggle-label">{flow.autodestruir_1 ? 'SIM' : 'NÃO'}</span>
                                  </div>
                              </div>
                          </div>
                      )}
                  </div>
              )}
            </div>
          </CardContent>
        </Card>

        {flow.start_mode === 'padrao' && (
            <>
                <div className="connector-line"></div>
                <div className="connector-arrow"><ArrowDown size={24} color="#444" /></div>

                {steps.map((step, index) => (
                  <React.Fragment key={step.id}>
                      <Card className="step-card step-card-dynamic">
                          <div className="step-badge dynamic-badge">Passo Extra {index + 1}</div>
                          <CardContent>
                              <div className="step-header">
                                  <div className="step-title-row">
                                      <Zap size={20} color="#fff"/>
                                      <h3>Mensagem Intermediária</h3>
                                  </div>
                                  <div className="step-actions">
                                      <button className="icon-btn edit" onClick={() => handleOpenEditModal(step)} title="Editar">
                                          <Edit size={18} color="#3b82f6"/>
                                      </button>
                                      <button className="icon-btn danger" onClick={() => handleDeleteStep(step.id)} title="Excluir">
                                          <Trash2 size={18} color="#ef4444"/>
                                      </button>
                                  </div>
                              </div>
                              
                              <div className="preview-box">
                                  <p>{step.msg_texto ? step.msg_texto.substring(0, 100) + (step.msg_texto.length > 100 ? '...' : '') : '(Apenas mídia)'}</p>
                              </div>
                              
                              <div className="step-tags">
                                  {step.mostrar_botao ? 
                                    <span className="tag-badge btn">🔘 Botão: {step.btn_texto}</span> : 
                                    <span className="tag-badge gray">🚫 Sem botão</span>
                                  }
                                  {step.delay_seconds > 0 && 
                                    <span className="tag-badge time"><Clock size={12} /> {step.delay_seconds}s</span>
                                  }
                              </div>
                          </CardContent>
                      </Card>
                      <div className="connector-line"></div>
                      <div className="connector-arrow"><ArrowDown size={24} color="#444" /></div>
                  </React.Fragment>
                ))}

                <div className="add-step-wrapper">
                  <button className="btn-add-step" onClick={handleOpenCreateModal}>
                      <Plus size={20} /> Adicionar Nova Mensagem
                  </button>
                </div>

                <div className="connector-line"></div>
                <div className="connector-arrow"><ArrowDown size={24} color="#444" /></div>

                <Card className="step-card">
                  <div className="step-badge final">Passo Final (Oferta)</div>
                  <CardContent>
                    <div className="step-header">
                      <div className="step-title-row">
                          <Zap size={20} color="#10b981"/>
                          <h3>Mensagem de Oferta & Checkout</h3>
                      </div>
                    </div>

                    <div className="form-grid">
                      <RichInput 
                        label="Texto da Oferta" 
                        value={flow.msg_2_texto}
                        onChange={val => {
                            const textValue = typeof val === 'object' ? val.target.value : val;
                            setFlow({...flow, msg_2_texto: textValue});
                        }}
                      />
                      
                      <Input 
                        label="Mídia da Oferta (Opcional)" 
                        placeholder="Ex: https://..." 
                        value={flow.msg_2_media}
                        onChange={e => setFlow({...flow, msg_2_media: e.target.value})}
                        icon={<Video size={16}/>}
                      />

                      <div className="toggle-wrapper full-width">
                        <label>Mostrar botões de Planos automaticamente?</label>
                        <div 
                          className={`custom-toggle ${flow.mostrar_planos_2 ? 'active-green' : ''}`}
                          onClick={() => setFlow({...flow, mostrar_planos_2: !flow.mostrar_planos_2})}
                        >
                          <div className="toggle-handle"></div>
                          <span className="toggle-label">{flow.mostrar_planos_2 ? 'SIM' : 'OCULTAR'}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
            </>
        )}

      </div>

      {showModal && (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header-row">
                  <h2>{editingStep ? 'Editar Mensagem' : 'Nova Mensagem'}</h2>
                  <button className="btn-close-modal" onClick={() => setShowModal(false)}>✕</button>
                </div>
                
                <div className="modal-body">
                    <RichInput 
                        label="Texto"
                        value={modalData.msg_texto}
                        onChange={val => {
                            const textValue = typeof val === 'object' ? val.target.value : val;
                            setModalData({...modalData, msg_texto: textValue});
                        }}
                    />
                    <Input 
                        label="Mídia URL (Opcional)"
                        value={modalData.msg_media}
                        onChange={e => setModalData({...modalData, msg_media: e.target.value})}
                    />
                    
                    <div className="modal-options-box">
                        <label className="checkbox-label">
                            <input 
                                type="checkbox" 
                                checked={modalData.mostrar_botao}
                                onChange={e => setModalData({...modalData, mostrar_botao: e.target.checked})}
                            />
                            Mostrar botão "Próximo"?
                        </label>

                        {modalData.mostrar_botao ? (
                            <Input 
                                label="Texto do Botão"
                                value={modalData.btn_texto}
                                onChange={e => setModalData({...modalData, btn_texto: e.target.value})}
                            />
                        ) : (
                            <div className="delay-input-wrapper">
                                <Input 
                                    label="Intervalo para próxima mensagem (segundos)"
                                    type="number"
                                    min="0" max="30"
                                    value={modalData.delay_seconds}
                                    onChange={e => setModalData({
                                        ...modalData, 
                                        delay_seconds: parseInt(e.target.value) || 0
                                    })}
                                    icon={<Clock size={16}/>}
                                />
                                <p className="hint-text">⏱️ (0 = vai direto pro checkout)</p>
                            </div>
                        )}
                    </div>

                    <div className="toggle-wrapper modal-toggle">
                        <label>Auto-destruir após sair?</label>
                        <div 
                            className={`custom-toggle ${modalData.autodestruir ? 'active' : ''}`}
                            onClick={() => setModalData({...modalData, autodestruir: !modalData.autodestruir})}
                        >
                            <div className="toggle-handle"></div>
                            <span className="toggle-label">{modalData.autodestruir ? 'SIM' : 'NÃO'}</span>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
                        <button className="btn-save" onClick={handleSaveStep}>
                            {editingStep ? 'Salvar Alterações' : 'Adicionar ao Fluxo'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}