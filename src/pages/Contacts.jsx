import React, { useEffect, useState } from 'react';
import { crmService, remarketingService } from '../services/api'; 
import { useBot } from '../context/BotContext';
import { Users, CheckCircle, Clock, XCircle, RefreshCw, Hash, Calendar, Edit, Send } from 'lucide-react';
import { Button } from '../components/Button';
import Swal from 'sweetalert2';
import './Contacts.css'; // Usa o CSS da V1

export function Contacts() {
  const { selectedBot } = useBot();
  const [allContacts, setAllContacts] = useState([]); 
  const [filteredContacts, setFilteredContacts] = useState([]); 
  const [filter, setFilter] = useState('todos');
  const [loading, setLoading] = useState(false);

  // Estados do Modal (Igual V1)
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    if (selectedBot) {
        carregarContatos();
    }
  }, [selectedBot]); // Recarrega quando muda o bot

  useEffect(() => {
    aplicarFiltro();
  }, [filter, allContacts]);

  const carregarContatos = async () => {
    if (!selectedBot) return;
    setLoading(true);
    try {
      // CORREÇÃO: Passa selectedBot.id para filtrar no backend
      const data = await crmService.getContacts(selectedBot.id, 'todos'); 
      
      // O backend V1 retorna array direto, então usamos direto
      setAllContacts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao listar contatos", error);
      setAllContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltro = () => {
    if (filter === 'todos') {
        setFilteredContacts(allContacts);
    } else if (filter === 'pagantes') {
        // Filtra localmente quem é paid ou active
        setFilteredContacts(allContacts.filter(c => c.status === 'paid' || c.status === 'active'));
    } else {
        setFilteredContacts(allContacts.filter(c => c.status === filter)); // pending, expired
    }
  };

  // --- MODAL & EDIÇÃO ---
  const openUserEdit = (user) => {
      setEditingUser({
          id: user.id,
          name: user.first_name || 'Sem nome',
          status: user.status,
          // Pega a custom_expiration do banco se existir
          custom_expiration: user.custom_expiration ? new Date(user.custom_expiration).toISOString().split('T')[0] : ''
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
          Swal.fire('Sucesso', 'Atualizado!', 'success');
          setShowUserModal(false);
          carregarContatos();
      } catch (error) { Swal.fire('Erro', 'Falha ao salvar.', 'error'); }
  };

  const handleResendAccess = async () => {
      try {
          await crmService.resendAccess(editingUser.id);
          Swal.fire('Enviado!', 'Acesso reenviado.', 'success');
      } catch (error) { Swal.fire('Erro', 'Falha ao enviar.', 'error'); }
  };

  // Helpers Visuais
  const formatDate = (dateString) => {
      if (!dateString) return '-';
      return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status) => {
    if (status === 'paid' || status === 'active') return <span className="status-badge status-paid"><CheckCircle size={12}/> Ativo</span>;
    if (status === 'expired') return <span className="status-badge status-expired"><XCircle size={12}/> Expirado</span>;
    return <span className="status-badge status-pending"><Clock size={12}/> Pendente</span>;
  };

  if (!selectedBot) return <div className="contacts-container"><p style={{textAlign:'center', marginTop:50, color:'#666'}}>Selecione um bot.</p></div>;

  return (
    <div className="contacts-container">
      <div className="contacts-header">
        <h1>Contatos <span style={{fontSize:'0.9rem', color:'#666'}}>({allContacts.length})</span></h1>
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
                <th>Entrada</th>
                <th>Expiração</th> {/* COLUNA NOVA */}
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.length > 0 ? filteredContacts.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: '600', color: '#fff' }}>{c.first_name || 'Sem nome'}</div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>@{c.username || '...'}</div>
                  </td>
                  <td>
                    <div style={{fontSize:'0.85rem'}}>{c.plano_nome || '-'}</div>
                    <div style={{fontWeight:'bold'}}>R$ {c.valor ? c.valor.toFixed(2) : '0.00'}</div>
                  </td>
                  <td>{getStatusBadge(c.status)}</td>
                  <td>{formatDate(c.created_at)}</td>
                  
                  {/* DADO DA EXPIRAÇÃO */}
                  <td>
                    {['paid','active'].includes(c.status) 
                        ? (c.custom_expiration ? formatDate(c.custom_expiration) : <span style={{color:'#10b981'}}>Vitalício</span>) 
                        : '-'}
                  </td>
                  
                  <td>
                    <Button size="sm" onClick={() => openUserEdit(c)}><Edit size={14}/></Button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="6" style={{textAlign:'center', padding:'30px', color:'#666'}}>Vazio.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showUserModal && editingUser && (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Gerenciar: {editingUser.name}</h2>
                <form onSubmit={handleSaveUser}>
                    <div className="form-group">
                        <label>Status</label>
                        <select className="input-field" value={editingUser.status} onChange={e => setEditingUser({...editingUser, status: e.target.value})}>
                            <option value="pending">Pendente</option>
                            <option value="paid">Ativo</option>
                            <option value="expired">Expirado</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Data de Expiração</label>
                        <input type="date" className="input-field" value={editingUser.custom_expiration} onChange={e => setEditingUser({...editingUser, custom_expiration: e.target.value})}/>
                        <div style={{marginTop:10, display:'flex', gap:10}}>
                            <button type="button" className="btn-small" onClick={() => setEditingUser({...editingUser, custom_expiration: ''})}>Vitalício</button>
                            <button type="button" className="btn-small primary" onClick={handleResendAccess}>Reenviar Acesso</button>
                        </div>
                    </div>
                    <div className="modal-actions">
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