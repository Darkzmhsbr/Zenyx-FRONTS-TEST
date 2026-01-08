import React, { useEffect, useState } from 'react';
import { crmService, remarketingService } from '../services/api'; 
import { useBot } from '../context/BotContext';
import { Users, CheckCircle, Clock, XCircle, RefreshCw, Hash, Calendar, Send, Edit, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/Button';
import Swal from 'sweetalert2';
import './Contacts.css';

export function Contacts() {
  const { selectedBot } = useBot();
  const [contactsData, setContactsData] = useState([]); // Array final de usuários
  const [loading, setLoading] = useState(false);
  
  const [filter, setFilter] = useState('todos');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  
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
      // Passa o ID do bot selecionado
      const data = await crmService.getContacts(selectedBot.id, filter, page);
      
      // CORREÇÃO: O backend retorna { users: [...], total: ... }
      if (data && data.users) {
          setContactsData(data.users);
          setTotalPages(data.pages || 1);
          setTotalRecords(data.total || 0);
      } else if (Array.isArray(data)) {
          setContactsData(data); // Fallback caso a API mude
      } else {
          setContactsData([]);
      }
    } catch (error) {
      console.error(error);
      setContactsData([]);
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
          // Formata a data para o input HTML YYYY-MM-DD
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
          Swal.fire('Sucesso', 'Usuário atualizado!', 'success');
          setShowUserModal(false);
          carregarContatos(); 
      } catch (error) {
          Swal.fire('Erro', 'Falha ao atualizar.', 'error');
      }
  };

  const handleResendAccess = async () => {
      try {
          await crmService.resendAccess(editingUser.id);
          Swal.fire('Enviado!', 'Acesso reenviado.', 'success');
      } catch (error) {
          Swal.fire('Erro', 'Falha ao enviar.', 'error');
      }
  };

  // Funções Visuais
  const formatDate = (dateString) => {
      if (!dateString) return '-';
      return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="contacts-container">
      <div className="contacts-header">
        <h1>Base de Usuários <span style={{fontSize:'0.9rem', color:'#666'}}>({totalRecords})</span></h1>
        <Button onClick={carregarContatos} variant="outline"><RefreshCw size={16}/></Button>
      </div>

      <div className="tabs-container">
          {['todos', 'pagantes', 'pendentes', 'expirados'].map(f => (
              <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => {setFilter(f); setPage(1);}}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
          ))}
      </div>

      {loading ? <div style={{textAlign:'center', padding:'40px', color:'#666'}}>Carregando...</div> : (
        <>
            <div className="table-responsive">
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>Usuário</th>
                            <th>Plano / Valor</th>
                            <th>Status</th>
                            <th>Entrada</th>
                            <th>Expiração</th> {/* COLUNA NOVA */}
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contactsData.length > 0 ? contactsData.map(u => (
                            <tr key={u.id}>
                                <td>
                                    <div style={{fontWeight:'bold', color:'#fff'}}>{u.first_name || u.telegram_id}</div>
                                    <div style={{fontSize:'0.8rem', color:'#666'}}>@{u.username || '...'}</div>
                                </td>
                                <td>
                                    <div style={{fontSize:'0.85rem'}}>{u.plano_nome || '-'}</div>
                                    <div style={{fontWeight:'bold'}}>R$ {u.valor ? u.valor.toFixed(2) : '0.00'}</div>
                                </td>
                                <td>
                                    {['active','paid'].includes(u.status) && <span className="badge success">Ativo</span>}
                                    {u.status === 'pending' && <span className="badge warning">Pendente</span>}
                                    {u.status === 'expired' && <span className="badge danger">Expirado</span>}
                                </td>
                                <td>{formatDate(u.created_at)}</td>
                                
                                {/* LÓGICA DE EXIBIÇÃO DA EXPIRAÇÃO */}
                                <td>
                                    {['active','paid'].includes(u.status) 
                                        ? (u.custom_expiration ? formatDate(u.custom_expiration) : <span style={{color:'#10b981'}}>Vitalício</span>) 
                                        : '-'}
                                </td>
                                
                                <td>
                                    <Button size="sm" onClick={() => openUserEdit(u)} style={{background:'#252525', border:'1px solid #333'}}>
                                        <Edit size={14}/>
                                    </Button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="6" style={{textAlign:'center', padding:'30px', color:'#666'}}>Nenhum contato encontrado.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
                <div className="pagination-controls" style={{display:'flex', justifyContent:'space-between', marginTop:'20px'}}>
                    <Button disabled={page === 1} onClick={handlePrevPage}><ChevronLeft size={16}/> Anterior</Button>
                    <span style={{color:'#888'}}>Página {page} de {totalPages}</span>
                    <Button disabled={page >= totalPages} onClick={handleNextPage}>Próximo <ChevronRight size={16}/></Button>
                </div>
            )}
        </>
      )}

      {/* MODAL DE EDIÇÃO */}
      {showUserModal && editingUser && (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Gerenciar: {editingUser.name}</h2>
                <form onSubmit={handleSaveUser}>
                    <div className="form-group">
                        <label>Status</label>
                        <select className="input-field" value={editingUser.status} onChange={e => setEditingUser({...editingUser, status: e.target.value})}>
                            <option value="pending">Pendente</option>
                            <option value="paid">Ativo / Pago</option>
                            <option value="expired">Expirado</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Data de Expiração</label>
                        <input 
                            type="date" 
                            className="input-field" 
                            value={editingUser.custom_expiration} 
                            onChange={e => setEditingUser({...editingUser, custom_expiration: e.target.value})} 
                        />
                        <div style={{marginTop:'10px', display:'flex', gap:'10px'}}>
                            <button type="button" className="btn-small" onClick={() => setEditingUser({...editingUser, custom_expiration: ''})}>♾️ Vitalício</button>
                            <button type="button" className="btn-small primary" onClick={handleResendAccess}>📧 Reenviar Acesso</button>
                        </div>
                    </div>

                    <div className="modal-actions" style={{marginTop:'20px'}}>
                        <button type="button" className="btn-cancel" onClick={() => setShowUserModal(false)}>Fechar</button>
                        <button type="submit" className="btn-save">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}