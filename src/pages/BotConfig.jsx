import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Save, ArrowLeft, MessageSquare, Clock, Shield, Key, Power, 
  Smartphone, Layout, Image as ImageIcon, PlayCircle, Palette, Type
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { botService, miniappService } from '../services/api'; 
import Swal from 'sweetalert2';
import './Bots.css';

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

  const [welcomeMsg, setWelcomeMsg] = useState("Olá! Seja bem-vindo ao nosso atendimento.");
  const [fallbackMsg, setFallbackMsg] = useState("Não entendi. Digite /ajuda para ver as opções.");

  // --- CONFIGURAÇÃO MINI APP ---
  const [appMode, setAppMode] = useState('tradicional'); // 'tradicional' ou 'miniapp'
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
        // Se já tem config salva, assume que o usuário pode querer usar o modo MiniApp
        // (Aqui poderíamos salvar o 'modo' no banco para persistir, mas vamos deixar toggle manual por enquanto)
      }

    } catch (error) {
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
      // 1. Salva Config Visual
      await miniappService.saveConfig(id, miniAppConfig);
      
      // 2. Define modo (apenas visualmente ou salvando se tiver backend para isso)
      // await miniappService.switchMode(id, appMode);
      
      Swal.fire('Sucesso', 'Loja configurada com sucesso!', 'success');
    } catch (error) {
      Swal.fire('Erro', 'Falha ao salvar loja.', 'error');
    }
  };

  const copyStoreLink = () => {
    // Gera o link para o BotFather (Menu Button)
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
      <div className="config-header">
        <Button variant="ghost" onClick={() => navigate('/bots')}>
          <ArrowLeft size={20} /> Voltar
        </Button>
        <h1>Configurar: <span className="highlight">{config.nome}</span></h1>
      </div>

      {/* --- ABAS --- */}
      <div className="config-tabs">
        <button 
            className={`tab-btn ${activeTab === 'geral' ? 'active' : ''}`}
            onClick={() => setActiveTab('geral')}
        >
            <MessageSquare size={18} /> Geral & Chat
        </button>
        <button 
            className={`tab-btn ${activeTab === 'miniapp' ? 'active' : ''}`}
            onClick={() => setActiveTab('miniapp')}
        >
            <Smartphone size={18} /> Mini App / Loja
        </button>
      </div>

      {activeTab === 'geral' ? (
        <div className="config-grid">
            {/* ... (SEU CONTEÚDO ANTIGO DE GERAL) ... */}
            <Card>
              <CardContent>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <Key size={24} color="#c333ff" />
                  <h3 style={{ margin: 0 }}>Credenciais</h3>
                </div>
                
                <div className="form-group">
                  <label>Token do Bot (BotFather)</label>
                  <input className="input-field" value={config.token} disabled />
                </div>

                <div className="form-group">
                  <label>ID Canal VIP (-100...)</label>
                  <input 
                    className="input-field" 
                    value={config.id_canal_vip}
                    onChange={(e) => setConfig({...config, id_canal_vip: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>ID Admin Principal</label>
                  <input 
                    className="input-field" 
                    value={config.admin_principal_id}
                    onChange={(e) => setConfig({...config, admin_principal_id: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>Username do Suporte (@exemplo)</label>
                  <input 
                    className="input-field" 
                    value={config.suporte_username}
                    onChange={(e) => setConfig({...config, suporte_username: e.target.value})}
                    placeholder="@SeuUsuario"
                  />
                </div>

                <div style={{marginTop: '20px'}}>
                    <Button onClick={handleSaveGeral} style={{width: '100%'}}>
                        <Save size={18} style={{marginRight: 8}}/> Salvar Alterações
                    </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                  <MessageSquare size={24} color="#10b981" />
                  <h3 style={{ margin: 0 }}>Mensagens Padrão</h3>
                </div>
                <div className="info-box">
                    ⚠️ As mensagens de fluxo devem ser editadas no menu <b>Flow Chat</b>.
                </div>
              </CardContent>
            </Card>
        </div>
      ) : (
        /* --- ABA MINI APP --- */
        <div className="miniapp-config-wrapper">
            
            <div className="mode-switch-card">
                <h3>Modo de Operação</h3>
                <p>Escolha como seu bot vai se comportar ao abrir.</p>
                <div className="mode-options">
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
                    <div className="miniapp-link-box">
                        <span>Link do WebApp:</span>
                        <code onClick={copyStoreLink} style={{cursor:'pointer'}}>
                            {window.location.origin}/loja/{id}
                        </code>
                        <small>Clique para copiar e configurar no BotFather</small>
                    </div>
                )}
            </div>

            <div className="config-grid">
                <Card>
                    <CardContent>
                        <div className="card-title"><Layout size={20}/> Aparência da Loja</div>
                        
                        <div className="form-group">
                            <label>Cor de Fundo (Hex)</label>
                            <div style={{display:'flex', gap: 10}}>
                                <input 
                                    type="color" 
                                    value={miniAppConfig.background_value}
                                    onChange={(e) => setMiniAppConfig({...miniAppConfig, background_value: e.target.value})}
                                    style={{width: 50, height: 40, padding: 0, border: 'none', background: 'none'}}
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
                        <div className="card-title"><Layout size={20}/> Popup & Rodapé</div>
                        
                        <div className="form-group checkbox-group">
                            <label>
                                <input 
                                    type="checkbox"
                                    checked={miniAppConfig.enable_popup}
                                    onChange={(e) => setMiniAppConfig({...miniAppConfig, enable_popup: e.target.checked})}
                                />
                                Ativar Popup Promocional (3s)
                            </label>
                        </div>

                        {miniAppConfig.enable_popup && (
                            <>
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
                            </>
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