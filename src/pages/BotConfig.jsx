import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Save, ArrowLeft, MessageSquare, Key, 
  Smartphone, Layout, PlayCircle, Type, Hash, User, ShieldCheck
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { botService, miniappService } from '../services/api'; 
import Swal from 'sweetalert2';
import './Bots.css'; // Certifique-se de atualizar este CSS no passo 2

export function BotConfig() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('geral'); // 'geral' ou 'miniapp'
  
  // --- CONFIGURAÇÃO GERAL ---
  const [config, setConfig] = useState({
    nome: '',
    token: '',
    id_canal_vip: '',
    admin_principal_id: '',
    suporte_username: '',
    status: 'desconectado'
  });

  // --- CONFIGURAÇÃO MINI APP ---
  const [appMode, setAppMode] = useState('tradicional');
  const [miniAppConfig, setMiniAppConfig] = useState({
    hero_title: 'ACERVO PREMIUM',
    hero_subtitle: 'O maior acervo da internet.',
    hero_btn_text: 'LIBERAR CONTEÚDO 🔓',
    hero_video_url: '',
    background_value: '#000000',
    background_type: 'solid',
    enable_popup: false,
    popup_text: 'VOCÊ GANHOU UM PRESENTE!',
    popup_video_url: '',
    footer_text: '© 2026 Premium Club.'
  });

  useEffect(() => {
    carregarDados();
  }, [id]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      // 1. Busca Bot
      const bots = await botService.listBots();
      const botAtual = bots.find(b => b.id.toString() === id);
      
      if (botAtual) {
        setConfig({
          nome: botAtual.nome || '',
          token: botAtual.token || '',
          id_canal_vip: botAtual.id_canal_vip || '',
          admin_principal_id: botAtual.admin_principal_id || '',
          suporte_username: botAtual.suporte_username || '',
          status: botAtual.status || 'ativo'
        });
      }

      // 2. Busca Config do Mini App
      const appData = await miniappService.getPublicData(id);
      if (appData && appData.config) {
        setMiniAppConfig(prev => ({ ...prev, ...appData.config }));
      }

    } catch (error) {
      console.error(error);
      Swal.fire('Erro', 'Falha ao carregar configurações', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGeral = async () => {
    try {
      await botService.updateBot(id, config);
      Swal.fire({
        title: 'Sucesso', text: 'Configurações gerais salvas!', icon: 'success',
        background: '#151515', color: '#fff'
      });
    } catch (error) {
      Swal.fire('Erro', 'Falha ao salvar.', 'error');
    }
  };

  const handleSaveMiniApp = async () => {
    try {
      await miniappService.saveConfig(id, miniAppConfig);
      Swal.fire({
        title: 'Sucesso', text: 'Loja configurada com sucesso!', icon: 'success',
        background: '#151515', color: '#fff'
      });
    } catch (error) {
      Swal.fire('Erro', 'Falha ao salvar loja.', 'error');
    }
  };

  const copyStoreLink = () => {
    const link = `${window.location.origin}/loja/${id}`;
    navigator.clipboard.writeText(link);
    Swal.fire({
        title: 'Link Copiado!',
        text: 'Use este link no BotFather > My Bots > Bot Settings > Menu Button > Configure Menu Button',
        icon: 'success',
        background: '#151515', color: '#fff'
    });
  };

  if (loading) return <div className="loading-state">Carregando...</div>;

  return (
    <div className="bot-config-container">
      
      {/* HEADER */}
      <div className="config-header-bar">
        <Button variant="ghost" onClick={() => navigate('/bots')}>
          <ArrowLeft size={20} /> Voltar
        </Button>
        <h1>Configurar: <span className="highlight">{config.nome}</span></h1>
      </div>

      {/* ABAS DE NAVEGAÇÃO */}
      <div className="config-tabs-container">
        <button 
            className={`tab-item ${activeTab === 'geral' ? 'active' : ''}`}
            onClick={() => setActiveTab('geral')}
        >
            <MessageSquare size={18} /> Geral & Chat
        </button>
        <button 
            className={`tab-item ${activeTab === 'miniapp' ? 'active' : ''}`}
            onClick={() => setActiveTab('miniapp')}
        >
            <Smartphone size={18} /> Mini App / Loja
        </button>
      </div>

      {/* CONTEÚDO: GERAL */}
      {activeTab === 'geral' && (
        <div className="tab-content-grid">
            <Card>
              <CardContent>
                <div className="card-section-title">
                  <Key size={20} color="#c333ff" />
                  <h3>Credenciais do Bot</h3>
                </div>
                
                <div className="form-group">
                  <label>Nome do Bot</label>
                  <input 
                    className="input-field" 
                    value={config.nome}
                    onChange={(e) => setConfig({...config, nome: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Token (BotFather)</label>
                  <div className="token-box">
                    <input className="input-field" value={config.token} disabled />
                    <small>Para alterar o token, crie um novo bot.</small>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="card-section-title">
                  <ShieldCheck size={20} color="#10b981" />
                  <h3>Permissões e IDs</h3>
                </div>

                <div className="form-group">
                  <label><Hash size={14}/> ID do Canal VIP</label>
                  <input 
                    className="input-field" 
                    value={config.id_canal_vip}
                    onChange={(e) => setConfig({...config, id_canal_vip: e.target.value})}
                    placeholder="-100..."
                  />
                </div>

                <div className="form-group">
                  <label><User size={14}/> ID Admin Principal</label>
                  <input 
                    className="input-field" 
                    value={config.admin_principal_id}
                    onChange={(e) => setConfig({...config, admin_principal_id: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>Username do Suporte (@)</label>
                  <input 
                    className="input-field" 
                    value={config.suporte_username}
                    onChange={(e) => setConfig({...config, suporte_username: e.target.value})}
                    placeholder="@SeuUsuario"
                  />
                </div>

                <div style={{marginTop: '20px'}}>
                    <Button onClick={handleSaveGeral} style={{width: '100%'}}>
                        <Save size={18} style={{marginRight: 8}}/> Salvar Configurações
                    </Button>
                </div>
              </CardContent>
            </Card>
        </div>
      )}

      {/* CONTEÚDO: MINI APP */}
      {activeTab === 'miniapp' && (
        <div className="miniapp-wrapper">
            
            {/* SWITCH DE MODO */}
            <div className="mode-switch-box">
                <div className="mode-header">
                    <h3>Modo de Operação</h3>
                    <p>Escolha como o cliente interage com seu bot.</p>
                </div>
                <div className="mode-selector">
                    <div 
                        className={`mode-option ${appMode === 'tradicional' ? 'selected' : ''}`}
                        onClick={() => setAppMode('tradicional')}
                    >
                        <MessageSquare size={24} />
                        <span>Chat Clássico</span>
                    </div>
                    <div 
                        className={`mode-option ${appMode === 'miniapp' ? 'selected' : ''}`}
                        onClick={() => setAppMode('miniapp')}
                    >
                        <Smartphone size={24} />
                        <span>Mini App (Loja)</span>
                    </div>
                </div>
                
                {appMode === 'miniapp' && (
                    <div className="link-generator-box">
                        <span>Link para Menu Button:</span>
                        <code onClick={copyStoreLink} title="Clique para copiar">
                            {window.location.origin}/loja/{id}
                        </code>
                        <small>Copie e cole no BotFather para ativar o botão de menu.</small>
                    </div>
                )}
            </div>

            <div className="tab-content-grid">
                <Card>
                    <CardContent>
                        <div className="card-section-title"><Layout size={20}/> Aparência da Loja</div>
                        
                        <div className="form-group">
                            <label>Cor de Fundo (Hex)</label>
                            <div className="color-picker-wrapper">
                                <input 
                                    type="color" 
                                    value={miniAppConfig.background_value}
                                    onChange={(e) => setMiniAppConfig({...miniAppConfig, background_value: e.target.value})}
                                />
                                <input 
                                    className="input-field"
                                    value={miniAppConfig.background_value}
                                    onChange={(e) => setMiniAppConfig({...miniAppConfig, background_value: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label><Type size={16}/> Título Principal (Hero)</label>
                            <input 
                                className="input-field"
                                value={miniAppConfig.hero_title}
                                onChange={(e) => setMiniAppConfig({...miniAppConfig, hero_title: e.target.value})}
                            />
                        </div>

                        <div className="form-group">
                            <label>Subtítulo</label>
                            <input 
                                className="input-field"
                                value={miniAppConfig.hero_subtitle}
                                onChange={(e) => setMiniAppConfig({...miniAppConfig, hero_subtitle: e.target.value})}
                            />
                        </div>

                        <div className="form-group">
                            <label><PlayCircle size={16}/> Vídeo de Fundo (URL .mp4)</label>
                            <input 
                                className="input-field"
                                value={miniAppConfig.hero_video_url}
                                onChange={(e) => setMiniAppConfig({...miniAppConfig, hero_video_url: e.target.value})}
                                placeholder="https://..."
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <div className="card-section-title"><Smartphone size={20}/> Popup & Rodapé</div>
                        
                        <div className="form-group checkbox-wrapper">
                            <input 
                                type="checkbox"
                                id="chk_popup"
                                checked={miniAppConfig.enable_popup}
                                onChange={(e) => setMiniAppConfig({...miniAppConfig, enable_popup: e.target.checked})}
                            />
                            <label htmlFor="chk_popup">Ativar Popup Promocional (3s)</label>
                        </div>

                        {miniAppConfig.enable_popup && (
                            <div className="popup-config-area">
                                <div className="form-group">
                                    <label>Texto do Popup</label>
                                    <input 
                                        className="input-field"
                                        value={miniAppConfig.popup_text}
                                        onChange={(e) => setMiniAppConfig({...miniAppConfig, popup_text: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Vídeo do Popup (URL)</label>
                                    <input 
                                        className="input-field"
                                        value={miniAppConfig.popup_video_url}
                                        onChange={(e) => setMiniAppConfig({...miniAppConfig, popup_video_url: e.target.value})}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="form-group" style={{marginTop: 20}}>
                            <label>Texto do Rodapé</label>
                            <input 
                                className="input-field"
                                value={miniAppConfig.footer_text}
                                onChange={(e) => setMiniAppConfig({...miniAppConfig, footer_text: e.target.value})}
                            />
                        </div>

                        <Button onClick={handleSaveMiniApp} style={{width: '100%', marginTop: 20}}>
                            <Save size={18} style={{marginRight: 8}}/> Salvar Loja
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
      )}
    </div>
  );
}