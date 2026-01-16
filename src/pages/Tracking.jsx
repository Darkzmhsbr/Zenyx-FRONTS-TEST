import React, { useState, useEffect } from 'react';
import { 
  FolderPlus, Link as LinkIcon, Trash2, ArrowLeft, Copy, Check, 
  BarChart2, PieChart, TrendingUp, DollarSign, MousePointer, Users,
  Facebook, Instagram, Youtube, MessageCircle, Globe, Share2
} from 'lucide-react';
import { 
  PieChart as RePieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { trackingService, botService } from '../services/api';
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import Swal from 'sweetalert2';
import './Tracking.css';

// Cores para os Gráficos
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#c333ff', '#ef4444'];

export function Tracking() {
  // Estados de Navegação
  const [view, setView] = useState('dashboard'); // 'dashboard' ou 'folder'
  const [loading, setLoading] = useState(false);
  
  // Dados
  const [folders, setFolders] = useState([]);
  const [currentLinks, setCurrentLinks] = useState([]);
  const [bots, setBots] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  
  // Modais
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  
  // Forms
  const [newFolder, setNewFolder] = useState({ nome: '', plataforma: 'instagram' });
  const [newLink, setNewLink] = useState({ nome: '', origem: 'stories', bot_id: '', codigo: '' });

  // Load Inicial
  useEffect(() => {
    loadDashboard();
    loadBots();
  }, []);

  const loadBots = async () => {
    try {
      const data = await botService.listBots();
      setBots(data.map(b => ({ label: b.nome, value: b.id, username: b.username })));
    } catch (error) {
      console.error("Erro ao carregar bots", error);
    }
  };

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await trackingService.listFolders();
      setFolders(data);
    } catch (error) {
      console.error("Erro ao carregar pastas", error);
    } finally {
      setLoading(false);
    }
  };

  const openFolder = async (folder) => {
    setSelectedFolder(folder);
    setLoading(true);
    try {
      const links = await trackingService.listLinks(folder.id);
      setCurrentLinks(links);
      setView('folder');
    } catch (error) {
      Swal.fire('Erro', 'Falha ao abrir pasta.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- CRIAÇÃO ---
  const handleCreateFolder = async () => {
    if (!newFolder.nome) return Swal.fire('Atenção', 'Nome é obrigatório', 'warning');
    try {
      await trackingService.createFolder(newFolder);
      setShowFolderModal(false);
      setNewFolder({ nome: '', plataforma: 'instagram' });
      loadDashboard();
      Swal.fire('Sucesso', 'Pasta criada!', 'success');
    } catch (error) {
      Swal.fire('Erro', 'Falha ao criar pasta.', 'error');
    }
  };

  const handleCreateLink = async () => {
    if (!newLink.nome || !newLink.bot_id) return Swal.fire('Atenção', 'Preencha Nome e Bot', 'warning');
    try {
      await trackingService.createLink({
        ...newLink,
        folder_id: selectedFolder.id
      });
      setShowLinkModal(false);
      // Recarrega links da pasta atual
      const links = await trackingService.listLinks(selectedFolder.id);
      setCurrentLinks(links);
      setNewLink({ nome: '', origem: 'stories', bot_id: '', codigo: '' });
      Swal.fire('Sucesso', 'Link rastreável gerado!', 'success');
    } catch (error) {
        // Se der erro de duplicidade (código já existe)
        if (error.response && error.response.status === 400) {
            Swal.fire('Erro', 'Este código personalizado já existe. Tente outro.', 'error');
        } else {
            Swal.fire('Erro', 'Falha ao criar link.', 'error');
        }
    }
  };

  const handleDeleteLink = async (id) => {
    const result = await Swal.fire({
        title: 'Excluir Link?',
        text: "Os dados estatísticos dele serão perdidos.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        background: '#151515', color: '#fff'
    });

    if (result.isConfirmed) {
        try {
            await trackingService.deleteLink(id);
            const links = await trackingService.listLinks(selectedFolder.id);
            setCurrentLinks(links);
        } catch (error) {
            Swal.fire('Erro', 'Falha ao deletar.', 'error');
        }
    }
  };

  const handleDeleteFolder = async (e, id) => {
    e.stopPropagation(); // Evita abrir a pasta ao clicar no lixo
    const result = await Swal.fire({
        title: 'Excluir Pasta?',
        text: "Todos os links dentro dela também serão apagados!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        background: '#151515', color: '#fff'
    });

    if (result.isConfirmed) {
        try {
            await trackingService.deleteFolder(id);
            loadDashboard();
        } catch (error) {
            Swal.fire('Erro', 'Falha ao deletar pasta.', 'error');
        }
    }
  };

  // --- UTILITÁRIOS ---
  const copyLink = (linkData) => {
    const bot = bots.find(b => b.value === linkData.bot_id);
    const username = bot ? bot.username : 'SeuBot';
    const finalLink = `https://t.me/${username}?start=${linkData.codigo}`;
    
    navigator.clipboard.writeText(finalLink);
    Swal.fire({
        icon: 'success',
        title: 'Copiado!',
        text: finalLink,
        toast: true, position: 'top-end', timer: 3000, showConfirmButton: false,
        background: '#151515', color: '#fff'
    });
  };

  const getPlatformIcon = (plat) => {
    switch(plat) {
        case 'facebook': return <Facebook color="#1877F2" />;
        case 'instagram': return <Instagram color="#E4405F" />;
        case 'youtube': return <Youtube color="#FF0000" />;
        case 'whatsapp': return <MessageCircle color="#25D366" />;
        case 'tiktok': return <Share2 color="#000" />; // Ícone genérico para TikTok
        default: return <Globe color="#ccc" />;
    }
  };

  // --- DADOS PARA GRÁFICOS ---
  // Mockup simples: em produção, você calcularia isso somando os links de todas as pastas
  // ou buscaria um endpoint de dashboard global de tracking.
  // Aqui vamos simular visualmente para você ver o layout.
  
  const pieData = [
    { name: 'Instagram', value: 400 },
    { name: 'Facebook', value: 300 },
    { name: 'YouTube', value: 300 },
    { name: 'TikTok', value: 200 },
  ];

  const barData = [
    { name: 'Insta Stories', clicks: 400, vendas: 24 },
    { name: 'Face Ads', clicks: 300, vendas: 13 },
    { name: 'YouTube Bio', clicks: 200, vendas: 98 },
    { name: 'TikTok', clicks: 278, vendas: 39 },
  ];

  return (
    <div className="tracking-container">
        
        {/* --- CABEÇALHO --- */}
        <div className="page-header">
            <div>
                <h1>Rastreamento de Links</h1>
                <p style={{color: 'var(--muted-foreground)'}}>Gerencie suas campanhas e saiba de onde vêm suas vendas.</p>
            </div>
            {view === 'dashboard' ? (
                <Button onClick={() => setShowFolderModal(true)}>
                    <FolderPlus size={18} style={{marginRight:8}}/> Nova Pasta
                </Button>
            ) : (
                <Button onClick={() => setShowLinkModal(true)}>
                    <LinkIcon size={18} style={{marginRight:8}}/> Novo Link
                </Button>
            )}
        </div>

        {view === 'dashboard' ? (
            <>
                {/* --- ÁREA DE GRÁFICOS (DASHBOARD) --- */}
                <div className="charts-grid">
                    <Card>
                        <CardContent>
                            <h3 className="chart-title">Origem do Tráfego (Cliques)</h3>
                            <div style={{ width: '100%', height: 250 }}>
                                <ResponsiveContainer>
                                    <RePieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%" cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{backgroundColor: '#111', border: '1px solid #333'}} />
                                        <Legend />
                                    </RePieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <h3 className="chart-title">Conversão por Canal (Cliques x Vendas)</h3>
                            <div style={{ width: '100%', height: 250 }}>
                                <ResponsiveContainer>
                                    <BarChart data={barData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                        <XAxis dataKey="name" stroke="#888" />
                                        <YAxis stroke="#888" />
                                        <Tooltip contentStyle={{backgroundColor: '#111', border: '1px solid #333'}} />
                                        <Legend />
                                        <Bar dataKey="clicks" name="Cliques" fill="#8884d8" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="vendas" name="Vendas" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <h3 style={{marginTop: '30px', marginBottom: '15px'}}>Suas Pastas</h3>
                
                {/* --- GRID DE PASTAS --- */}
                <div className="folders-grid">
                    {folders.map(folder => (
                        <div key={folder.id} className="folder-card" onClick={() => openFolder(folder)}>
                            <div className="folder-icon">
                                {getPlatformIcon(folder.plataforma)}
                            </div>
                            <div className="folder-info">
                                <h4>{folder.nome}</h4>
                                <span>{folder.link_count || 0} links ativos</span>
                            </div>
                            <button className="delete-folder-btn" onClick={(e) => handleDeleteFolder(e, folder.id)}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                    
                    {folders.length === 0 && (
                        <div className="empty-folders">
                            <p>Nenhuma pasta criada. Crie uma para começar.</p>
                        </div>
                    )}
                </div>
            </>
        ) : (
            <>
                {/* --- VIEW: DENTRO DA PASTA (LISTA DE LINKS) --- */}
                <div className="folder-header-bar">
                    <button className="back-btn" onClick={() => { setView('dashboard'); setSelectedFolder(null); }}>
                        <ArrowLeft size={20} /> Voltar
                    </button>
                    <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                        {getPlatformIcon(selectedFolder?.plataforma)}
                        <h2>{selectedFolder?.nome}</h2>
                    </div>
                </div>

                <div className="links-list">
                    {currentLinks.map(link => (
                        <div key={link.id} className="link-item">
                            <div className="link-main-info">
                                <div className="link-icon-wrapper">
                                    <LinkIcon size={20} color="#c333ff" />
                                </div>
                                <div>
                                    <div className="link-name">{link.nome}</div>
                                    <div className="link-code">Código: <code>{link.codigo}</code> • Origem: {link.origem}</div>
                                </div>
                            </div>

                            <div className="link-stats">
                                <div className="stat-box">
                                    <MousePointer size={14} />
                                    <span>{link.clicks} <small>Cliques</small></span>
                                </div>
                                <div className="stat-box highlight">
                                    <Users size={14} />
                                    <span>{link.leads} <small>Leads</small></span>
                                </div>
                                <div className="stat-box success">
                                    <DollarSign size={14} />
                                    <span>{link.vendas} <small>Vendas</small></span>
                                </div>
                                <div className="stat-box money">
                                    <span>R$ {link.faturamento?.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="link-actions">
                                <button className="action-btn copy" onClick={() => copyLink(link)} title="Copiar Link">
                                    <Copy size={18} />
                                </button>
                                <button className="action-btn delete" onClick={() => handleDeleteLink(link.id)} title="Excluir">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {currentLinks.length === 0 && (
                        <div className="empty-state-links">
                            <p>Esta pasta está vazia. Crie seu primeiro link rastreável.</p>
                        </div>
                    )}
                </div>
            </>
        )}

        {/* --- MODAL NOVA PASTA --- */}
        {showFolderModal && (
            <div className="modal-overlay">
                <div className="modal-content">
                    <h3>Nova Pasta de Rastreamento</h3>
                    <div className="form-group" style={{marginBottom:15}}>
                        <Input 
                            label="Nome da Campanha/Pasta"
                            placeholder="Ex: Facebook Ads Black Friday"
                            value={newFolder.nome}
                            onChange={e => setNewFolder({...newFolder, nome: e.target.value})}
                        />
                    </div>
                    <div className="form-group">
                        <Select 
                            label="Plataforma (Ícone)"
                            options={[
                                {label: 'Facebook', value: 'facebook'},
                                {label: 'Instagram', value: 'instagram'},
                                {label: 'YouTube', value: 'youtube'},
                                {label: 'TikTok', value: 'tiktok'},
                                {label: 'WhatsApp', value: 'whatsapp'},
                                {label: 'Outros / Site', value: 'site'}
                            ]}
                            value={newFolder.plataforma}
                            onChange={e => setNewFolder({...newFolder, plataforma: e.target.value})}
                        />
                    </div>
                    <div className="modal-actions">
                        <Button variant="ghost" onClick={() => setShowFolderModal(false)}>Cancelar</Button>
                        <Button onClick={handleCreateFolder}>Criar Pasta</Button>
                    </div>
                </div>
            </div>
        )}

        {/* --- MODAL NOVO LINK --- */}
        {showLinkModal && (
            <div className="modal-overlay">
                <div className="modal-content">
                    <h3>Novo Link Rastreável</h3>
                    <div className="form-group" style={{marginBottom:15}}>
                        <Input 
                            label="Nome de Identificação"
                            placeholder="Ex: Stories Manhã (Promo 1)"
                            value={newLink.nome}
                            onChange={e => setNewLink({...newLink, nome: e.target.value})}
                        />
                    </div>
                    
                    <div className="form-group" style={{marginBottom:15}}>
                        <label className="input-label">Qual Bot vai responder?</label>
                        <select 
                            className="input-field"
                            value={newLink.bot_id}
                            onChange={e => setNewLink({...newLink, bot_id: e.target.value})}
                        >
                            <option value="">Selecione um bot...</option>
                            {bots.map(b => (
                                <option key={b.value} value={b.value}>{b.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group" style={{marginBottom:15}}>
                        <Select 
                            label="Origem Específica (Tag)"
                            options={[
                                {label: 'Stories', value: 'stories'},
                                {label: 'Feed / Post', value: 'feed'},
                                {label: 'Reels / Shorts', value: 'reels'},
                                {label: 'Bio / Perfil', value: 'bio'},
                                {label: 'Anúncio Pago (Ads)', value: 'ads'},
                                {label: 'Grupo / Canal', value: 'grupo'}
                            ]}
                            value={newLink.origem}
                            onChange={e => setNewLink({...newLink, origem: e.target.value})}
                        />
                    </div>

                    <div className="form-group">
                        <Input 
                            label="Código Personalizado (Opcional)"
                            placeholder="Deixe vazio para gerar aleatório"
                            value={newLink.codigo}
                            onChange={e => setNewLink({...newLink, codigo: e.target.value})}
                        />
                        <small style={{color:'#666'}}>Ex: <code>promonatal</code> (mínimo 3 letras)</small>
                    </div>

                    <div className="modal-actions">
                        <Button variant="ghost" onClick={() => setShowLinkModal(false)}>Cancelar</Button>
                        <Button onClick={handleCreateLink}>Gerar Link</Button>
                    </div>
                </div>
            </div>
        )}

    </div>
  );
}