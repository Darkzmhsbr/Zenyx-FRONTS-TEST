import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Save, MessageSquare, ArrowDown, Zap, Image as ImageIcon, Video, Plus, Trash2, X } from 'lucide-react';
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
    mostrar_planos_2: true
  });

  // Estado dos Passos Dinâmicos (Lista)
  const [steps, setSteps] = useState([]);
  
  // Estado do Modal de Novo Passo
  const [showModal, setShowModal] = useState(false);
  const [newStep, setNewStep] = useState({
    msg_texto: '',
    msg_media: '',
    btn_texto: 'Próximo ▶️'
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
            mostrar_planos_2: flowData.mostrar_planos_2 !== false // Default true
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

  // Adiciona novo passo dinâmico
  const handleAddStep = async () => {
    if (!newStep.msg_texto) return Swal.fire('Atenção', 'Escreva uma mensagem!', 'warning');
    
    try {
        await flowService.addStep(selectedBot.id, {
            ...newStep,
            step_order: steps.length + 1 // Ordem sequencial
        });
        setShowModal(false);
        setNewStep({ msg_texto: '', msg_media: '', btn_texto: 'Próximo ▶️' }); // Reseta
        carregarTudo(); // Recarrega lista
        Swal.fire({ icon: 'success', title: 'Passo Adicionado!', timer: 1500, showConfirmButton: false, background: '#151515', color: '#fff' });
    } catch (error) {
        Swal.fire('Erro', 'Falha ao adicionar passo.', 'error');
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
        background: '#151515', color: '#fff'
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
          <h1>Flow Chat V2.0</h1>
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
                            <button className="icon-btn danger" onClick={() => handleDeleteStep(step.id)}>
                                <Trash2 size={18} color="#ef4444"/>
                            </button>
                        </div>
                        
                        <div style={{color: '#ccc', fontSize: '0.9rem', marginBottom: '10px'}}>
                            {step.msg_media && <div style={{marginBottom:5}}>🎥 <i>Contém mídia</i></div>}
                            <div style={{background: '#111', padding: '10px', borderRadius: '6px', border: '1px solid #333'}}>
                                "{step.msg_texto}"
                            </div>
                            <div style={{marginTop: '10px', textAlign: 'right'}}>
                                <span className="badge">Botão: {step.btn_texto}</span>
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
            <button className="btn-add-step" onClick={() => setShowModal(true)}>
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

      {/* --- MODAL PARA ADICIONAR PASSO --- */}
      {showModal && (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Nova Mensagem Intermediária</h2>
                
                <div className="form-grid">
                    <Input 
                        label="Link da Mídia (Opcional)" 
                        placeholder="URL da imagem ou vídeo"
                        value={newStep.msg_media}
                        onChange={e => setNewStep({...newStep, msg_media: e.target.value})}
                    />
                    <TextArea 
                        label="Texto da Mensagem" 
                        placeholder="Digite o conteúdo aqui..."
                        value={newStep.msg_texto}
                        onChange={e => setNewStep({...newStep, msg_texto: e.target.value})}
                    />
                    <Input 
                        label="Texto do Botão (Para ir ao próximo)" 
                        value={newStep.btn_texto}
                        onChange={e => setNewStep({...newStep, btn_texto: e.target.value})}
                    />
                </div>

                <div className="modal-actions">
                    <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
                    <button className="btn-save" onClick={handleAddStep}>Adicionar ao Fluxo</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}
