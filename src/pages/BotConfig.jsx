import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Save, ArrowLeft, MessageSquare, Key, 
  Smartphone, Layout, PlayCircle, Type, ShieldCheck, Hash, User
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { botService, miniappService } from '../services/api'; 
import Swal from 'sweetalert2';
import './Bots.css'; // O CSS Mágico está aqui

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

      // Busca Config do Mini App
      try {
        const appData = await miniappService.getPublicData(id);
        if (appData && appData.config) {
            setMiniAppConfig(prev => ({ ...prev, ...appData.config }));
        }
      } catch (e) {
        console.log("Sem config de loja ainda.");
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
      Swal.fire('Sucesso', 'Configurações gerais salvas!', 'success');
    } catch (error) {
      Swal.fire('Erro', 'Falha ao salvar.', 'error');
    }
  };

  const handleSaveMiniApp = async () => {
    try {
      await miniappService.saveConfig(id, miniAppConfig);
      Swal.fire('Sucesso', 'Loja configurada com sucesso!', 'success');
    } catch (error) {
      Swal.fire('Erro', 'Falha ao salvar loja.', 'error');
    }
  };

  const copyStoreLink = () => {
    const link = `${window.location.origin}/loja/${id}`;
    navigator.clipboard.writeText(link);
    Swal.fire({
        toast: true, position: 'top-end', title: 'Copiado!', icon: 'success',
        timer: 3000, showConfirmButton: false, background: '#151515', color: '#fff'
    });
  };

  if (loading) return <div className="loading-state">Carregando...</div>;

  return (
    <div className="bot-config-container">
      
      {/* HEADER */}
      <div className="config-header-bar">
        <div style={{display:'flex', alignItems:'center', gap: 15}}>
            <Button variant="ghost" onClick={() => navigate('/bots')}>
            <ArrowLeft size={20} />
            </Button>
            <h1>Configurar: <span className="highlight">{config.nome}</span></h1>
        </div>
      </div>

      {/* ABAS DE NAVEGAÇÃO */}
      <div className="config-tabs-wrapper">
        <button 
            className={`config-tab-btn ${activeTab === 'geral' ? 'active' : ''}`}
            onClick={() => setActiveTab('geral')}
        >
            <MessageSquare size={18} /> Geral & Chat
        </button>
        <button 
            className={`config-tab-btn ${activeTab === 'miniapp' ? 'active' : ''}`}
            onClick={() => setActiveTab('miniapp')}
        >
            <Smartphone size={18} /> Mini App / Loja
        </button>
      </div>

      <div className="config-content-area">
        {/* --- ABA GERAL --- */}
        {activeTab === 'geral' && (
            <div className="config-grid-layout">
                <Card>
                <CardContent>
                    <div className="card-header-line">
                    <Key size={20} color="#c333ff" />
                    <h3>Credenciais</h3>
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
                    <input className="input-field disabled" value={config.token} disabled />
                    </div>
                </CardContent>
                </Card>

                <Card>
                <CardContent>
                    <div className="card-header-line">
                    <ShieldCheck size={20} color="#10b981" />
                    <h3>IDs e Permissões</h3>
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
                    <label>Username Suporte (@)</label>
                    <input 
                        className="input-field" 
                        value={config.suporte_username}
                        onChange={(e) => setConfig({...config, suporte_username: e.target.value})}
                    />
                    </div>

                    <div style={{marginTop: 20}}>
                        <Button onClick={handleSaveGeral} style={{width: '100%'}}>
                            <Save size={18} style={{marginRight: 8}}/> Salvar Geral
                        </Button>
                    </div>
                </CardContent>
                </Card>
            </div>
        )}

        {/* --- ABA MINI APP --- */}
        {activeTab === 'miniapp' && (
            <div className="miniapp-layout">
                
                {/* Switcher de Modo */}
                <div className="mode-card">
                    <div className="mode-header">
                        <h3>Modo de Operação</h3>
                        <p>Defina como seu bot deve se comportar ao ser aberto.</p>
                    </div>
                    <div className="mode-options-row">
                        <div 
                            className={`mode-btn ${appMode === 'tradicional' ? 'selected' : ''}`}
                            onClick={() => setAppMode('tradicional')}
                        >
                            <MessageSquare size={24}/> <span>Chat Clássico</span>
                        </div>
                        <div 
                            className={`mode-btn ${appMode === 'miniapp' ? 'selected' : ''}`}
                            onClick={() => setAppMode('miniapp')}
                        >
                            <Smartphone size={24}/> <span>Mini App (Loja)</span>
                        </div>
                    </div>
                    
                    {appMode === 'miniapp' && (
                        <div className="link-copy-box">
                            <span>Link para Menu Button:</span>
                            <code onClick={copyStoreLink}>{window.location.origin}/loja/{id}</code>
                            <small>Clique para copiar e configurar no BotFather</small>
                        </div>
                    )}
                </div>

                <div className="config-grid-layout">
                    <Card>
                        <CardContent>
                            <div className="card-header-line"><Layout size={20}/> Aparência</div>
                            
                            <div className="form-group">
                                <label>Cor de Fundo</label>
                                <div style={{display:'flex', gap:10}}>
                                    <input type="color" 
                                        value={miniAppConfig.background_value}
                                        onChange={(e) => setMiniAppConfig({...miniAppConfig, background_value: e.target.value})}
                                        style={{height:42, width:50, padding:0, border:'none', background:'none', cursor:'pointer'}}
                                    />
                                    <input className="input-field" 
                                        value={miniAppConfig.background_value}
                                        onChange={(e) => setMiniAppConfig({...miniAppConfig, background_value: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label><Type size={16}/> Título Hero</label>
                                <input className="input-field" 
                                    value={miniAppConfig.hero_title}
                                    onChange={(e) => setMiniAppConfig({...miniAppConfig, hero_title: e.target.value})}
                                />
                            </div>

                            <div className="form-group">
                                <label>Subtítulo</label>
                                <input className="input-field" 
                                    value={miniAppConfig.hero_subtitle}
                                    onChange={(e) => setMiniAppConfig({...miniAppConfig, hero_subtitle: e.target.value})}
                                />
                            </div>

                            <div className="form-group">
                                <label><PlayCircle size={16}/> Vídeo Hero (URL)</label>
                                <input className="input-field" 
                                    value={miniAppConfig.hero_video_url}
                                    onChange={(e) => setMiniAppConfig({...miniAppConfig, hero_video_url: e.target.value})}
                                    placeholder="https://..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <div className="card-header-line"><Smartphone size={20}/> Extras</div>
                            
                            <div className="form-group checkbox-row">
                                <input type="checkbox" id="chk_popup"
                                    checked={miniAppConfig.enable_popup}
                                    onChange={(e) => setMiniAppConfig({...miniAppConfig, enable_popup: e.target.checked})}
                                />
                                <label htmlFor="chk_popup" style={{marginBottom:0, cursor:'pointer'}}>Ativar Popup Promo</label>
                            </div>

                            {miniAppConfig.enable_popup && (
                                <div className="sub-config-box">
                                    <div className="form-group">
                                        <label>Texto Popup</label>
                                        <input className="input-field" 
                                            value={miniAppConfig.popup_text}
                                            onChange={(e) => setMiniAppConfig({...miniAppConfig, popup_text: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Vídeo Popup (URL)</label>
                                        <input className="input-field" 
                                            value={miniAppConfig.popup_video_url}
                                            onChange={(e) => setMiniAppConfig({...miniAppConfig, popup_video_url: e.target.value})}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="form-group" style={{marginTop:20}}>
                                <label>Texto Rodapé</label>
                                <input className="input-field" 
                                    value={miniAppConfig.footer_text}
                                    onChange={(e) => setMiniAppConfig({...miniAppConfig, footer_text: e.target.value})}
                                />
                            </div>

                            <div style={{marginTop: 20}}>
                                <Button onClick={handleSaveMiniApp} style={{width: '100%'}}>
                                    <Save size={18} style={{marginRight: 8}}/> Salvar Loja
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}