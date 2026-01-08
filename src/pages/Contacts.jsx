import React, { useEffect, useState } from 'react';
import { crmService, remarketingService } from '../services/api'; 
import { useBot } from '../context/BotContext';
import { Users, CheckCircle, Clock, XCircle, RefreshCw, Hash, Calendar, Send, ChevronLeft, ChevronRight, Edit } from 'lucide-react';
import { Button } from '../components/Button';
import Swal from 'sweetalert2';
import './Contacts.css';

export function Contacts() {
  const { selectedBot } = useBot();
  const [allContacts, setAllContacts] = useState([]); // Todos os contatos vindos da API
  const [filteredContacts, setFilteredContacts] = useState([]); // Contatos filtrados na tela
  const [filter, setFilter] = useState('todos');
  const [loading, setLoading] = useState(false);
  
  // Modal e Histórico
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [rmktHistory, setRmktHistory] = useState([]);

  useEffect(() => {
    if (selectedBot) {
      carregarContatos();
      // Carrega histórico para o "Envio Rápido"
      remarketingService.getHistory(selectedBot.id).then(setRmktHistory).catch(() => {});
    }
  }, [selectedBot]);

  // Filtro Local (Lógica Restaurada)
  useEffect(() => {
    aplicarFiltro();
  }, [filter, allContacts]);

  const carregarContatos = async () => {
    setLoading(true);
    try {
      // CORREÇÃO: Agora passa o ID do bot corretamente
      const data = await crmService.getContacts(selectedBot.id);
      
      // CORREÇÃO: O backend novo retorna { users: [...] }, a versão antiga esperava [...]
      // Aqui adaptamos para ler .users se existir, ou o data direto se for array
      const listaUsuarios = data.users || (Array.isArray(data) ? data : []);
      
      setAllContacts(listaUsuarios);
    } catch (error) {
      console.error(error);
      Swal.fire('Erro', 'Falha ao carregar contatos.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltro = () => {
    if (filter === 'todos') {
      setFilteredContacts(allContacts);
    } else {
      // Mapeamento de status do banco para o filtro
      const filtered = allContacts.filter(u => {
        if (filter === 'active') return ['active', 'paid', 'approved'].includes(u.status);
        if (filter === 'pendente') return u.status === 'pending';
        if (filter === 'expired') return u.status === 'expired';
        return true;
      });
      setFilteredContacts(filtered);
    }
  };

  const openUserEdit = (user) => {
      setEditingUser({
          id: user.id,
          name: user.first_name || user.telegram_id,
          telegram_id: user.telegram_id,
          status: user.status,
          // Formata data YYYY-MM-DD para o input
          custom_expiration: user.expiration_date ? new Date(user.expiration_date).toISOString().split('T')[0] : ''
      });
      setShowUserModal(true);
  };

  const handleSaveUser = async (e) => {
      e.preventDefault();
      try {
          await crmService.updateUser(editingUser.id, {
              status: editingUser.status,
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

  // Envio Rápido (Lógica Simplificada)
  const handleReuseForUser = async (campaign) => {
      let config = {};
      try { config = JSON.parse(campaign.config); } catch(e){}
      
      const payload = {
          bot_id: selectedBot.id,
          tipo_envio: 'individual',
          specific_user_id: editingUser.telegram_id,
          mensagem: config.msg,
          media_url: config.media,
          incluir_oferta: config.offer,
          plano_oferta_id: config.plano_id,
          valor_oferta: config.promo_price
      };

      try {
          await remarketingService.send(payload);
          Swal.fire('Sucesso', 'Mensagem enviada!', 'success');
      } catch (e) { Swal.fire('Erro', 'Falha no envio.', 'error'); }
  };

  return (
    <div className="contacts-container">
      <div className="contacts-header">
        <h1>Contatos <span style={{fontSize:'0.9rem', color:'#666'}}>({allContacts.length})</span></h1>
        <Button onClick={carregarContatos} variant="outline"><RefreshCw size={16}/></Button>
      </div>

      <div className="tabs-container">
          {['todos', 'pendente', 'active', 'expired'].map(f => (
              <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                  {f.toUpperCase()}
              </button>
          ))}
      </div>

      {loading ? <p>Carregando...</p> : (
        <div className="table-responsive">
            <table className="custom-table">
                <thead>
                    <tr>
                        <th>Usuário</th>
                        <th>Status</th>
                        <th>Entrada</th>
                        <th>Expiração</th> {/* COLUNA NOVA */}
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredContacts.length > 0 ? filteredContacts.map(u => (
                        <tr key={u.id}>
                            <td>
                                <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                                    <Users size={16} color="#888"/>
                                    {u.first_name || u.telegram_id}
                                </div>
                            </td>
                            <td>
                                {['active','paid','approved'].includes(u.status) && <span className="badge success">Ativo</span>}
                                {u.status === 'pending' && <span className="badge warning">Pendente</span>}
                                {u.status === 'expired' && <span className="badge danger">Expirado</span>}
                            </td>
                            <td>{new Date(u.created_at).toLocaleDateString()}</td>
                            
                            {/* COLUNA EXPIRAÇÃO - DADOS */}
                            <td>
                                {(['active','paid','approved'].includes(u.status))
                                    ? (u.expiration_date ? new Date(u.expiration_date).toLocaleDateString() : <span style={{color:'#10b981'}}>Vitalício</span>) 
                                    : '-'}
                            </td>
                            
                            <td>
                                <Button size="sm" onClick={() => openUserEdit(u)} style={{fontSize:'0.8rem'}}>
                                    <Edit size={14}/>
                                </Button>
                            </td>
                        </tr>
                    )) : (
                        <tr><td colSpan="5" style={{textAlign:'center', padding:'20px', color:'#666'}}>Nenhum contato encontrado.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
      )}

      {/* MODAL DE EDIÇÃO */}
      {showUserModal && editingUser && (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Gerenciar: {editingUser.name}</h2>
                
                <form onSubmit={handleSaveUser}>
                    <div className="form-group">
                        <label>Status</label>
                        <select 
                            className="input-field" 
                            value={editingUser.status} 
                            onChange={e => setEditingUser({...editingUser, status: e.target.value})}
                        >
                            <option value="pending">Pendente</option>
                            <option value="active">Ativo</option>
                            <option value="expired">Expirado</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Expiração (Data)</label>
                        <input 
                            type="date" 
                            className="input-field"
                            value={editingUser.custom_expiration} 
                            onChange={e => setEditingUser({...editingUser, custom_expiration: e.target.value})}
                        />
                        <div style={{display:'flex', gap:'10px', marginTop:'10px'}}>
                            <button type="button" className="btn-small" onClick={() => setEditingUser({...editingUser, custom_expiration: ''})}>♾️ Vitalício</button>
                            <button type="button" className="btn-small primary" onClick={handleResendAccess}>Reenviar Acesso</button>
                        </div>
                    </div>

                    {/* DISPARO RÁPIDO */}
                    <div style={{marginTop:'20px', borderTop:'1px solid #333', paddingTop:'15px'}}>
                        <h3>🚀 Envio Rápido</h3>
                        <div style={{maxHeight:'100px', overflowY:'auto', border:'1px solid #333', borderRadius:'6px'}}>
                            {rmktHistory.map((h, i) => (
                                <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'8px', borderBottom:'1px solid #222'}}>
                                    <span style={{fontSize:'0.75rem', color:'#ccc'}}>{h.data}</span>
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