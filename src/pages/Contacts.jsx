import React, { useEffect, useState } from 'react';
import { crmService, remarketingService } from '../services/api'; 
import { useBot } from '../context/BotContext';
import { Users, CheckCircle, Clock, XCircle, RefreshCw, Hash, Calendar, Edit, Send, Zap, Shield, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '../components/Button';
import Swal from 'sweetalert2';
import './Contacts.css'; // Usa o CSS da V1

export function Contacts() {
  const { selectedBot } = useBot();
  const [allContacts, setAllContacts] = useState([]); 
  const [filteredContacts, setFilteredContacts] = useState([]); 
  const [filter, setFilter] = useState('todos');
  const [loading, setLoading] = useState(false);

  // Estados do Modal
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // Estado para Histórico de Campanhas (Para o Modal)
  const [campaignHistory, setCampaignHistory] = useState([]);

  useEffect(() => {
    if (selectedBot) {
        carregarContatos();
        carregarHistoricoCampanhas();
    }
  }, [selectedBot]); // Recarrega quando muda o bot

  useEffect(() => {
    aplicarFiltro();
  }, [filter, allContacts]);

  const carregarContatos = async () => {
    if (!selectedBot) return;
    setLoading(true);
    try {
      // Busca TODOS os contatos e filtramos no front para garantir velocidade na troca de abas
      const data = await crmService.getContacts(selectedBot.id, 'todos'); 
      setAllContacts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao listar contatos", error);
      setAllContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const carregarHistoricoCampanhas = async () => {
    if(!selectedBot) return;
    try {
        const hist = await remarketingService.getHistory(selectedBot.id);
        // Pegamos apenas as 3 últimas campanhas para exibir no modal
        setCampaignHistory(hist.slice(0, 3));
    } catch (e) {
        console.error("Erro ao carregar histórico", e);
    }
  };

  // --- LÓGICA DE FILTRO CORRIGIDA ---
  const aplicarFiltro = () => {
    if (filter === 'todos') {
        setFilteredContacts(allContacts);
    } else if (filter === 'pagantes') {
        // Filtra quem pagou ou está ativo
        setFilteredContacts(allContacts.filter(c => ['paid', 'active', 'approved'].includes(c.status)));
    } else if (filter === 'pendentes') {
        // Filtra estritamente pendentes
        setFilteredContacts(allContacts.filter(c => c.status === 'pending'));
    } else if (filter === 'expirados') {
        // Filtra estritamente expirados
        setFilteredContacts(allContacts.filter(c => c.status === 'expired'));
    }
  };

  // --- MODAL & EDIÇÃO ---
  const openUserEdit = (user) => {
      setEditingUser({
          id: user.id,
          telegram_id: user.telegram_id, // Importante para o disparo individual
          name: user.first_name || 'Sem nome',
          username: user.username,
          status: user.status,
          role: user.role || 'user', // Novo campo: Cargo
          // Pega a custom_expiration do banco se existir e formata para o input date
          custom_expiration: user.custom_expiration ? new Date(user.custom_expiration).toISOString().split('T')[0] : ''
      });
      setShowUserModal(true);
  };

  const handleSaveUser = async (e) => {
      e.preventDefault();
      try {
          await crmService.updateUser(editingUser.id, {
              status: editingUser.status,
              role: editingUser.role,
              custom_expiration: editingUser.custom_expiration || 'remover'
          });
          Swal.fire({
            title: 'Salvo!',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
            background: '#151515', color: '#fff'
          });
          setShowUserModal(false);
          carregarContatos(); // Recarrega a lista para atualizar visualmente
      } catch (error) { 
          Swal.fire('Erro', 'Falha ao salvar.', 'error'); 
      }
  };

  // --- DISPARO INDIVIDUAL (A LÓGICA DO OUTRO PROJETO) ---
  const handleIndividualCampaign = async (historyId) => {
      try {
          // Chama a nova rota criada no Backend
          await remarketingService.sendIndividual(selectedBot.id, editingUser.telegram_id, historyId);
          Swal.fire({
              title: 'Enviado!', 
              text: `Campanha enviada para ${editingUser.name}.`, 
              icon: 'success', 
              background: '#151515', color: '#fff'
          });
      } catch (error) {
          Swal.fire('Erro', 'Falha ao enviar mensagem.', 'error');
      }
  };

  // Helpers Visuais
  const formatDate = (dateString) => {
      if (!dateString) return '-';
      return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status) => {
    if (['paid', 'active', 'approved'].includes(status)) return <span className="status-badge status-paid"><CheckCircle size={12}/> Ativo</span>;
    if (status === 'expired') return <span className="status-badge status-expired"><XCircle size={12}/> Expirado</span>;
    return <span className="status-badge status-pending"><Clock size={12}/> Pendente</span>;
  };

  if (!selectedBot) return <div className="contacts-container"><p style={{textAlign:'center', marginTop:50, color:'#666'}}>Selecione um bot.</p></div>;

  return (
    <div className="contacts-container">
      <div className="contacts-header">
        <h1>Contatos <span style={{fontSize:'0.9rem', color:'#666'}}>({filteredContacts.length})</span></h1>
        <Button onClick={carregarContatos} variant="outline"><RefreshCw size={16}/></Button>
      </div>

      <div className="tabs-container">
        <div className="filters-bar">
          {['todos', 'pagantes', 'pendentes', 'expirados'].map(f => (
            <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="table-container">
        {loading ? <p style={{padding:20, textAlign:'center'}}>Carregando...</p> : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Plano / Valor</th>
                <th>Status</th>
                <th>Cargo</th>
                <th>Expiração</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.length > 0 ? filteredContacts.map((c) => (
                <tr key={c.id}>
                  <td data-label="Usuário">
                    <div style={{ fontWeight: '600', color: '#fff' }}>{c.first_name || 'Sem nome'}</div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>@{c.username || '...'}</div>
                  </td>
                  <td data-label="Plano">
                    <div style={{fontSize:'0.85rem'}}>{c.plano_nome || '-'}</div>
                    <div style={{fontWeight:'bold'}}>R$ {c.valor ? c.valor.toFixed(2) : '0.00'}</div>
                  </td>
                  <td data-label="Status">{getStatusBadge(c.status)}</td>
                  <td data-label="Cargo">
                      {c.role === 'admin' ? <span style={{color:'#c333ff', fontWeight:'bold'}}>Admin</span> : 'Usuário'}
                  </td>
                  
                  {/* DADO DA EXPIRAÇÃO */}
                  <td data-label="Expiração">
                    {['paid','active','approved'].includes(c.status) 
                        ? (c.custom_expiration ? formatDate(c.custom_expiration) : <span style={{color:'#10b981'}}>Vitalício</span>) 
                        : '-'}
                  </td>
                  
                  <td data-label="Ação">
                    <Button size="sm" onClick={() => openUserEdit(c)}><Edit size={14}/></Button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="6" style={{textAlign:'center', padding:'30px', color:'#666'}}>Nenhum contato encontrado.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* --- MODAL DE EDIÇÃO AVANÇADO --- */}
      {showUserModal && editingUser && (
        <div className="modal-overlay">
            <div className="modal-content">
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                    <div>
                        <h2 style={{margin:0}}>Editar Usuário</h2>
                        <span style={{fontSize:'0.85rem', color:'#888'}}>ID: {editingUser.telegram_id} • {editingUser.name}</span>
                    </div>
                    <button className="icon-btn" onClick={() => setShowUserModal(false)}><XCircle size={24}/></button>
                </div>

                {/* --- SESSÃO DE DISPARO RÁPIDO (ESPELHO DO HISTÓRICO) --- */}
                <div style={{background: 'rgba(195, 51, 255, 0.05)', border: '1px solid rgba(195, 51, 255, 0.2)', borderRadius:'8px', padding:'15px', marginBottom:'20px'}}>
                    <h4 style={{margin:'0 0 10px 0', color:'#c333ff', display:'flex', alignItems:'center', gap:'8px'}}>
                        <Zap size={16}/> Enviar Campanha Rápida
                    </h4>
                    {campaignHistory.length === 0 ? (
                        <p style={{fontSize:'0.8rem', color:'#666', fontStyle:'italic'}}>Nenhuma campanha recente encontrada no histórico.</p>
                    ) : (
                        <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
                            {campaignHistory.map(camp => {
                                // Tenta extrair o texto da config JSON
                                let config = {};
                                try { config = JSON.parse(camp.config?.content_data || camp.config); } catch(e){}
                                return (
                                    <div key={camp.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(0,0,0,0.3)', padding:'8px', borderRadius:'6px'}}>
                                        <div style={{fontSize:'0.8rem', color:'#ccc', maxWidth:'70%', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                                            {camp.data} - {config.msg || 'Sem texto'}
                                        </div>
                                        <Button size="sm" style={{fontSize:'0.7rem', padding:'4px 8px'}} onClick={() => handleIndividualCampaign(camp.id)}>
                                            Enviar <Send size={10} style={{marginLeft:4}}/>
                                        </Button>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* --- FORMULÁRIO DE EDIÇÃO --- */}
                <form onSubmit={handleSaveUser}>
                    
                    {/* CARGO */}
                    <div className="form-group">
                        <label>Cargo</label>
                        <div style={{position:'relative'}}>
                            <Shield size={16} style={{position:'absolute', left:10, top:12, color:'#888'}}/>
                            <select 
                                className="input-field" 
                                style={{paddingLeft:'35px'}}
                                value={editingUser.role} 
                                onChange={e => setEditingUser({...editingUser, role: e.target.value})}
                            >
                                <option value="user">Usuário Comum</option>
                                <option value="admin">Administrador</option>
                            </select>
                        </div>
                    </div>

                    {/* STATUS */}
                    <div className="form-group">
                        <label>Status Financeiro</label>
                        <select className="input-field" value={editingUser.status} onChange={e => setEditingUser({...editingUser, status: e.target.value})}>
                            <option value="pending">⏳ Pendente</option>
                            <option value="paid">✅ Ativo / Pago</option>
                            <option value="expired">🚫 Expirado</option>
                        </select>
                    </div>

                    {/* DATA DE EXPIRAÇÃO */}
                    <div className="form-group">
                        <label>Data Personalizada</label>
                        <div style={{display:'flex', gap:'10px'}}>
                            <div style={{position:'relative', flex:1}}>
                                <Calendar size={16} style={{position:'absolute', left:10, top:12, color:'#888'}}/>
                                <input 
                                    type="date" 
                                    className="input-field" 
                                    style={{paddingLeft:'35px'}}
                                    value={editingUser.custom_expiration} 
                                    onChange={e => setEditingUser({...editingUser, custom_expiration: e.target.value})}
                                />
                            </div>
                        </div>
                        <div style={{marginTop:10, display:'flex', gap:10}}>
                            <button type="button" className="btn-small primary" onClick={() => setEditingUser({...editingUser, custom_expiration: ''})}>
                                ♾️ Vitalício
                            </button>
                            <button type="button" className="btn-small danger" onClick={() => setEditingUser({...editingUser, custom_expiration: 'remover'})}>
                                <Trash2 size={14}/> Remover Data
                            </button>
                        </div>
                    </div>

                    <div className="modal-actions" style={{borderTop:'1px solid #333', paddingTop:'15px', marginTop:'10px'}}>
                        <button type="button" className="btn-cancel" onClick={() => setShowUserModal(false)}>Cancelar</button>
                        <button type="submit" className="btn-save">Salvar Alterações</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}
