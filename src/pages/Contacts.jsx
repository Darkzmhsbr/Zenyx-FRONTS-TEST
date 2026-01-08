import React, { useEffect, useState } from 'react';
import { crmService, remarketingService, admin } from '../services/api'; 
import { useBot } from '../context/BotContext';
import { Users, CheckCircle, Clock, XCircle, RefreshCw, Send, Edit, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/Button';
import Swal from 'sweetalert2';
import './Contacts.css';

export function Contacts() {
  const { selectedBot } = useBot();
  const [contactsData, setContactsData] = useState([]); 
  const [loading, setLoading] = useState(false);
  
  // Filtros
  const [filter, setFilter] = useState('todos');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  
  // Modal
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
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => { if (page < totalPages) setPage(page + 1); };
  const handlePrevPage = () => { if (page > 1) setPage(page - 1); };

  const openUserEdit = (user) => {
      setEditingUser({
          id: user.id,
          name: user.first_name || user.telegram_id,
          telegram_id: user.telegram_id,
          role: user.role || 'user', 
          status: user.status,
          // Garante formato YYYY-MM-DD para o input date
          custom_expiration: user.expiration_date ? user.expiration_date.split('T')[0] : ''
      });
      setShowUserModal(true);
  };

  const handleSaveUser = async (e) => {
      e.preventDefault();
      try {
          const payload = {
              status: editingUser.status,
              role: editingUser.role,
              custom_expiration: editingUser.custom_expiration || null
          };
          await admin.updateUser(editingUser.id, payload); 
          Swal.fire('Sucesso', 'Atualizado!', 'success');
          setShowUserModal(false);
          carregarContatos(); 
      } catch (error) {
          Swal.fire('Erro', 'Falha ao atualizar.', 'error');
      }
  };

  const handleResendAccess = async () => {
      try {
          await admin.resendAccess(editingUser.id);
          Swal.fire('Enviado!', 'Acesso reenviado!', 'success');
      } catch (error) {
          Swal.fire('Erro', 'Falha ao enviar.', 'error');
      }
  };

  const handleReuseForUser = async (campaign) => {
      let config = {};
      try { config = typeof campaign.config === 'object' ? campaign.config : JSON.parse(campaign.config); } catch(e){}

      const confirm = await Swal.fire({
          title: `Enviar para ${editingUser.name}?`,
          text: `Enviar campanha "${config.msg?.substring(0,15)}..." apenas para este usuário?`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: '🚀 Sim',
          background: '#151515', color: '#fff'
      });

      if (confirm.isConfirmed) {
          // Sanitização para envio individual
          const payload = {
              bot_id: selectedBot.id,
              tipo_envio: 'individual',
              specific_user_id: editingUser.telegram_id, 
              mensagem: config.msg,
              media_url: config.media || null,
              incluir_oferta: config.offer,
              plano_oferta_id: config.plano_id ? String(config.plano_id) : null,
              valor_oferta: config.promo_price ? parseFloat(config.promo_price) : 0,
              expire_timestamp: 0 
          };

          Swal.fire({ title: 'Enviando...', background: '#151515', color:'#fff', didOpen: () => Swal.showLoading() });
          try {
              await remarketingService.send(payload);
              Swal.fire({title:'Sucesso!', text:'Enviado.', icon:'success', background:'#151515', color:'#fff'});
          } catch (e) {
              Swal.fire('Erro', 'Falha ao enviar.', 'error');
          }
      }
  };

  return (
    <div className="contacts-container">
      <div className="contacts-header">
        <h1>Contatos</h1>
        <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
            <span style={{color:'#888', fontSize:'0.9rem'}}>Total: {totalRecords}</span>
            <Button onClick={carregarContatos} variant="outline"><RefreshCw size={16}/></Button>
        </div>
      </div>

      <div className="tabs-container">
          {['todos', 'pendente', 'active', 'expired'].map(f => (
              <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => {setFilter(f); setPage(1);}}>
                  {f.toUpperCase()}
              </button>
          ))}
      </div>

      {loading ? <p className="loading-text">Carregando...</p> : (
        <>
            <div className="table-responsive">
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>Usuário</th>
                            <th>Status</th>
                            <th>Entrada</th>
                            <th>Expiração</th> {/* COLUNA */}
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contactsData.length > 0 ? contactsData.map(u => (
                            <tr key={u.id}>
                                <td><div style={{display:'flex', gap:'5px'}}><Users size={16}/> {u.first_name || u.telegram_id}</div></td>
                                <td>
                                    {u.status === 'active' && <span className="badge success">Ativo</span>}
                                    {u.status === 'paid' && <span className="badge success">Pago</span>}
                                    {u.status === 'pending' && <span className="badge warning">Pendente</span>}
                                    {u.status === 'expired' && <span className="badge danger">Expirado</span>}
                                </td>
                                <td>{new Date(u.created_at).toLocaleDateString()}</td>
                                {/* DADO EXPIRAÇÃO */}
                                <td>
                                    {(u.status === 'active' || u.status === 'paid')
                                        ? (u.expiration_date ? new Date(u.expiration_date).toLocaleDateString() : <span style={{color:'#10b981'}}>Vitalício</span>) 
                                        : '-'}
                                </td>
                                <td><Button size="sm" onClick={() => openUserEdit(u)}><Edit size={14}/></Button></td>
                            </tr>
                        )) : (
                            <tr><td colSpan="5" style={{textAlign:'center', padding:'20px'}}>Nenhum contato.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="pagination-controls" style={{display:'flex', justifyContent:'space-between', marginTop:'20px'}}>
                <Button disabled={page === 1} onClick={handlePrevPage}><ChevronLeft size={16}/></Button>
                <span>Pag {page} de {totalPages}</span>
                <Button disabled={page >= totalPages} onClick={handleNextPage}><ChevronRight size={16}/></Button>
            </div>
        </>
      )}

      {showUserModal && editingUser && (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{editingUser.name}</h2>
                <form onSubmit={handleSaveUser}>
                    <div className="form-group">
                        <label>Status</label>
                        <select className="input-field" value={editingUser.status} onChange={e => setEditingUser({...editingUser, status: e.target.value})}>
                            <option value="pending">Pendente</option>
                            <option value="active">Ativo</option>
                            <option value="expired">Expirado</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Expiração</label>
                        <input type="date" className="input-field" value={editingUser.custom_expiration} onChange={e => setEditingUser({...editingUser, custom_expiration: e.target.value})} />
                        <div style={{marginTop:'10px', display:'flex', gap:'10px'}}>
                            <button type="button" className="btn-small" onClick={() => setEditingUser({...editingUser, custom_expiration: ''})}>♾️ Vitalício</button>
                            <button type="button" className="btn-small primary" onClick={handleResendAccess}>Reenviar Acesso</button>
                        </div>
                    </div>
                    
                    <div style={{marginTop:'15px', borderTop:'1px solid #333', paddingTop:'10px'}}>
                        <h4>Envio Rápido</h4>
                        <div style={{maxHeight:'100px', overflowY:'auto'}}>
                            {rmktHistory.map((h,i) => (
                                <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'5px', borderBottom:'1px solid #222'}}>
                                    <small>{h.data}</small>
                                    <button type="button" className="btn-mini-send" onClick={() => handleReuseForUser(h)}>Enviar</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="modal-actions" style={{marginTop:'20px'}}>
                        <button type="button" className="btn-cancel" onClick={() => setShowUserModal(false)}>Cancelar</button>
                        <button type="submit" className="btn-save">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}