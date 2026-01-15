import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Save, MessageSquare, ArrowDown, Zap, Image as ImageIcon, Video, Plus, Trash2, Edit, Clock } from 'lucide-react';
import { flowService } from '../services/api'; 
import { useBot } from '../context/BotContext'; 
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { Input } from '../components/Input';
import { TextArea } from '../components/TextArea';
import './ChatFlow.css';

export function ChatFlow() {
  const { selectedBot } = useBot(); 
  const [loading, setLoading] = useState(false);
  
  // Estado do Fluxo Fixo (Passo 1 e Final)
  const [flow, setFlow] = useState({
    msg_boas_vindas: '',
    media_url: '',
    btn_text_1: '',
    autodestruir_1: false,
    msg_2_texto: '',
    msg_2_media: '',
    mostrar_planos_2: true,
    mostrar_planos_1: false // [NOVO] Opção para mostrar planos no passo 1
  });

  // Estado dos Passos Dinâmicos (Lista)
  const [steps, setSteps] = useState([]);
  
  // Estado do Modal
  const [showModal, setShowModal] = useState(false);
  const [editingStep, setEditingStep] = useState(null); // null = criando novo, número = editando
  const [modalData, setModalData] = useState({
    msg_texto: '',
    msg_media: '',
    btn_texto: 'Próximo ▶️',
    autodestruir: false,
    mostrar_botao: true,
    delay_seconds: 0  // [NOVO V4]
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
        setFlow({
            msg_boas_vindas: flowData.msg_boas_vindas || '',
            media_url: flowData.media_url || '',
            btn_text_1: flowData.btn_text_1 || '🔓 DESBLOQUEAR ACESSO',
            autodestruir_1: flowData.autodestruir_1 || false,
            msg_2_texto: flowData.msg_2_texto || '',
            msg_2_media: flowData.msg_2_media || '',
            mostrar_planos_2: flowData.mostrar_planos_2 !== false,
            mostrar_planos_1: flowData.mostrar_planos_1 || false // Carrega do backend
        });

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
      delay_seconds: 0  // [NOVO V4]
    });
    setShowModal(true);
  };

  // Abre modal para EDITAR passo existente
  const handleOpenEditModal = (step) => {
    setEditingStep(step.id);
    setModalData({
      msg_texto: step.msg_texto || '',
      msg_media: step.msg_media || '',
      btn_texto: step.btn_texto || 'Próximo ▶️',
      autodestruir: step.autodestruir || false,
      mostrar_botao: step.mostrar_botao !== false,
      delay_seconds: step.delay_seconds || 0  // [NOVO V4]
    });
    setShowModal(true);
  };

  // Salva o passo (Criar OU Editar)
  const handleSaveStep = async () => {
    if (!modalData.msg_texto) {
      return Swal.fire('Atenção', 'Escreva uma mensagem!', 'warning');
    }
    
    try {
        if (editingStep) {
            // EDITANDO passo existente
            await flowService.updateStep(selectedBot.id, editingStep, modalData);
            Swal.fire({ 
                icon: 'success', 
                title: 'Passo Atualizado!', 
                timer: 1500, 
                showConfirmButton: false, 
                background: '#151515', 
                color: '#fff' 
            });
        } else {
            // CRIANDO passo novo
            await flowService.addStep(selectedBot.id, {
                ...modalData,
                step_order: steps.length + 1
            });
            Swal.fire({ 
                icon: 'success', 
                title: 'Passo Adicionado!', 
                timer: 1500, 
                showConfirmButton: false, 
                background: '#151515', 
                color: '#fff' 
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

  return (
    <div className="chatflow-container">
      
      <div className="page-header">
        <div>
          <h1>Flow Chat V4.0</h1>
          <p style={{color: 'var(--muted-foreground)'}}>Configure a sequência de mensagens do seu bot.</p>
        </div>
        <Button onClick={handleSaveFixed} disabled={loading}>
          <Save size={20} /> Salvar Alterações
        </Button>
      </div>

      {selectedBot ? (
        <div className="flow-steps">
          
          {/* --- PASSO 1: BOAS VINDAS (FIXO) --- */}
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
                <Input 
                  label="Link da Mídia (Foto ou Vídeo) - Opcional" 
                  placeholder="Ex: https://..." 
                  value={flow.media_url}
                  onChange={e => setFlow({...flow, media_url: e.target.value})}
                  icon={<ImageIcon size={16}/>}
                />
                
                <TextArea 
                  label="Texto da Mensagem" 
                  value={flow.msg_boas_vindas}
                  onChange={e => setFlow({...flow, msg_boas_vindas: e.target.value})}
                />

                {/* --- [NOVO] OPÇÃO DE MOSTRAR PLANOS AQUI --- */}
                <div className="toggle-wrapper full-width">
                  <label>Mostrar botões de Planos (Checkout) nesta mensagem?</label>
                  <div 
                    className={`custom-toggle ${flow.mostrar_planos_1 ? 'active-green' : ''}`}
                    onClick={() => setFlow({...flow, mostrar_planos_1: !flow.mostrar_planos_1})}
                  >
                    <div className="toggle-handle"></div>
                    <span className="toggle-label">{flow.mostrar_planos_1 ? 'MOSTRAR PLANOS (ENCERRA FLUXO)' : 'NÃO (CONTINUA FLUXO)'}</span>
                  </div>
                  {flow.mostrar_planos_1 && (
                    <p style={{fontSize: '0.8rem', color: '#10b981', marginTop: '5px'}}>
                      ⚠️ Se ativado, o fluxo acaba aqui e a última mensagem (Passo Final) não será enviada.
                    </p>
                  )}
                </div>

                {/* Só mostra configurações do botão de desbloqueio se NÃO estiver mostrando planos */}
                {!flow.mostrar_planos_1 && (
                    <div className="row-inputs">
                        <Input 
                            label="Texto do Botão" 
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
            </CardContent>
          </Card>

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
                                {/* Botão de Editar */}
                                <button 
                                    className="icon-btn edit" 
                                    onClick={() => handleOpenEditModal(step)}
                                    title="Editar mensagem"
                                >
                                    <Edit size={18} color="#3b82f6"/>
                                </button>
                                <button 
                                    className="icon-btn danger" 
                                    onClick={() => handleDeleteStep(step.id)}
                                    title="Excluir mensagem"
                                >
                                    <Trash2 size={18} color="#ef4444"/>
                                </button>
                            </div>
                        </div>
                        
                        <div style={{color: '#ccc', fontSize: '0.9rem', marginBottom: '10px'}}>
                            {step.msg_media && <div style={{marginBottom:5}}>🎥 <i>Contém mídia</i></div>}
                            <div style={{background: '#111', padding: '10px', borderRadius: '6px', border: '1px solid #333'}}>
                                "{step.msg_texto}"
                            </div>
                            <div style={{marginTop: '10px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'10px'}}>
                                {step.mostrar_botao ? (
                                    <span className="badge">🔘 Botão: {step.btn_texto}</span>
                                ) : (
                                    <span className="badge gray">🚫 Sem botão</span>
                                )}
                                
                                {step.autodestruir && (
                                    <span className="badge red">💣 Auto-destruir</span>
                                )}

                                {/* [NOVO V4] Badge de delay */}
                                {step.delay_seconds > 0 && (
                                    <span className="badge blue">
                                        <Clock size={12} style={{marginRight: '4px'}} />
                                        {step.delay_seconds}s
                                    </span>
                                )}
                            </div>
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

          {/* --- LINHA CONECTORA FINAL --- */}
          <div className="connector-line"></div>
          <ArrowDown size={24} color="#444" style={{marginBottom:'5px'}} />

          {/* --- PASSO FINAL: OFERTA (FIXO) --- */}
          <Card className="step-card">
            <div className="step-badge final">Passo Final (Oferta)</div>
            <CardContent>
              <div className="step-header">
                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                    <Zap size={20} color="#10b981"/>
                    <h3>Oferta & Checkout</h3>
                </div>
              </div>

              <div className="form-grid">
                <Input 
                  label="Mídia da Oferta (Foto ou Vídeo)" 
                  placeholder="Ex: https://.../video-oferta.mp4" 
                  value={flow.msg_2_media}
                  onChange={e => setFlow({...flow, msg_2_media: e.target.value})}
                  icon={<Video size={16}/>}
                />
                
                <TextArea 
                  label="Texto da Oferta" 
                  value={flow.msg_2_texto}
                  onChange={e => setFlow({...flow, msg_2_texto: e.target.value})}
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

        </div>
      ) : (
        <div className="empty-state">
          <p>👈 Selecione um bot no topo da tela para carregar o funil.</p>
        </div>
      )}

      {/* ============================================================ */}
      {/* 🔥 [ATUALIZADO V4] MODAL PARA CRIAR/EDITAR PASSO */}
      {/* ============================================================ */}
      {showModal && (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{editingStep ? 'Editar Mensagem' : 'Nova Mensagem Intermediária'}</h2>
                
                <div className="form-grid">
                    <Input 
                        label="Link da Mídia (Opcional)" 
                        placeholder="URL da imagem ou vídeo"
                        value={modalData.msg_media}
                        onChange={e => setModalData({...modalData, msg_media: e.target.value})}
                    />
                    <TextArea 
                        label="Texto da Mensagem" 
                        placeholder="Digite o conteúdo aqui..."
                        value={modalData.msg_texto}
                        onChange={e => setModalData({...modalData, msg_texto: e.target.value})}
                    />
                    
                    {/* Toggle: Mostrar Botão */}
                    <div className="toggle-wrapper">
                        <label>Mostrar botão para próximo passo?</label>
                        <div 
                            className={`custom-toggle ${modalData.mostrar_botao ? 'active-green' : ''}`}
                            onClick={() => setModalData({...modalData, mostrar_botao: !modalData.mostrar_botao})}
                        >
                            <div className="toggle-handle"></div>
                            <span className="toggle-label">{modalData.mostrar_botao ? 'SIM' : 'NÃO'}</span>
                        </div>
                    </div>

                    {/* Campo de texto do botão (só aparece se mostrar_botao = true) */}
                    {modalData.mostrar_botao && (
                        <Input 
                            label="Texto do Botão" 
                            value={modalData.btn_texto}
                            onChange={e => setModalData({...modalData, btn_texto: e.target.value})}
                        />
                    )}

                    {/* Toggle: Auto-destruir */}
                    <div className="toggle-wrapper">
                        <label>Auto-destruir após clicar no botão?</label>
                        <div 
                            className={`custom-toggle ${modalData.autodestruir ? 'active' : ''}`}
                            onClick={() => setModalData({...modalData, autodestruir: !modalData.autodestruir})}
                        >
                            <div className="toggle-handle"></div>
                            <span className="toggle-label">{modalData.autodestruir ? 'SIM' : 'NÃO'}</span>
                        </div>
                    </div>

                    {/* [NOVO V4] Input: Delay em segundos */}
                    {!modalData.mostrar_botao && (
                        <div className="delay-input-wrapper">
                            <Input 
                                label="Intervalo para próxima mensagem (segundos)"
                                type="number"
                                min="0"
                                max="30"
                                placeholder="Ex: 3"
                                value={modalData.delay_seconds}
                                onChange={e => setModalData({
                                    ...modalData, 
                                    delay_seconds: parseInt(e.target.value) || 0
                                })}
                                icon={<Clock size={16}/>}
                            />
                            <p style={{fontSize: '0.8rem', color: '#888', marginTop: '-10px'}}>
                                ⏱️ Se não houver botão, aguarda esse tempo antes de enviar a próxima mensagem. 
                                (0 = vai direto pro checkout)
                            </p>
                        </div>
                    )}
                </div>

                <div className="modal-actions">
                    <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
                    <button className="btn-save" onClick={handleSaveStep}>
                        {editingStep ? 'Salvar Alterações' : 'Adicionar ao Fluxo'}
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}