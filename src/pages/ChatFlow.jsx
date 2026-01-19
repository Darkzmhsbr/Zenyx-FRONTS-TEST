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
    // --- NOVOS CAMPOS: MODO DE INÍCIO ---
    start_mode: 'padrao', // 'padrao' ou 'miniapp'
    miniapp_url: '',
    miniapp_btn_text: 'ABRIR LOJA 🛍️',
    // ------------------------------------
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
  const [editingStep, setEditingStep] = useState(null); // null = criando novo, step = editando
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
                // Garante valores padrão se vier null do banco
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

  // Salva apenas a parte fixa (Passo 1 e Final)
  const handleSaveFixed = async () => {
    // Validação específica para o modo Mini App
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

  // Abre modal para CRIAR novo passo
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

  // Abre modal para EDITAR passo existente
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

  // Salva o passo (Criar OU Editar)
  const handleSaveStep = async () => {
    if (!modalData.msg_texto && !modalData.msg_media) {
      return Swal.fire('Atenção', 'O passo precisa ter texto ou mídia!', 'warning');
    }
    
    try {
        if (editingStep) {
            // EDITANDO passo existente
            await flowService.updateStep(selectedBot.id, editingStep.id, modalData);
            Swal.fire({ 
                icon: 'success', title: 'Passo Atualizado!', timer: 1500, showConfirmButton: false, 
                background: '#151515', color: '#fff' 
            });
        } else {
            // CRIANDO passo novo
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
        carregarTudo(); // Recarrega lista
        
    } catch (error) {
        Swal.fire('Erro', 'Falha ao salvar passo.', 'error');
    }
  };

  // Exclui passo dinâmico
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
        <div>
          <h1>Editor de Fluxo de Conversa</h1>
          <p style={{color: 'var(--muted-foreground)'}}>Configure a sequência de mensagens do seu bot.</p>
        </div>
        <Button onClick={handleSaveFixed} disabled={loading}>
          <Save size={20} /> Salvar Alterações
        </Button>
      </div>

      <div className="flow-steps">
        
        {/* ============================================================ */}
        {/* 🚀 1. SELETOR DE MODO DE INÍCIO (A NOVA FUNCIONALIDADE) */}
        {/* ============================================================ */}
        <Card className="step-card start-mode-card" style={{borderColor: '#c333ff', marginBottom: '30px'}}>
            <CardContent>
                <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px'}}>
                    <Layout size={24} color="#c333ff" />
                    <h3 style={{margin:0}}>Modo de Início do Bot (/start)</h3>
                </div>

                <div className="mode-selector" style={{display: 'flex', gap: '20px', marginBottom: '20px'}}>
                    {/* OPÇÃO 1: PADRÃO */}
                    <div 
                        className={`mode-option ${flow.start_mode === 'padrao' ? 'selected' : ''}`}
                        onClick={() => setFlow({...flow, start_mode: 'padrao'})}
                        style={{
                            flex: 1, padding: '15px', borderRadius: '10px', border: '2px solid',
                            borderColor: flow.start_mode === 'padrao' ? '#c333ff' : '#333',
                            background: flow.start_mode === 'padrao' ? 'rgba(195, 51, 255, 0.1)' : '#1a1a1a',
                            cursor: 'pointer'
                        }}
                    >
                        <MessageSquare size={24} style={{marginBottom: 10}} />
                        <h4>Fluxo Padrão</h4>
                        <p style={{fontSize: '0.8rem', color: '#888'}}>Mensagem + Botão que libera conteúdo dentro do Telegram.</p>
                    </div>

                    {/* OPÇÃO 2: MINI APP (WEB APP) */}
                    <div 
                        className={`mode-option ${flow.start_mode === 'miniapp' ? 'selected' : ''}`}
                        onClick={() => setFlow({...flow, start_mode: 'miniapp'})}
                        style={{
                            flex: 1, padding: '15px', borderRadius: '10px', border: '2px solid',
                            borderColor: flow.start_mode === 'miniapp' ? '#00c853' : '#333',
                            background: flow.start_mode === 'miniapp' ? 'rgba(0, 200, 83, 0.1)' : '#1a1a1a',
                            cursor: 'pointer'
                        }}
                    >
                        <Smartphone size={24} style={{marginBottom: 10}} />
                        <h4>Mini App / Loja (Automático)</h4>
                        <p style={{fontSize: '0.8rem', color: '#888'}}>
                            Botão Web App que abre a loja e <b>identifica o usuário automaticamente</b>.
                        </p>
                    </div>
                </div>

                {/* CONFIGURAÇÃO EXTRA DO MODO MINI APP */}
                {flow.start_mode === 'miniapp' && (
                    <div className="miniapp-config" style={{padding: '15px', background: '#111', borderRadius: '8px', border: '1px solid #333'}}>
                        <h4 style={{color: '#00c853', marginBottom: '15px'}}>Configuração do Botão Web App</h4>
                        
                        <div style={{marginBottom: '15px'}}>
                            <Input 
                                label="Link da Loja / Mini App (HTTPS Obrigatório)"
                                placeholder={`https://${window.location.host}/loja/${selectedBot.id}`}
                                value={flow.miniapp_url}
                                onChange={e => setFlow({...flow, miniapp_url: e.target.value})}
                                icon={<Globe size={16} />}
                            />
                            <p style={{fontSize: '0.75rem', color: '#666', marginTop: '-8px'}}>
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

        {/* --- PASSO 1: BOAS VINDAS (SEMPRE VISÍVEL) --- */}
        <Card className="step-card">
          <div className="step-badge">Passo 1 (Início)</div>
          <CardContent>
            <div className="step-header">
              <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                  <MessageSquare size={20} color="#d65ad1"/>
                  <h3>Mensagem de Boas-Vindas</h3>
              </div>
            </div>

            <div className="form-grid">
              <RichInput 
                label="Texto da Mensagem" 
                value={flow.msg_boas_vindas}
                onChange={val => setFlow({...flow, msg_boas_vindas: val})}
              />

              <Input 
                label="Link da Mídia (Foto ou Vídeo) - Opcional" 
                placeholder="Ex: https://..." 
                value={flow.media_url}
                onChange={e => setFlow({...flow, media_url: e.target.value})}
                icon={<ImageIcon size={16}/>}
              />
              
              {/* --- LÓGICA CONDICIONAL: SÓ MOSTRA OPÇÕES DO BOTÃO "PADRÃO" SE O MODO FOR "PADRÃO" --- */}
              {flow.start_mode === 'padrao' && (
                  <div className="buttons-config">
                      {/* OPÇÃO DE MOSTRAR PLANOS AQUI */}
                      <div className="toggle-wrapper full-width">
                        <label>Mostrar botões de Planos (Checkout) nesta mensagem?</label>
                        <div 
                          className={`custom-toggle ${flow.mostrar_planos_1 ? 'active-green' : ''}`}
                          onClick={() => setFlow({...flow, mostrar_planos_1: !flow.mostrar_planos_1})}
                        >
                          <div className="toggle-handle"></div>
                          <span className="toggle-label">{flow.mostrar_planos_1 ? 'MOSTRAR PLANOS' : 'BOTÃO NORMAL'}</span>
                        </div>
                      </div>

                      {/* CONFIG DO BOTÃO (SÓ SE NÃO MOSTRAR PLANOS) */}
                      {!flow.mostrar_planos_1 && (
                          <div className="row-inputs" style={{marginTop: '15px'}}>
                              <Input 
                                  label="Texto do Botão de Ação" 
                                  value={flow.btn_text_1}
                                  onChange={e => setFlow({...flow, btn_text_1: e.target.value})}
                              />
                              <div className="toggle-wrapper">
                                  <label>Auto-destruir após clicar?</label>
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

        {/* ============================================================ */}
        {/* SÓ MOSTRA O RESTO DO FLUXO SE O MODO FOR "PADRÃO" */}
        {/* ============================================================ */}
        {flow.start_mode === 'padrao' && (
            <>
                {/* --- LINHA CONECTORA --- */}
                <div className="connector-line"></div>
                <ArrowDown size={24} color="#444" style={{marginBottom:'5px'}} />

                {/* --- PASSOS DINÂMICOS (LISTA) --- */}
                {steps.map((step, index) => (
                  <React.Fragment key={step.id}>
                      <Card className="step-card step-card-dynamic">
                          <div className="step-badge dynamic-badge">Passo Extra {index + 1}</div>
                          <CardContent>
                              <div className="step-header">
                                  <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                      <Zap size={20} color="#fff"/>
                                      <h3>Mensagem Intermediária</h3>
                                  </div>
                                  <div style={{display:'flex', gap:'10px'}}>
                                      <button className="icon-btn edit" onClick={() => handleOpenEditModal(step)} title="Editar">
                                          <Edit size={18} color="#3b82f6"/>
                                      </button>
                                      <button className="icon-btn danger" onClick={() => handleDeleteStep(step.id)} title="Excluir">
                                          <Trash2 size={18} color="#ef4444"/>
                                      </button>
                                  </div>
                              </div>
                              
                              <p className="preview-text" style={{background:'#111', padding:'10px', borderRadius:'6px'}}>
                                  {step.msg_texto ? step.msg_texto.substring(0, 100) + (step.msg_texto.length > 100 ? '...' : '') : '(Apenas mídia)'}
                              </p>
                              
                              <div style={{marginTop: '10px', display:'flex', gap:'10px'}}>
                                  {step.mostrar_botao ? <span className="badge">🔘 Botão: {step.btn_texto}</span> : <span className="badge gray">🚫 Sem botão</span>}
                                  {step.delay_seconds > 0 && <span className="badge blue"><Clock size={12} /> {step.delay_seconds}s</span>}
                              </div>
                          </CardContent>
                      </Card>
                      <div className="connector-line"></div>
                      <ArrowDown size={24} color="#444" style={{marginBottom:'5px'}} />
                  </React.Fragment>
                ))}

                {/* --- BOTÃO ADICIONAR NOVO PASSO --- */}
                <div className="add-step-wrapper">
                  <button className="btn-add-step" onClick={handleOpenCreateModal}>
                      <Plus size={20} /> Adicionar Nova Mensagem
                  </button>
                </div>

                <div className="connector-line"></div>
                <ArrowDown size={24} color="#444" style={{marginBottom:'5px'}} />

                {/* --- PASSO FINAL: OFERTA (FIXO) --- */}
                <Card className="step-card">
                  <div className="step-badge final">Passo Final (Oferta)</div>
                  <CardContent>
                    <div className="step-header">
                      <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                          <Zap size={20} color="#10b981"/>
                          <h3>Mensagem de Oferta & Checkout</h3>
                      </div>
                    </div>

                    <div className="form-grid">
                      <RichInput 
                        label="Texto da Oferta" 
                        value={flow.msg_2_texto}
                        onChange={val => setFlow({...flow, msg_2_texto: val})}
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
                          <span className="toggle-label">{flow.mostrar_planos_2 ? 'MOSTRAR PLANOS' : 'OCULTAR'}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
            </>
        )}

      </div>

      {/* ============================================================ */}
      {/* MODAL PARA CRIAR/EDITAR PASSO (APENAS FLUXO PADRÃO) */}
      {/* ============================================================ */}
      {showModal && (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{editingStep ? 'Editar Mensagem' : 'Nova Mensagem Intermediária'}</h2>
                
                <div className="modal-body">
                    <RichInput 
                        label="Texto"
                        value={modalData.msg_texto}
                        onChange={val => setModalData({...modalData, msg_texto: val})}
                    />
                    <Input 
                        label="Mídia URL"
                        value={modalData.msg_media}
                        onChange={e => setModalData({...modalData, msg_media: e.target.value})}
                    />
                    
                    <div style={{marginTop: 15, padding: 15, background: '#111', borderRadius: 8}}>
                        <label style={{display:'flex', alignItems:'center', gap: 10, marginBottom: 10}}>
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
                                <p style={{fontSize: '0.8rem', color: '#888', marginTop: '-10px'}}>
                                    ⏱️ (0 = vai direto pro checkout)
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Toggle: Auto-destruir */}
                    <div className="toggle-wrapper" style={{marginTop: 15}}>
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