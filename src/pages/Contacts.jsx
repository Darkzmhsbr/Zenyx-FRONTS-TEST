import React, { useEffect, useState } from 'react';
import { crmService, remarketingService } from '../services/api'; 
import { useBot } from '../context/BotContext';
import { Users, CheckCircle, Clock, XCircle, RefreshCw, Hash, Calendar, Edit, Send, Zap, Shield, Trash2, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/Button';
import Swal from 'sweetalert2';
import './Contacts.css';

export function Contacts() {
  const { selectedBot } = useBot();
  const [contacts, setContacts] = useState([]);
  const [leads, setLeads] = useState([]); // 🔥 NOVO: Para leads
  const [filter, setFilter] = useState('todos');
  const [loading, setLoading] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [perPage] = useState(50);

  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [campaignHistory, setCampaignHistory] = useState([]);

  useEffect(() => {
    if (selectedBot) {
        carregarContatos();
        carregarHistoricoCampanhas();
    }
  }, [selectedBot, filter, currentPage]);

  // 🔥 MODIFICADO: Busca leads também quando filtro = 'todos'
  const carregarContatos = async () => {
    if (!selectedBot) return;
    setLoading(true);
    try {
      if (filter === 'todos') {
        // Buscar PEDIDOS + LEADS
        const [pedidosRes, leadsRes] = await Promise.all([
          crmService.getContacts(selectedBot.id, 'todos', currentPage, perPage),
          crmService.getLeads(selectedBot.id, currentPage, perPage)
        ]);
        
        setContacts(Array.isArray(pedidosRes.data) ? pedidosRes.data : []);
        setLeads(Array.isArray(leadsRes.data) ? leadsRes.data : []);
        
        const total = (pedidosRes.total || 0) + (leadsRes.total || 0);
        setTotalCount(total);
        setTotalPages(Math.ceil(total / perPage));
      } else {
        // Buscar apenas PEDIDOS
        const response = await crmService.getContacts(selectedBot.id, filter, currentPage, perPage);
        
        setContacts(Array.isArray(response.data) ? response.data : []);
        setLeads([]);
        setTotalCount(response.total || 0);
        setTotalPages(response.total_pages || 1);
      }
    } catch (error) {
      console.error("Erro ao listar contatos", error);
      setContacts([]);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const carregarHistoricoCampanhas = async () => {
    if(!selectedBot) return;
    try {
        const hist = await remarketingService.getHistory(selectedBot.id);
        setCampaignHistory(Array.isArray(hist.data) ? hist.data.slice(0, 3) : []);
    } catch (e) {
        console.error("Erro ao carregar histórico", e);
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const openUserEdit = (user) => {
      setEditingUser({
          id: user.id,
          telegram_id: user.telegram_id,
          name: user.first_name || 'Sem nome',
          username: user.username,
          status: user.status,
          role: user.role || 'user',
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
          Swal.fire({title: 'Salvo!', text: 'Usuário atualizado', icon: 'success', background: '#151515', color: '#fff'});
          setShowUserModal(false);
          carregarContatos();
      } catch (error) {
          Swal.fire('Erro', 'Falha ao salvar usuário', 'error');
      }
  };

  const handleIndividualCampaign = async (historyId) => {
      try {
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

  const formatDate = (dateString) => {
      if (!dateString) return '-';
      return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status) => {
    if (['paid', 'active', 'approved'].includes(status)) return <span className="status-badge status-paid"><CheckCircle size={12}/> Ativo</span>;
    if (status === 'expired') return <span className="status-badge status-expired"><XCircle size={12}/> Expirado</span>;
    if (status === 'pending') return <span className="status-badge status-pending"><Clock size={12}/> Pendente</span>;
    return <span className="status-badge">{status}</span>;
  };

  return (
    <div className="contacts-page">
      <div className="contacts-header">
        <div>
          <h1><Users size={28} style={{verticalAlign: 'middle', marginRight: '10px'}}/>Contatos ({totalCount})</h1>
          <p style={{fontSize: '0.9rem', color: 'var(--muted-foreground)', marginTop: '5px'}}>
            {selectedBot ? `Bot: ${selectedBot.nome}` : 'Selecione um bot'}
          </p>
        </div>
        <Button onClick={carregarContatos} disabled={loading}>
          <RefreshCw size={18} className={loading ? 'spin' : ''} />
          Atualizar
        </Button>
      </div>

      <div className="filters-bar">
        <button className={`filter-tab ${filter === 'todos' ? 'active' : ''}`} onClick={() => handleFilterChange('todos')}>
          TODOS
        </button>
        <button className={`filter-tab ${filter === 'pagantes' ? 'active' : ''}`} onClick={() => handleFilterChange('pagantes')}>
          PAGANTES
        </button>
        <button className={`filter-tab ${filter === 'pendentes' ? 'active' : ''}`} onClick={() => handleFilterChange('pendentes')}>
          PENDENTES
        </button>
        <button className={`filter-tab ${filter === 'expirados' ? 'active' : ''}`} onClick={() => handleFilterChange('expirados')}>
          EXPIRADOS
        </button>
      </div>

      <div className="table-wrapper">
        <table className="contacts-table">
          <thead>
            <tr>
              <th>USUÁRIO</th>
              <th>PLANO / VALOR</th>
              <th>STATUS</th>
              <th>CARGO</th>
              <th>EXPIRAÇÃO</th>
              <th>AÇÃO</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{textAlign: 'center', padding: '40px'}}>
                  <RefreshCw size={24} className="spin" style={{margin: '0 auto 10px'}} />
                  <p>Carregando...</p>
                </td>
              </tr>
            ) : (
              <>
                {contacts.map(contact => (
                  <tr key={contact.id}>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">{(contact.first_name || 'S')[0].toUpperCase()}</div>
                        <div>
                          <div className="user-name">{contact.first_name || 'Sem nome'}</div>
                          <div className="user-username">@{contact.username || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="plan-info">
                        <div className="plan-name">{contact.plano_nome || '-'}</div>
                        <div className="plan-price">
                          {contact.valor ? `R$ ${contact.valor.toFixed(2)}` : '-'}
                        </div>
                      </div>
                    </td>
                    <td>{getStatusBadge(contact.status)}</td>
                    <td>{contact.role === 'admin' ? 'Admin' : 'Usuário'}</td>
                    <td>{formatDate(contact.custom_expiration || contact.data_expiracao)}</td>
                    <td>
                      <Button size="sm" variant="ghost" onClick={() => openUserEdit(contact)}>
                        <Edit size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}

                {/* 🔥 RENDERIZAR LEADS (só no filtro TODOS) */}
                {filter === 'todos' && leads.map(lead => (
                  <tr key={`lead-${lead.id}`}>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">{(lead.nome || 'S')[0].toUpperCase()}</div>
                        <div>
                          <div className="user-name">{lead.nome || 'Sem nome'}</div>
                          <div className="user-username">@{lead.username || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="plan-info">
                        <div className="plan-name">-</div>
                        <div className="plan-price">-</div>
                      </div>
                    </td>
                    <td>
                      <span className="status-badge" style={{
                        background: 'rgba(59, 130, 246, 0.1)',
                        color: '#3b82f6',
                        border: '1px solid rgba(59, 130, 246, 0.3)'
                      }}>
                        ❄️ LEAD FRIO
                      </span>
                    </td>
                    <td>Usuário</td>
                    <td>-</td>
                    <td>
                      <Button size="sm" variant="ghost" disabled>
                        <Edit size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}

                {contacts.length === 0 && leads.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{textAlign: 'center', padding: '40px', color: '#888'}}>
                      Nenhum contato encontrado
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <Button variant="ghost" onClick={prevPage} disabled={currentPage === 1}>
            <ChevronLeft size={18} />
            Anterior
          </Button>
          <span>Página {currentPage} de {totalPages}</span>
          <Button variant="ghost" onClick={nextPage} disabled={currentPage === totalPages}>
            Próxima
            <ChevronRight size={18} />
          </Button>
        </div>
      )}

      {showUserModal && editingUser && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Usuário</h3>
              <span className="user-id-badge">ID: {editingUser.telegram_id} • {editingUser.name}</span>
              <button className="modal-close" onClick={() => setShowUserModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveUser}>
              {campaignHistory.length > 0 && (
                <div className="quick-campaign-section">
                  <h4 style={{marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <Send size={16} /> Enviar Campanha Rápida
                  </h4>
                  <div className="campaign-history-quick">
                    {campaignHistory.map((camp) => (
                      <div key={camp.id} className="campaign-item-mini">
                        <span className="campaign-date-mini">
                          {camp.data_envio ? new Date(camp.data_envio).toLocaleDateString('pt-BR') : camp.data}
                        </span>
                        <span className="campaign-target-mini">{camp.target?.toUpperCase() || 'TODOS'}</span>
                        <Button size="sm" style={{fontSize:'0.7rem', padding:'4px 8px'}} onClick={() => handleIndividualCampaign(camp.id)}>
                          Enviar
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Cargo</label>
                <select value={editingUser.role} onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}>
                  <option value="user">Usuário</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select value={editingUser.status} onChange={(e) => setEditingUser({...editingUser, status: e.target.value})}>
                  <option value="paid">Ativo</option>
                  <option value="pending">Pendente</option>
                  <option value="expired">Expirado</option>
                </select>
              </div>

              <div className="form-group">
                <label>Data de Expiração</label>
                <input 
                  type="date" 
                  value={editingUser.custom_expiration} 
                  onChange={(e) => setEditingUser({...editingUser, custom_expiration: e.target.value})}
                />
                <div style={{display: 'flex', gap: '10px', marginTop: '8px'}}>
                  <Button type="button" size="sm" onClick={() => setEditingUser({...editingUser, custom_expiration: '9999-12-31'})}>
                    ♾️ Vitalício
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setEditingUser({...editingUser, custom_expiration: ''})}>
                    🗑️ Remover Data
                  </Button>
                </div>
              </div>

              <div className="modal-footer">
                <Button type="button" variant="ghost" onClick={() => setShowUserModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}