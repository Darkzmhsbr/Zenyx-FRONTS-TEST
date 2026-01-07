import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Save, MessageSquare, ArrowDown, Zap, Image as ImageIcon, Video } from 'lucide-react';
import { flowService } from '../services/api'; // Não precisa mais do botService aqui
import { useBot } from '../context/BotContext'; // <--- Contexto Global
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { Input } from '../components/Input';
import { TextArea } from '../components/TextArea';
import './ChatFlow.css';

export function ChatFlow() {
  const { selectedBot } = useBot(); // <--- Pega o bot do contexto
  const [loading, setLoading] = useState(false);
  
  const [flow, setFlow] = useState({
    msg_boas_vindas: '',
    media_url: '',
    btn_text_1: '',
    autodestruir_1: false,
    msg_2_texto: '',
    msg_2_media: '',
    mostrar_planos_2: true
  });

  // Carrega Fluxo AUTOMATICAMENTE quando o bot muda lá em cima
  useEffect(() => {
    if (selectedBot) {
      setLoading(true);
      flowService.getFlow(selectedBot.id).then(data => {
          setFlow({
            msg_boas_vindas: data.msg_boas_vindas || '',
            media_url: data.media_url || '',
            btn_text_1: data.btn_text_1 || '🔓 DESBLOQUEAR ACESSO',
            autodestruir_1: data.autodestruir_1 || false,
            msg_2_texto: data.msg_2_texto || '',
            msg_2_media: data.msg_2_media || '',
            mostrar_planos_2: data.mostrar_planos_2 !== false 
          });
          setLoading(false);
      });
    }
  }, [selectedBot]);

  // Salvar
  const handleSave = async () => {
    if (!selectedBot) return Swal.fire('Erro', 'Selecione um bot no menu superior!', 'warning');
    
    try {
      await flowService.saveFlow(selectedBot.id, flow);
      Swal.fire({
        title: 'Salvo!',
        text: `Fluxo do bot "${selectedBot.nome}" atualizado com sucesso.`,
        icon: 'success',
        background: '#1b1730',
        color: '#fff'
      });
    } catch (error) {
      Swal.fire('Erro', 'Falha ao salvar fluxo.', 'error');
    }
  };

  return (
    <div className="chatflow-container">
      
      <div className="page-header">
        <div>
          <h1>Fluxo de Conversa (Funil)</h1>
          <p>
            Configurando: <span style={{color: '#c333ff', fontWeight: 'bold'}}>{selectedBot ? selectedBot.nome : "..."}</span>
          </p>
        </div>
        <Button onClick={handleSave} disabled={!selectedBot || loading}>
          <Save size={18} /> {loading ? 'Carregando...' : 'Salvar Alterações'}
        </Button>
      </div>

      {/* Se tiver bot selecionado, mostra o fluxo. Se não, avisa. */}
      {selectedBot ? (
        <div className="flow-steps">
          
          {/* --- PASSO 1: BOAS VINDAS --- */}
          <Card className="flow-card step-card">
            <div className="step-badge">PASSO 1</div>
            <CardContent>
              <div className="step-header">
                <MessageSquare size={24} />
                <h3>Boas-vindas & Impacto</h3>
              </div>

              <div className="form-grid">
                <Input 
                  label="Link da Mídia (Foto ou Vídeo)" 
                  placeholder="Ex: https://.../imagem.jpg ou https://.../video.mp4" 
                  value={flow.media_url}
                  onChange={e => setFlow({...flow, media_url: e.target.value})}
                  icon={<ImageIcon size={16}/>}
                  helper="Suporta JPG, PNG, MP4, MOV, AVI."
                />
                
                <TextArea 
                  label="Legenda / Mensagem de Texto" 
                  value={flow.msg_boas_vindas}
                  onChange={e => setFlow({...flow, msg_boas_vindas: e.target.value})}
                />

                <div className="row-inputs">
                  <Input 
                    label="Texto do Botão" 
                    value={flow.btn_text_1}
                    onChange={e => setFlow({...flow, btn_text_1: e.target.value})}
                  />
                  
                  {/* Toggle Customizado */}
                  <div className="toggle-wrapper">
                    <label>Autodestruir mensagem ao clicar?</label>
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

          {/* Seta de Conexão Visual */}
          <div className="flow-connector">
            <ArrowDown size={32} />
          </div>

          {/* --- PASSO 2: OFERTA --- */}
          <Card className="flow-card step-card">
            <div className="step-badge badge-green">PASSO 2</div>
            <CardContent>
              <div className="step-header">
                <Zap size={24} color="#10b981" />
                <h3>Oferta & Checkout</h3>
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

    </div>
  );
}