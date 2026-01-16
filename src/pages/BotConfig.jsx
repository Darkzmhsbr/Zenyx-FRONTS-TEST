import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Save, ArrowLeft, MessageSquare, Key, 
  Smartphone, Layout, PlayCircle, Type, Plus, Trash2, Edit, Image as ImageIcon, Link
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

  // --- CATEGORIAS ---
  const [categories, setCategories] = useState([]);
  const [isEditingCat, setIsEditingCat] = useState(false);
  const [currentCat, setCurrentCat] = useState(null); // Dados da categoria sendo editada

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

      // 2. Busca Dados da Loja
      try {
        const appData = await miniappService.getPublicData(id);
        if (appData) {
            if (appData.config) setMiniAppConfig(prev => ({ ...prev, ...appData.config }));
            if (appData.categories) setCategories(appData.categories);
        }
      } catch (e) { console.log("Loja ainda não configurada."); }

    } catch (error) {
      console.error(error);
      Swal.fire('Erro', 'Falha ao carregar configurações', 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- SALVAR GERAL ---
  const handleSaveGeral = async () => {
    try {
      await botService.updateBot(id, config);
      Swal.fire('Sucesso', 'Configurações gerais salvas!', 'success');
    } catch (error) {
      Swal.fire('Erro', 'Falha ao salvar.', 'error');
    }
  };

  // --- SALVAR LOJA ---
  const handleSaveMiniApp = async () => {
    try {
      await miniappService.saveConfig(id, miniAppConfig);
      Swal.fire('Sucesso', 'Loja configurada com sucesso!', 'success');
    } catch (error) {
      Swal.fire('Erro', 'Falha ao salvar loja.', 'error');
    }
  };

  // --- CATEGORIAS: EDITAR/CRIAR ---
  const openNewCategory = () => {
      setCurrentCat({
          bot_id: id,
          title: '',
          description: '',
          cover_image: '',
          banner_mob_url: '',
          theme_color: '#c333ff',
          is_direct_checkout: false,
          content_json: '[]' // Inicialmente vazio
      });
      setIsEditingCat(true);
  };

  const handleSaveCategory = async () => {
      if (!currentCat.title) return Swal.fire('Erro', 'Digite um título', 'warning');

      try {
          await miniappService.createCategory({ ...currentCat, bot_id: id });
          setIsEditingCat(false);
          setCurrentCat(null);
          // Recarrega lista
          const appData = await miniappService.getPublicData(id);
          setCategories(appData.categories || []);
          Swal.fire('Sucesso', 'Categoria salva!', 'success');
      } catch (error) {
          Swal.fire('Erro', 'Erro ao salvar categoria', 'error');
      }
  };

  const handleDeleteCategory = async (catId) => {
      if (!window.confirm("Tem certeza que deseja excluir esta categoria?")) return;
      try {
          await miniappService.deleteCategory(catId);
          setCategories(prev => prev.filter(c => c.id !== catId));
      } catch (error) {
          Swal.fire('Erro', 'Erro ao excluir', 'error');
      }
  };

  const copyStoreLink = () => {
    const link = `${window.location.origin}/loja/${id}`;
    navigator.clipboard.writeText(link);
    Swal.fire({
        toast: true, position: 'top', title: 'Link Copiado!', icon: 'success',
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

      {/* ABAS */}
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
                    <div className="card-header-line"><Key size={20} color="#c333ff" /><h3>Credenciais</h3></div>
                    <div className="form-group">
                        <label>Nome do Bot</label>
                        <input className="input-field" value={config.nome} onChange={(e) => setConfig({...config, nome: e.target.value})} />
                    </div>
                    <div className="form-group">
                        <label>Token (BotFather)</label>
                        <input className="input-field disabled" value={config.token} disabled />
                    </div>
                </CardContent>
                </Card>

                <Card>
                <CardContent>
                    <div className="card-header-line"><Key size={20} color="#10b981" /><h3>IDs</h3></div>
                    <div className="form-group">
                        <label>ID Canal VIP</label>
                        <input className="input-field" value={config.id_canal_vip} onChange={(e) => setConfig({...config, id_canal_vip: e.target.value})} placeholder="-100..." />
                    </div>
                    <div className="form-group">
                        <label>ID Admin</label>
                        <input className="input-field" value={config.admin_principal_id} onChange={(e) => setConfig({...config, admin_principal_id: e.target.value})} />
                    </div>
                    <div style={{marginTop: 20}}>
                        <Button onClick={handleSaveGeral} style={{width: '100%'}}><Save size={18} style={{marginRight: 8}}/> Salvar Geral</Button>
                    </div>
                </CardContent>
                </Card>
            </div>
        )}

        {/* --- ABA MINI APP --- */}
        {activeTab === 'miniapp' && (
            <div className="miniapp-layout">
                
                {/* 1. CONFIGURAÇÃO VISUAL */}
                <div className="config-grid-layout" style={{marginBottom: 30}}>
                    <Card>
                        <CardContent>
                            <div className="card-header-line"><Layout size={20}/> Aparência da Home</div>
                            <div className="form-group">
                                <label>Cor de Fundo</label>
                                <div style={{display:'flex', gap:10}}>
                                    <input type="color" value={miniAppConfig.background_value} onChange={(e) => setMiniAppConfig({...miniAppConfig, background_value: e.target.value})} style={{height:42, width:50, padding:0, border:'none', background:'none', cursor:'pointer'}} />
                                    <input className="input-field" value={miniAppConfig.background_value} onChange={(e) => setMiniAppConfig({...miniAppConfig, background_value: e.target.value})} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label><Type size={16}/> Título Hero</label>
                                <input className="input-field" value={miniAppConfig.hero_title} onChange={(e) => setMiniAppConfig({...miniAppConfig, hero_title: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Subtítulo</label>
                                <input className="input-field" value={miniAppConfig.hero_subtitle} onChange={(e) => setMiniAppConfig({...miniAppConfig, hero_subtitle: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label><PlayCircle size={16}/> Vídeo Hero (URL .mp4)</label>
                                <input className="input-field" value={miniAppConfig.hero_video_url} onChange={(e) => setMiniAppConfig({...miniAppConfig, hero_video_url: e.target.value})} placeholder="https://..." />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <div className="card-header-line"><Smartphone size={20}/> Extras</div>
                            <div className="form-group checkbox-row">
                                <input type="checkbox" id="chk_popup" checked={miniAppConfig.enable_popup} onChange={(e) => setMiniAppConfig({...miniAppConfig, enable_popup: e.target.checked})} />
                                <label htmlFor="chk_popup" style={{marginBottom:0, cursor:'pointer'}}>Ativar Popup Promo</label>
                            </div>
                            {miniAppConfig.enable_popup && (
                                <div className="sub-config-box">
                                    <div className="form-group"><label>Texto Popup</label><input className="input-field" value={miniAppConfig.popup_text} onChange={(e) => setMiniAppConfig({...miniAppConfig, popup_text: e.target.value})} /></div>
                                    <div className="form-group"><label>Vídeo Popup</label><input className="input-field" value={miniAppConfig.popup_video_url} onChange={(e) => setMiniAppConfig({...miniAppConfig, popup_video_url: e.target.value})} /></div>
                                </div>
                            )}
                            <div className="form-group" style={{marginTop:20}}><label>Rodapé</label><input className="input-field" value={miniAppConfig.footer_text} onChange={(e) => setMiniAppConfig({...miniAppConfig, footer_text: e.target.value})} /></div>
                            <div style={{marginTop: 20}}>
                                <Button onClick={handleSaveMiniApp} style={{width: '100%'}}><Save size={18} style={{marginRight: 8}}/> Salvar Aparência</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 2. GESTÃO DE CATEGORIAS (NOVO!!!) */}
                <div className="categories-section">
                    <div className="section-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 20}}>
                        <h2>📂 Gestão de Categorias</h2>
                        {!isEditingCat && (
                            <Button onClick={openNewCategory} style={{background: '#10b981'}}>
                                <Plus size={18} style={{marginRight:5}}/> Nova Categoria
                            </Button>
                        )}
                    </div>

                    {isEditingCat ? (
                        <Card style={{border: '1px solid #c333ff'}}>
                            <CardContent>
                                <h3>{currentCat.id ? 'Editar Categoria' : 'Nova Categoria'}</h3>
                                <div className="config-grid-layout">
                                    <div className="form-group">
                                        <label>Título da Categoria</label>
                                        <input className="input-field" value={currentCat.title} onChange={(e) => setCurrentCat({...currentCat, title: e.target.value})} placeholder="Ex: Packs Premium" />
                                    </div>
                                    <div className="form-group">
                                        <label>Descrição Curta</label>
                                        <input className="input-field" value={currentCat.description} onChange={(e) => setCurrentCat({...currentCat, description: e.target.value})} placeholder="Ex: As melhores fotos..." />
                                    </div>
                                    <div className="form-group">
                                        <label><ImageIcon size={16}/> Imagem de Capa (URL)</label>
                                        <input className="input-field" value={currentCat.cover_image} onChange={(e) => setCurrentCat({...currentCat, cover_image: e.target.value})} placeholder="https://..." />
                                        <small style={{color:'#666'}}>Aparece na Home da Loja</small>
                                    </div>
                                    <div className="form-group">
                                        <label><Link size={16}/> Banner Interno (URL)</label>
                                        <input className="input-field" value={currentCat.banner_mob_url} onChange={(e) => setCurrentCat({...currentCat, banner_mob_url: e.target.value})} placeholder="https://..." />
                                        <small style={{color:'#666'}}>Aparece ao abrir a categoria</small>
                                    </div>
                                    <div className="form-group">
                                        <label>Cor do Tema</label>
                                        <input type="color" value={currentCat.theme_color} onChange={(e) => setCurrentCat({...currentCat, theme_color: e.target.value})} />
                                    </div>
                                </div>

                                <div style={{display:'flex', gap: 10, marginTop: 20}}>
                                    <Button onClick={handleSaveCategory} style={{background: '#c333ff'}}>Salvar Categoria</Button>
                                    <Button variant="ghost" onClick={() => setIsEditingCat(false)}>Cancelar</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="categories-list-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 15}}>
                            {categories.map(cat => (
                                <div key={cat.id} className="category-admin-card" style={{background: '#151515', border: '1px solid #333', borderRadius: 8, padding: 15}}>
                                    <div style={{height: 120, background: '#000', borderRadius: 4, marginBottom: 10, overflow:'hidden'}}>
                                        {cat.cover_image ? <img src={cat.cover_image} style={{width:'100%', height:'100%', objectFit:'cover'}} /> : <div style={{display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'#333'}}>Sem Imagem</div>}
                                    </div>
                                    <h4 style={{margin:'0 0 5px 0'}}>{cat.title}</h4>
                                    <p style={{fontSize:'0.8rem', color:'#888', margin:0}}>{cat.description || 'Sem descrição'}</p>
                                    
                                    <div style={{display:'flex', gap: 10, marginTop: 15}}>
                                        <button onClick={() => { setCurrentCat(cat); setIsEditingCat(true); }} style={{flex:1, background: '#333', border:'none', color:'#fff', padding: 8, borderRadius: 4, cursor:'pointer'}}><Edit size={16}/></button>
                                        <button onClick={() => handleDeleteCategory(cat.id)} style={{flex:1, background: '#3f1111', border:'none', color:'#ef4444', padding: 8, borderRadius: 4, cursor:'pointer'}}><Trash2 size={16}/></button>
                                    </div>
                                </div>
                            ))}
                            {categories.length === 0 && <p style={{color:'#666'}}>Nenhuma categoria criada.</p>}
                        </div>
                    )}
                </div>

                <div className="link-copy-box" style={{marginTop: 40}}>
                    <span>Link da Loja:</span>
                    <code onClick={copyStoreLink}>{window.location.origin}/loja/{id}</code>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}