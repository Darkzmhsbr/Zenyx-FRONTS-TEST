import React, { useEffect, useState } from 'react';
import { crmService, remarketingService } from '../services/api'; 
import { useBot } from '../context/BotContext';
import { Users, CheckCircle, Clock, XCircle, RefreshCw, Hash, Calendar, Send } from 'lucide-react';
import { Button } from '../components/Button';
import Swal from 'sweetalert2';
import './Contacts.css';

export function Contacts() {
  const { selectedBot } = useBot();
  const [allContacts, setAllContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [filter, setFilter] = useState('todos');
  const [loading, setLoading] = useState(false);
  
  // --- ESTADOS DO MODAL DE EDIÇÃO ---
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [rmktHistory, setRmktHistory] = useState([]);

  useEffect(() => {
    if (selectedBot) {
      carregarContatos();
      // Carrega histórico de remarketing em background para o "Envio Rápido"
      remarketingService.getHistory(selectedBot.id).then(setRmktHistory).catch(() => {});
    }
  }, [selectedBot]);

  useEffect(() => {
    aplicarFiltro();
  }, [filter, allContacts]);

  const carregarContatos = async () => {
    setLoading(true);
    try {
      const data = await crmService.getContacts('todos'); 
      setAllContacts(data);
    } catch (error) {
      console.error("Erro ao listar contatos", error);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltro = () => {
    if (filter === 'todos') {
      setFilteredContacts(allContacts);
    } else if (filter === 'pagantes') {
      setFilteredContacts(allContacts.filter(c => c.status === 'paid'));
    } else if (filter === 'pendentes') {
      setFilteredContacts(allContacts.filter(c => c.status === 'pending'));
    } else if (filter === 'expirados') {
      setFilteredContacts(allContacts.filter(c => c.status === 'expired'));
    }
  };

  // --- ABERTURA DO MODAL ---
  const openUserEdit = (user) => {
    setEditingUser({
        id: user.id,
        name: user.first_name || 'Sem Nome',
        telegram_id: user.telegram_id,
        role: user.role || 'user',
        status: user.status,
        custom_expiration: '' // Inicialmente vazio, preencher se tiver
    });
    setShowUserModal(true);
  };

  // --- AÇÕES DO MODAL ---
  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
        const payload = {
            role: editingUser.role,
            status: editingUser.status,
            custom_expiration: editingUser.custom_expiration || null
        };
        
        await crmService.updateUser(editingUser.id, payload);
        Swal.fire({
            title: 'Sucesso', 
            text: 'Usuário atualizado!', 
            icon: 'success', 
            background:'#151515', color:'#fff'
        });
        setShowUserModal(false);
        carregarContatos(); // Recarrega lista
    } catch (error) {
        Swal.fire('Erro', 'Falha ao atualizar usuário.', 'error');
    }
  };

  const handleResendAccess = async () => {
    try {
        await crmService.resendAccess(editingUser.id);
        Swal.fire({
            title: 'Enviado!', 
            text: 'Links de acesso reenviados para o Telegram do usuário!', 
            icon: 'success',
            background:'#151515', color:'#fff'
        });
    } catch (error) {
        Swal.fire('Erro', 'Falha ao reenviar acesso.', 'error');
    }
  };

  const handleReuseForUser = async (campaign) => {
    const config = JSON.parse(campaign.config || '{}');
    
    const result = await Swal.fire({
        title: `Enviar para ${editingUser.name}?`,
        text: `Você vai disparar a campanha antiga "${config.msg?.substring(0, 20)}..." apenas para este usuário.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: '🚀 Sim, Enviar',
        cancelButtonText: 'Cancelar',
        background: '#151515',
        color: '#fff'
    });

    if (result.isConfirmed) {
        // Reconstrói o payload para envio individual
        const payload = {
            bot_id: selectedBot.id,
            target: 'individual', 
            mensagem: config.msg,
            media_url: config.media || null,
            incluir_oferta: config.offer,
            // Tenta recuperar ID do plano e preço (se disponível no histórico novo)
            plano_oferta_id: campaign.plano_id, 
            price_mode: 'custom', 
            custom_price: campaign.promo_price,
            expiration_mode: 'days', // Padrão 1 dia para recuperação
            expiration_value: 1
        };

        try {
            // Usa o specificUserId para direcionar
            await remarketingService.send(payload, false, editingUser.telegram_id);
            Swal.fire('Sucesso!', 'Disparo individual realizado!', 'success');
        } catch (e) {
            Swal.fire('Erro', 'Falha ao enviar.', 'error');
        }
    }
  };

  // --- FUNÇÕES VISUAIS ---
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getStatusBadge = (status) => {
    if (status === 'paid') return <span className="status-badge status-paid"><CheckCircle size={12}/> Ativo</span>;
    if (status === 'expired') return <span className="status-badge status-expired"><XCircle size={12}/> Expirado</span>;
    return <span className="status-badge status-pending"><Clock size={12}/> Pendente</span>;
  };

  if (!selectedBot) return <div className="contacts-container"><div style={{textAlign:'center', marginTop:'100px', color:'#666'}}>Selecione um bot.</div></div>;

  return (
    <div className="contacts-container">
      <div className="contacts-header">
        <div>
          <h1>Base de Usuários</h1>
          <p style={{ color: 'var(--muted-foreground)' }}>Visualize leads, clientes ativos e expirados.</p>
        </div>
        <Button variant="ghost" onClick={carregarContatos}>
          <RefreshCw size={18} className={loading ? 'spin' : ''} />
        </Button>
      </div>

      <div className="tabs-container">
        <div className="filters-bar">
          {['todos', 'pagantes', 'pendentes', 'expirados'].map(t => (
            <button 
                key={t}
                onClick={() => setFilter(t)} 
                className={`filter-tab ${filter === t ? 'active' : ''}`}
            >
                {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#888' }}>
            <RefreshCw className="spin" size={30} style={{marginBottom:'10px'}}/>
            <p>Sincronizando...</p>
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{width: '180px'}}>Data</th>
                <th style={{width: '120px'}}><Hash size={14} style={{marginBottom:-2}}/> ID Telegram</th>
                <th>Nome / Usuário</th>
                <th>Plano</th>
                <th>Valor</th>
                <th style={{textAlign:'center'}}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.length > 0 ? filteredContacts.map((c) => (
                <tr 
                    key={c.id} 
                    onClick={() => openUserEdit(c)} 
                    style={{cursor: 'pointer'}} 
                    className="clickable-row"
                >
                  <td data-label="Data" style={{fontSize:'0.85rem', color:'#888'}}>{formatDate(c.created_at)}</td>
                  <td data-label="ID Telegram"><span className="id-badge">{c.telegram_id}</span></td>
                  <td data-label="Nome / Usuário">
                    <div style={{ fontWeight: '600', color: '#fff' }}>{c.first_name || 'Sem nome'}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>{c.username ? `@${c.username}` : '-'}</div>
                  </td>
                  <td data-label="Plano"><span className="plan-tag">{c.plano_nome || '-'}</span></td>
                  <td data-label="Valor" style={{fontWeight:'bold'}}>{c.valor ? `R$ ${c.valor.toFixed(2)}` : 'R$ 0,00'}</td>
                  <td data-label="Status" style={{textAlign:'center'}}>{getStatusBadge(c.status)}</td>
                </tr>
              )) : (
                <tr><td colSpan="6" style={{ padding: '60px', textAlign: 'center', color: '#666' }}>Nenhum contato encontrado.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div style={{marginTop:'20px', color:'#666', fontSize:'0.8rem', textAlign:'right'}}>Total: {filteredContacts.length}</div>

      {/* --- MODAL DE EDIÇÃO --- */}
      {showUserModal && editingUser && (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Editar Usuário</h2>
                <p style={{color:'#888', marginBottom:'20px', fontSize:'0.9rem'}}>
                    ID: {editingUser.id} • {editingUser.name}
                </p>
                
                {/* ÁREA DE DISPARO RÁPIDO */}
                <div className="quick-send-box">
                    <h4 style={{margin:'0 0 10px 0', color:'#c333ff', display:'flex', alignItems:'center', gap:'8px'}}>
                        <Send size={16}/> Enviar Campanha Rápida
                    </h4>
                    
                    {rmktHistory.length > 0 ? (
                        <div className="history-mini-list">
                            {rmktHistory.slice(0, 3).map((h, i) => (
                                <div key={i} className="mini-history-item">
                                    <span style={{color:'#aaa', fontSize:'0.8rem'}}>{h.data}</span>
                                    <button className="btn-mini-send" onClick={() => handleReuseForUser(h)}>
                                        Enviar ➡️
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : <p style={{color:'#666', fontSize:'0.8rem'}}>Sem campanhas recentes.</p>}
                </div>

                <form onSubmit={handleSaveUser}>
                    <div className="form-group">
                        <label>Cargo</label>
                        <select 
                            className="input-field"
                            value={editingUser.role} 
                            onChange={e => setEditingUser({...editingUser, role: e.target.value})}
                        >
                            <option value="user">👤 Usuário Comum</option>
                            <option value="admin">🛡️ Admin (Imune a Ban)</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Status Financeiro</label>
                        <select 
                            className="input-field"
                            value={editingUser.status} 
                            onChange={e => setEditingUser({...editingUser, status: e.target.value})}
                        >
                            <option value="paid">✅ Ativo / Pago</option>
                            <option value="expired">❌ Expirado</option>
                            <option value="pending">⏳ Pendente</option>
                        </select>
                    </div>

                    {editingUser.status === 'paid' && (
                        <div style={{marginBottom:'20px'}}>
                            <button type="button" className="btn-resend" onClick={handleResendAccess}>
                                🔄 Reenviar Acesso
                            </button>
                        </div>
                    )}

                    <div className="form-group">
                        <label>Data Personalizada</label>
                        <input 
                            type="date" 
                            className="input-field"
                            value={editingUser.custom_expiration} 
                            onChange={e => setEditingUser({...editingUser, custom_expiration: e.target.value})}
                        />
                        <div style={{display:'flex', gap:'10px', marginTop:'10px'}}>
                            <button type="button" className="btn-small" onClick={() => setEditingUser({...editingUser, custom_expiration: 'vitalicio'})}>♾️ Vitalício</button>
                            <button type="button" className="btn-small danger" onClick={() => setEditingUser({...editingUser, custom_expiration: 'remover'})}>🗑️ Remover</button>
                        </div>
                    </div>

                    <div className="modal-actions">
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