import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom'; // 🔥 Adicionado useLocation
import { 
  Save, ArrowLeft, MessageSquare, Key, Headphones, 
  Smartphone, Layout, PlayCircle, Type, Plus, Trash2, Edit, Image as ImageIcon, Link, User, Palette, Shield, Radio
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { botService, miniappService } from '../services/api'; 
import Swal from 'sweetalert2';
import './Bots.css';

export function BotConfig() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // 🔥 Hook para ler o estado da navegação
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('geral');
  
  // --- CONFIGURAÇÃO GERAL ---
  const [config, setConfig] = useState({
    nome: '', 
    token: '', 
    id_canal_vip: '', 
    admin_principal_id: '',
    suporte_username: '', 
    status: 'desconectado'
  });

  // --- CONFIGURAÇÃO MINI APP (COMPLETA) ---
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
  const [currentCat, setCurrentCat] = useState(null);

  useEffect(() => {
    // 🔥 Verifica se veio algum comando de aba do NewBot.jsx
    if (location.state?.initialTab) {
        setActiveTab(location.state.initialTab);
        // Limpa o state para não ficar preso na aba se der F5 (opcional, mas boa prática)
        window.history.replaceState({}, document.title);
    }
    carregarDados();
  }, [id, location.state]); // Adicionado location.state nas dependências

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // 1. Carrega Dados do Bot
      const bots = await botService.listBots();
      const currentBot = bots.find(b => b.id === parseInt(id)); 
      
      if (currentBot) {
        setConfig({
          nome: currentBot.nome || '',
          token: currentBot.token || '',
          id_canal_vip: currentBot.id_canal_vip || '',
          admin_principal_id: currentBot.admin_principal_id || '',
          suporte_username: currentBot.suporte_username || '', 
          status: currentBot.status || 'desconectado'
        });
      }

      // 2. Carrega Dados da Loja (MiniApp)
      try {
        const appData = await miniappService.getPublicData(id);
        if (appData) {
            if (appData.config) setMiniAppConfig(prev => ({ ...prev, ...appData.config }));
            if (appData.categories) setCategories(appData.categories);
        }
      } catch (e) { console.log("Loja ainda não configurada."); }

    } catch (error) {
      console.error("Erro ao carregar:", error);
      Swal.fire('Erro', 'Falha ao carregar configurações', 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- SALVAR GERAL ---
  const handleSaveGeral = async () => {
    try {
      await botService.updateBot(id, config);
      Swal.fire({
        title: 'Sucesso',
        text: 'Configurações gerais salvas!',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        background: '#151515', color: '#fff'
      });
    } catch (error) {
      Swal.fire('Erro', 'Falha ao salvar config geral', 'error');
    }
  };

  // --- SALVAR MINI APP ---
  const handleSaveMiniApp = async () => {
      try {
          await miniappService.saveConfig(id, miniAppConfig);
          Swal.fire({
            title: 'Loja Atualizada',
            text: 'Configurações visuais salvas!',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
            background: '#151515', color: '#fff'
          });
      } catch (error) {
          Swal.fire('Erro', 'Falha ao salvar loja', 'error');
      }
  };

  // --- CATEGORIAS (COMPLETA) ---
  const openNewCategory = () => {
      setCurrentCat({
          id: null, 
          bot_id: id,
          title: '', slug: '', description: '', 
          cover_image: '', 
          banner_mob_url: '', banner_desk_url: '',
          bg_color: '#000000', theme_color: '#ffffff',
          video_preview_url: '',
          model_img_url: '', model_name: '', model_desc: '',
          model_name_color: '#ffffff', model_desc_color: '#cccccc', 
          footer_banner_url: '', deco_lines_url: '',
          is_direct_checkout: false, content_json: '[]'
      });
      setIsEditingCat(true);
  };

  const handleEditCategory = (cat) => {
      setCurrentCat({ ...cat }); 
      setIsEditingCat(true);
  };

  const handleSaveCategory = async () => {
      if (!currentCat.title) return Swal.fire('Erro', 'Digite um título', 'warning');

      try {
          await miniappService.createCategory({ ...currentCat, bot_id: id });
          setIsEditingCat(false);
          setCurrentCat(null);
          
          const appData = await miniappService.getPublicData(id);
          setCategories(appData.categories || []);
          
          Swal.fire('Sucesso', 'Categoria salva!', 'success');
      } catch (error) {
          console.error(error);
          Swal.fire('Erro', 'Erro ao salvar categoria', 'error');
      }
  };

  const handleDeleteCategory = async (catId) => {
      const res = await Swal.fire({
          title: 'Tem certeza?', text: "Isso apagará a categoria.",
          icon: 'warning', showCancelButton: true,
          background: '#151515', color: '#fff', confirmButtonColor: '#d33'
      });
      if (res.isConfirmed) {
          try {
            await miniappService.deleteCategory(catId);
            setCategories(prev => prev.filter(c => c.id !== catId));
            Swal.fire('Sucesso', 'Categoria removida.', 'success');
          } catch (e) {
            Swal.fire('Erro', 'Erro ao excluir', 'error');
          }
      }
  };

  const copyStoreLink = () => {
      const link = `${window.location.origin}/loja/${id}`;
      navigator.clipboard.writeText(link);
      Swal.fire({title:'Copiado!', text: link, icon:'success', timer: 1000, showConfirmButton: false, toast:true, position:'top-end'});
  };

  if (loading) return <div className="loading-screen">Carregando...</div>;

  return (
    <div className="bot-config-container">
      
      {/* HEADER (Mantido) */}
      <div className="config-header-bar">
        <div style={{display:'flex', alignItems:'center', gap: 15}}>
            <Button variant="ghost" onClick={() => navigate('/bots')}>
            <ArrowLeft size={20} />
            </Button>
            <h1>Configurar: <span className="highlight">{config.nome}</span></h1>
        </div>
      </div>

      {/* ABAS (RESTAURADO PARA O PADRÃO ORIGINAL) */}
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
        
        {/* ================= ABA GERAL ================= */}
        {activeTab === 'geral' && (
            <div className="config-grid-layout">
                <Card>
                  <CardContent>
                    <div className="card-header-line"><Key size={20} color="#c333ff" /><h3>Credenciais</h3></div>
                    
                    <div className="form-group">
                      <label>Nome do Bot</label>
                      <input 
                        className="input-field" 
                        value={config.nome} 
                        onChange={(e) => setConfig({...config, nome: e.target.value})} 
                      />
                    </div>

                    <div className="form-group">
                      <label>Token do Bot (Telegram API)</label>
                      {/* 🔥 TOKEN LIBERADO */}
                      <input 
                        className="input-field" 
                        value={config.token} 
                        onChange={(e) => setConfig({...config, token: e.target.value})} 
                        placeholder="Cole o novo token aqui se necessário..."
                      />
                      <small style={{color:'#666'}}>*Se o bot foi banido, cole o token do novo bot aqui para manter os dados.</small>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <div className="card-header-line"><Shield size={20} color="#10b981" /><h3>Permissões & IDs</h3></div>

                    <div className="form-group">
                      <label>ID do Admin Principal</label>
                      <input 
                        className="input-field" 
                        value={config.admin_principal_id} 
                        onChange={(e) => setConfig({...config, admin_principal_id: e.target.value})} 
                      />
                    </div>

                    {/* 🔥 SUPORTE RESTAURADO */}
                    <div className="form-group">
                        <label><Headphones size={16} style={{verticalAlign:'middle', marginRight:'5px'}}/> Username do Suporte</label>
                        <input 
                            className="input-field" 
                            value={config.suporte_username} 
                            onChange={(e) => setConfig({...config, suporte_username: e.target.value})} 
                            placeholder="@seu_suporte" 
                        />
                    </div>

                    <div className="form-group">
                      <label>ID do Canal VIP</label>
                      <input 
                        className="input-field" 
                        value={config.id_canal_vip} 
                        onChange={(e) => setConfig({...config, id_canal_vip: e.target.value})} 
                        placeholder="-100..."
                      />
                    </div>

                    <div style={{marginTop: 20}}>
                        <Button onClick={handleSaveGeral} style={{width:'100%'}}>
                            <Save size={18} style={{marginRight: 8}}/> SALVAR CONFIGURAÇÕES
                        </Button>
                    </div>

                  </CardContent>
                </Card>
            </div>
        )}

        {/* ================= ABA MINI APP (LOJA) ================= */}
        {activeTab === 'miniapp' && (
            <div className="miniapp-layout">
                {/* 1. CONFIGURAÇÃO VISUAL GLOBAL */}
                <div className="config-grid-layout" style={{marginBottom: 30}}>
                    <Card>
                        <CardContent>
                            <div className="section-title"><Layout size={20}/> Aparência da Home</div>
                            <div className="form-group">
                                <label>Cor de Fundo Global</label>
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
                            <div className="form-group">
                                <label>Texto do Botão</label>
                                <input className="input-field" value={miniAppConfig.hero_btn_text} onChange={(e) => setMiniAppConfig({...miniAppConfig, hero_btn_text: e.target.value})}/>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <div className="section-title"><Smartphone size={20}/> Extras (Popup & Footer)</div>
                            <div className="form-group checkbox-row" style={{display:'flex', alignItems:'center', gap:10, marginBottom:15}}>
                                <input type="checkbox" id="chk_popup" checked={miniAppConfig.enable_popup} onChange={(e) => setMiniAppConfig({...miniAppConfig, enable_popup: e.target.checked})} style={{width:20, height:20}}/>
                                <label htmlFor="chk_popup" style={{marginBottom:0, cursor:'pointer'}}>Ativar Popup Promo</label>
                            </div>
                            {miniAppConfig.enable_popup && (
                                <div className="sub-config-box" style={{background:'rgba(255,255,255,0.05)', padding:15, borderRadius:8, marginBottom:15}}>
                                    <div className="form-group"><label>Texto Popup</label><input className="input-field" value={miniAppConfig.popup_text} onChange={(e) => setMiniAppConfig({...miniAppConfig, popup_text: e.target.value})} /></div>
                                    <div className="form-group"><label>Vídeo Popup</label><input className="input-field" value={miniAppConfig.popup_video_url} onChange={(e) => setMiniAppConfig({...miniAppConfig, popup_video_url: e.target.value})} /></div>
                                </div>
                            )}
                            <div className="form-group"><label>Rodapé</label><input className="input-field" value={miniAppConfig.footer_text} onChange={(e) => setMiniAppConfig({...miniAppConfig, footer_text: e.target.value})} /></div>
                            <div style={{marginTop: 20}}>
                                <Button onClick={handleSaveMiniApp} style={{width: '100%'}}><Save size={18} style={{marginRight: 8}}/> Salvar Aparência</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 2. GESTÃO DE CATEGORIAS */}
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
                                    {/* 1. BÁSICO */}
                                    <div className="form-group">
                                        <label>Título da Categoria</label>
                                        <input className="input-field" value={currentCat.title} onChange={(e) => setCurrentCat({...currentCat, title: e.target.value})} placeholder="Ex: Packs Premium" />
                                    </div>
                                    <div className="form-group">
                                        <label>Slug (URL Amigável)</label>
                                        <input className="input-field" value={currentCat.slug} onChange={(e) => setCurrentCat({...currentCat, slug: e.target.value})} placeholder="ex: praia-de-nudismo" />
                                        <small style={{color:'#666'}}>Deixe vazio para gerar automático</small>
                                    </div>
                                    <div className="form-group" style={{gridColumn:'span 2'}}>
                                        <label>Descrição SEO (Opcional)</label>
                                        <input className="input-field" value={currentCat.description} onChange={(e) => setCurrentCat({...currentCat, description: e.target.value})} placeholder="Descrição curta para o Google..." />
                                    </div>
                                    
                                    {/* 2. VISUAL E CORES */}
                                    <div className="form-group">
                                        <label><Palette size={16}/> Cor de Fundo (Página)</label>
                                        <div style={{display:'flex', gap:5}}>
                                            <input type="color" value={currentCat.bg_color || '#000000'} onChange={(e) => setCurrentCat({...currentCat, bg_color: e.target.value})} style={{height:40}} />
                                            <input className="input-field" value={currentCat.bg_color} onChange={(e) => setCurrentCat({...currentCat, bg_color: e.target.value})} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label><Palette size={16}/> Cor do Tema (Botões)</label>
                                        <div style={{display:'flex', gap:5}}>
                                            <input type="color" value={currentCat.theme_color || '#ffffff'} onChange={(e) => setCurrentCat({...currentCat, theme_color: e.target.value})} style={{height:40}} />
                                            <input className="input-field" value={currentCat.theme_color} onChange={(e) => setCurrentCat({...currentCat, theme_color: e.target.value})} />
                                        </div>
                                    </div>

                                    {/* 3. IMAGENS */}
                                    <div className="form-group"><label><ImageIcon size={16}/> Imagem Card (Home)</label><input className="input-field" value={currentCat.cover_image} onChange={(e) => setCurrentCat({...currentCat, cover_image: e.target.value})} placeholder="https://..." /></div>
                                    <div className="form-group"><label><Layout size={16}/> Banner Mobile (Topo)</label><input className="input-field" value={currentCat.banner_mob_url} onChange={(e) => setCurrentCat({...currentCat, banner_mob_url: e.target.value})} placeholder="https://..." /></div>
                                    <div className="form-group"><label><Layout size={16}/> Banner Desktop</label><input className="input-field" value={currentCat.banner_desk_url} onChange={(e) => setCurrentCat({...currentCat, banner_desk_url: e.target.value})} placeholder="https://..." /></div>

                                    {/* 4. CONTEÚDO RICO (MODELO) */}
                                    <div className="form-group">
                                        <label><User size={16}/> Nome da Modelo</label>
                                        <input className="input-field" value={currentCat.model_name} onChange={(e) => setCurrentCat({...currentCat, model_name: e.target.value})} />
                                    </div>
                                    <div className="form-group">
                                        <label>Cor do Nome</label>
                                        <div style={{display:'flex', gap:5}}>
                                            <input type="color" value={currentCat.model_name_color || '#ffffff'} onChange={(e) => setCurrentCat({...currentCat, model_name_color: e.target.value})} style={{height:40}} />
                                            <input className="input-field" value={currentCat.model_name_color} onChange={(e) => setCurrentCat({...currentCat, model_name_color: e.target.value})} />
                                        </div>
                                    </div>

                                    <div className="form-group" style={{gridColumn:'span 2'}}>
                                        <label>Descrição Completa da Cena</label>
                                        <textarea className="input-field" rows={3} value={currentCat.model_desc} onChange={(e) => setCurrentCat({...currentCat, model_desc: e.target.value})} />
                                    </div>
                                    <div className="form-group">
                                        <label>Cor da Descrição</label>
                                        <div style={{display:'flex', gap:5}}>
                                            <input type="color" value={currentCat.model_desc_color || '#cccccc'} onChange={(e) => setCurrentCat({...currentCat, model_desc_color: e.target.value})} style={{height:40}} />
                                            <input className="input-field" value={currentCat.model_desc_color} onChange={(e) => setCurrentCat({...currentCat, model_desc_color: e.target.value})} />
                                        </div>
                                    </div>
                                    <div className="form-group"><label><User size={16}/> Foto da Modelo (Redonda)</label><input className="input-field" value={currentCat.model_img_url} onChange={(e) => setCurrentCat({...currentCat, model_img_url: e.target.value})} /></div>

                                    {/* 5. EXTRAS */}
                                    <div className="form-group"><label><PlayCircle size={16}/> Vídeo Preview</label><input className="input-field" value={currentCat.video_preview_url} onChange={(e) => setCurrentCat({...currentCat, video_preview_url: e.target.value})} /></div>
                                    <div className="form-group"><label>Linhas Decorativas (URL)</label><input className="input-field" value={currentCat.deco_lines_url} onChange={(e) => setCurrentCat({...currentCat, deco_lines_url: e.target.value})} /></div>
                                    <div className="form-group"><label>Banner Rodapé</label><input className="input-field" value={currentCat.footer_banner_url} onChange={(e) => setCurrentCat({...currentCat, footer_banner_url: e.target.value})} /></div>
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
                                        <button onClick={() => handleEditCategory(cat)} style={{flex:1, background: '#333', border:'none', color:'#fff', padding: 8, borderRadius: 4, cursor:'pointer'}}><Edit size={16}/></button>
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