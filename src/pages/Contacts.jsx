import React, { useEffect, useState } from 'react';
import { crmService, remarketingService, admin } from '../services/api'; 
import { useBot } from '../context/BotContext';
import { Users, CheckCircle, Clock, XCircle, RefreshCw, Send, ChevronLeft, ChevronRight, Edit } from 'lucide-react';
import { Button } from '../components/Button';
import Swal from 'sweetalert2';
import './Contacts.css';

export function Contacts() {
  const { selectedBot } = useBot();
  const [contactsData, setContactsData] = useState([]); 
  const [loading, setLoading] = useState(false);
  
  // --- PAGINAÇÃO E FILTROS ---
  const [filter, setFilter] = useState('todos');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  
  // --- MODAL E HISTÓRICO ---
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [rmktHistory, setRmktHistory] = useState([]);

  useEffect(() => {
    if (selectedBot) {
      carregarContatos();
      remarketingService.getHistory(selectedBot.id).then(setRmktHistory).catch(() => {});
    }
  }, [selectedBot, filter, page]);

  const carregarContatos = async () => {
    setLoading(true);
    try {
      const data = await crmService.getContacts(selectedBot.id, filter, page);
      setContactsData(data.users || []); 
      setTotalPages(data.total_pages || 1);
      setTotalRecords(data.total_records || 0);
    } catch (error) {
      console.error(error);
      Swal.fire('Erro', 'Falha ao carregar contatos.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- PAGINAÇÃO ---
  const handleNextPage = () => { if (page < totalPages) setPage(page + 1); };
  const handlePrevPage = () => { if (page > 1) setPage(page - 1); };

  // --- ABRIR MODAL DE EDIÇÃO ---
  const openUserEdit = (user) => {
      setEditingUser({
          id: user.id,
          name: user.first_name || user.telegram_id,
          telegram_id: user.telegram_id,
          role: user.role || 'user', 
          status: user.status,
          custom_expiration: user.expiration_date ? user.expiration_date.split('T')[0] : ''
      });
      setShowUserModal(true);
  };

  // --- SALVAR EDIÇÃO DO USUÁRIO ---
  const handleSaveUser = async (e) => {
      e.preventDefault();
      try {
          const payload = {
              status: editingUser.status,
              role: editingUser.role,
              custom_expiration: editingUser.custom_expiration || null
          };
          
          await admin.updateUser(editingUser.id, payload); 

          Swal.fire('Sucesso', 'Usuário atualizado!', 'success');
          setShowUserModal(false);
          carregarContatos(); 
      } catch (error) {
          Swal.fire('Erro', 'Falha ao atualizar usuário.', 'error');
      }
  };

  // --- REENVIAR ACESSO ---
  const handleResendAccess = async () => {
      try {
          await admin.resendAccess(editingUser.id);
          Swal.fire('Enviado!', 'Links de acesso reenviados!', 'success');
      } catch (error) {
          Swal.fire('Erro', 'Falha ao reenviar acesso.', 'error');
      }
  };

  // --- NOVA FUNÇÃO: REUTILIZAR CAMPANHA PARA 1 USUÁRIO ---
  const handleReuseForUser = async (campaign) => {
      let config = {};
      try { config = typeof campaign.config === 'object' ? campaign.config : JSON.parse(campaign.config); } catch(e){}

      const confirm = await Swal.fire({
          title: `Enviar para ${editingUser.name}?`,
          text: `Enviar campanha "${config.msg?.substring(0,15)}..." apenas para este usuário?`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: '🚀 Sim, Enviar',
          background: '#151515', color: '#fff'
      });

      if (confirm.isConfirmed) {
          const payload = {
              bot_id: selectedBot.id,
              tipo_envio: 'individual',
              specific_user_id: editingUser.telegram_id, 
              mensagem: config.msg,
              media_url: config.media || null,
              incluir_oferta: config.offer,
              plano_oferta_id: config.plano_id || null,
              valor_oferta: config.promo_price || 0,
              expire_timestamp: 0 
          };

          Swal.fire({ title: 'Enviando...', background: '#151515', color:'#fff', didOpen: () => Swal.showLoading() });
          try {
              await remarketingService.send(payload);
              Swal.fire({title:'Sucesso!', text:'Enviado individualmente.', icon:'success', background:'#151515', color:'#fff'});
          } catch (e) {
              Swal.fire('Erro', 'Falha ao enviar.', 'error');
          }
      }
  };

  return (
    <div className="contacts-container">
      <div className="contacts-header">
        <h1>Gerenciador de Contatos</h1>
        <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
            <span style={{color:'#888', fontSize:'0.9rem'}}>Total: {totalRecords}</span>
            <Button onClick={carregarContatos} variant="outline"><RefreshCw size={16}/></Button>
        </div>
      </div>

      {/* ABAS DE FILTRO */}
      <div className="tabs-container">
          {['todos', 'pendente', 'active', 'expired'].map(f => (
              <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => {setFilter(f); setPage(1);}}>
                  {f.toUpperCase()}
              </button>
          ))}
      </div>

      {loading ? <p className="loading-text">Carregando contatos...</p> : (
        <>
            <div className="table-responsive">
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>Usuário</th>
                            <th>Status</th>
                            <th>Data Entrada</th>
                            <th>Expiração</th> {/* COLUNA NOVA AQUI */}
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contactsData.length > 0 ? contactsData.map(u => (
                            <tr key={u.id}>
                                <td>
                                    <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                                        <Users size={16} color="#888"/>
                                        {u.first_name || u.telegram_id}
                                    </div>
                                </td>
                                <td>
                                    {u.status === 'active' && <span className="badge success"><CheckCircle size={12}/> Ativo</span>}
                                    {u.status === 'paid' && <span className="badge success"><CheckCircle size={12}/> Pago</span>}
                                    {u.status === 'pending' && <span className="badge warning"><Clock size={12}/> Pendente</span>}
                                    {u.status === 'expired' && <span className="badge danger"><XCircle size={12}/> Expirado</span>}
                                </td>
                                <td>{new Date(u.created_at).toLocaleDateString()}</td>
                                
                                {/* COLUNA EXPIRAÇÃO (DADOS) */}
                                <td>
                                    {u.status === 'active' || u.status === 'paid'
                                        ? (u.expiration_date ? new Date(u.expiration_date).toLocaleDateString() : <span style={{color:'#10b981'}}>Vitalício</span>) 
                                        : '-'}
                                </td>
                                
                                <td>
                                    <Button size="sm" onClick={() => openUserEdit(u)} style={{fontSize:'0.8rem'}}>
                                        <Edit size={14} style={{marginRight:'5px'}}/> Gerenciar
                                    </Button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="5" style={{textAlign:'center', padding:'20px', color:'#666'}}>Nenhum contato encontrado.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* PAGINAÇÃO */}
            <div className="pagination-controls" style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'20px'}}>
                <Button disabled={page === 1} onClick={handlePrevPage} variant="outline">
                    <ChevronLeft size={16}/> Anterior
                </Button>
                <span style={{color:'#888'}}>Página {page} de {totalPages}</span>
                <Button disabled={page >= totalPages} onClick={handleNextPage} variant="outline">
                    Próximo <ChevronRight size={16}/>
                </Button>
            </div>
        </>
      )}

      {/* MODAL DE EDIÇÃO */}
      {showUserModal && editingUser && (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Gerenciar: {editingUser.name}</h2>
                
                <form onSubmit={handleSaveUser}>
                    <div className="form-group">
                        <label>Status do Usuário</label>
                        <select 
                            className="input-field" 
                            value={editingUser.status} 
                            onChange={e => setEditingUser({...editingUser, status: e.target.value})}
                        >
                            <option value="pending">Pendente (Aguardando Pagamento)</option>
                            <option value="active">Ativo (Pago/Acesso Liberado)</option>
                            <option value="expired">Expirado (Sem Acesso)</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Data Personalizada (Expiração)</label>
                        <input 
                            type="date" 
                            className="input-field"
                            value={editingUser.custom_expiration} 
                            onChange={e => setEditingUser({...editingUser, custom_expiration: e.target.value})}
                        />
                        <div style={{display:'flex', gap:'10px', marginTop:'10px'}}>
                            <button type="button" className="btn-small" onClick={() => setEditingUser({...editingUser, custom_expiration: ''})}>♾️ Vitalício</button>
                            <button type="button" className="btn-small primary" onClick={handleResendAccess} style={{background:'#2563eb'}}>📧 Reenviar Acesso</button>
                        </div>
                    </div>

                    {/* ÁREA DE DISPARO INDIVIDUAL */}
                    <div style={{marginTop:'20px', borderTop:'1px solid #333', paddingTop:'15px'}}>
                        <h3>🚀 Disparo Rápido (Individual)</h3>
                        <p style={{fontSize:'0.8rem', color:'#888'}}>Reutilize campanhas anteriores apenas para este usuário.</p>
                        
                        <div style={{maxHeight:'150px', overflowY:'auto', marginTop:'10px', border:'1px solid #333', borderRadius:'6px'}}>
                            {rmktHistory.length > 0 ? rmktHistory.map((h, i) => (
                                <div key={i} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px', borderBottom:'1px solid #222'}}>
                                    <span style={{fontSize:'0.75rem', color:'#ccc'}}>{h.data} - {JSON.parse(h.config || '{}').msg?.substring(0,10)}...</span>
                                    <button type="button" className="btn-mini-send" onClick={() => handleReuseForUser(h)}>
                                        <Send size={10} style={{marginRight:'3px'}}/> Enviar
                                    </button>
                                </div>
                            )) : <p style={{padding:'10px', fontSize:'0.8rem', color:'#666'}}>Sem histórico.</p>}
                        </div>
                    </div>

                    <div className="modal-actions" style={{marginTop:'20px'}}>
                        <button type="button" className="btn-cancel" onClick={() => setShowUserModal(false)}>Fechar</button>
                        <button type="submit" className="btn-save">Salvar Alterações</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}