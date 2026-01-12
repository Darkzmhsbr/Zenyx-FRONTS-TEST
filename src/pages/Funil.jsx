import React, { useState, useEffect } from 'react';
import { useBot } from '../context/BotContext';
import { crmService } from '../services/api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { RefreshCw, ChevronLeft, ChevronRight, TrendingUp, Users } from 'lucide-react';
import Swal from 'sweetalert2';
import './Funil.css';

export function Funil() {
  const { selectedBot } = useBot();
  
  const [activeTab, setActiveTab] = useState('todos');
  const [contacts, setContacts] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    topo: 0,
    meio: 0,
    fundo: 0,
    expirados: 0,
    total: 0
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalContacts, setTotalContacts] = useState(0);
  const perPage = 50;

  useEffect(() => {
    loadData();
  }, [selectedBot, activeTab, currentPage]);

  const loadData = async () => {
    setLoading(true);
    try {
      const botId = selectedBot?.id || null;
      
      const statsData = await crmService.getFunnelStats(botId);
      setStats(statsData);
      
      if (activeTab === 'todos') {
        const pedidosData = await crmService.getContacts(botId, 'todos', currentPage, perPage);
        const leadsData = await crmService.getLeads(botId, currentPage, perPage);
        
        setLeads(leadsData.data || []);
        setContacts(pedidosData.data || []);
        
        const totalCombinado = (leadsData.total || 0) + (pedidosData.total || 0);
        setTotalContacts(totalCombinado);
        setTotalPages(Math.ceil(totalCombinado / perPage));
        
      } else if (activeTab === 'topo') {
        const leadsData = await crmService.getLeads(botId, currentPage, perPage);
        setLeads(leadsData.data || []);
        setContacts([]);
        setTotalPages(leadsData.total_pages || 1);
        setTotalContacts(leadsData.total || 0);
        
      } else {
        const filterMap = {
          'meio': 'meio',
          'fundo': 'fundo',
          'expirados': 'expirado'
        };
        
        const contactsData = await crmService.getContacts(
          botId, 
          filterMap[activeTab], 
          currentPage, 
          perPage
        );
        
        setContacts(contactsData.data || []);
        setLeads([]);
        setTotalPages(contactsData.total_pages || 1);
        setTotalContacts(contactsData.total || 0);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do funil:', error);
      Swal.fire('Erro', 'Não foi possível carregar os dados', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const formatMoney = (value) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  const getStatusBadge = (status) => {
    const badges = {
      'aprovado': <span className="status-badge status-paid">✓ PAGO</span>,
      'approved': <span className="status-badge status-paid">✓ PAGO</span>,
      'paid': <span className="status-badge status-paid">✓ PAGO</span>,
      'pending': <span className="status-badge status-pending">⏳ PENDENTE</span>,
      'expirado': <span className="status-badge status-expired">✕ EXPIRADO</span>,
      'expired': <span className="status-badge status-expired">✕ EXPIRADO</span>
    };
    return badges[status] || <span className="status-badge">{status}</span>;
  };

  // 🔥 FUNÇÃO ROBUSTA: Determina badge do funil com múltiplos critérios
  const getFunilBadge = (contact) => {
    // Prioridade 1: status_funil (se existir e for válido)
    if (contact.status_funil === 'fundo') {
      return <span className="funil-badge fundo">✅ CLIENTE</span>;
    }
    if (contact.status_funil === 'meio') {
      return <span className="funil-badge meio">🔥 QUENTE</span>;
    }
    if (contact.status_funil === 'expirado') {
      return <span className="funil-badge expirado">❄️ EXPIRADO</span>;
    }
    
    // Prioridade 2: Fallback usando campo 'status' (status do pagamento)
    const status = contact.status?.toLowerCase();
    
    // Se PAGOU → CLIENTE (FUNDO)
    if (['paid', 'active', 'approved', 'aprovado'].includes(status)) {
      return <span className="funil-badge fundo">✅ CLIENTE</span>;
    }
    
    // Se PENDENTE → QUENTE (MEIO) - gerou PIX mas não pagou
    if (status === 'pending') {
      return <span className="funil-badge meio">🔥 QUENTE</span>;
    }
    
    // Se EXPIRADO → EXPIRADO
    if (['expired', 'expirado'].includes(status)) {
      return <span className="funil-badge expirado">❄️ EXPIRADO</span>;
    }
    
    // Fallback final: LEAD FRIO
    return <span className="funil-badge topo">❄️ LEAD FRIO</span>;
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const tabs = [
    { id: 'todos', label: 'Todos', count: stats.total, icon: '👥' },
    { id: 'topo', label: 'TOPO', count: stats.topo, icon: '🎯' },
    { id: 'meio', label: 'MEIO', count: stats.meio, icon: '🔥' },
    { id: 'fundo', label: 'FUNDO', count: stats.fundo, icon: '✅' },
    { id: 'expirados', label: 'Expirados', count: stats.expirados, icon: '⏰' }
  ];

  const taxaConversao = stats.topo > 0 ? ((stats.fundo / stats.topo) * 100).toFixed(1) : 0;

  return (
    <div className="funil-container">
      
      <div className="funil-header">
        <div>
          <h1>
            <TrendingUp size={28} style={{ verticalAlign: 'middle', marginRight: '10px' }} />
            Funil de Vendas
          </h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', marginTop: '5px' }}>
            {selectedBot ? `Bot: ${selectedBot.nome}` : 'Todos os bots'}
          </p>
        </div>
        <Button onClick={loadData} disabled={loading}>
          <RefreshCw size={18} className={loading ? 'spin' : ''} />
          Atualizar
        </Button>
      </div>

      {/* Cards de Métricas */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
            🎯
          </div>
          <div>
            <div className="metric-value">{stats.topo}</div>
            <div className="metric-label">Leads Frios</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            🔥
          </div>
          <div>
            <div className="metric-value">{stats.meio}</div>
            <div className="metric-label">Leads Quentes</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            ✅
          </div>
          <div>
            <div className="metric-value">{stats.fundo}</div>
            <div className="metric-label">Clientes</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: 'rgba(195, 51, 255, 0.1)', color: '#c333ff' }}>
            📊
          </div>
          <div>
            <div className="metric-value">{taxaConversao}%</div>
            <div className="metric-label">Taxa de Conversão</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="filters-bar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`filter-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(tab.id);
                setCurrentPage(1);
              }}
            >
              {tab.icon} {tab.label}
              {tab.count > 0 && (
                <span style={{ 
                  marginLeft: '8px', 
                  background: activeTab === tab.id ? '#c333ff' : '#333',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela */}
      <Card>
        <div className="table-container">
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
              <RefreshCw size={32} className="spin" style={{ margin: '0 auto 10px' }} />
              <p>Carregando dados...</p>
            </div>
          ) : (
            <>
              {/* ABA TODOS */}
              {activeTab === 'todos' && (leads.length > 0 || contacts.length > 0) && (
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Username</th>
                      <th>Plano</th>
                      <th>Valor</th>
                      <th>Data</th>
                      <th>Status</th>
                      <th>Funil</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* LEADS */}
                    {leads.map((lead) => (
                      <tr key={`lead-${lead.id}`}>
                        <td>{lead.nome || 'Sem nome'}</td>
                        <td>@{lead.username || 'N/A'}</td>
                        <td>-</td>
                        <td>-</td>
                        <td>{formatDate(lead.primeiro_contato)}</td>
                        <td>
                          <span className="status-badge" style={{ 
                            background: 'rgba(59, 130, 246, 0.1)', 
                            color: '#3b82f6',
                            border: '1px solid rgba(59, 130, 246, 0.3)'
                          }}>
                            ❄️ LEAD FRIO
                          </span>
                        </td>
                        <td>
                          <span className="funil-badge topo">
                            🎯 TOPO
                          </span>
                        </td>
                      </tr>
                    ))}
                    
                    {/* PEDIDOS - USA getFunilBadge() */}
                    {contacts.map((contact) => (
                      <tr key={`contact-${contact.id}`}>
                        <td>{contact.first_name || 'Sem nome'}</td>
                        <td>@{contact.username || 'N/A'}</td>
                        <td>{contact.plano_nome || '-'}</td>
                        <td>{formatMoney(contact.valor)}</td>
                        <td>{formatDate(contact.created_at)}</td>
                        <td>{getStatusBadge(contact.status)}</td>
                        <td>{getFunilBadge(contact)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* ABA TOPO */}
              {activeTab === 'topo' && leads.length > 0 && (
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Username</th>
                      <th>Telegram ID</th>
                      <th>Primeiro Contato</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr key={lead.id}>
                        <td>{lead.nome || 'Sem nome'}</td>
                        <td>@{lead.username || 'N/A'}</td>
                        <td>{lead.user_id}</td>
                        <td>{formatDate(lead.primeiro_contato)}</td>
                        <td>
                          <span className="funil-badge topo">
                            ❄️ LEAD FRIO
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* ABAS MEIO/FUNDO/EXPIRADOS */}
              {activeTab !== 'topo' && activeTab !== 'todos' && contacts.length > 0 && (
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Username</th>
                      <th>Plano</th>
                      <th>Valor</th>
                      <th>Data</th>
                      <th>Status</th>
                      <th>Funil</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((contact) => (
                      <tr key={contact.id}>
                        <td>{contact.first_name || 'Sem nome'}</td>
                        <td>@{contact.username || 'N/A'}</td>
                        <td>{contact.plano_nome || '-'}</td>
                        <td>{formatMoney(contact.valor)}</td>
                        <td>{formatDate(contact.created_at)}</td>
                        <td>{getStatusBadge(contact.status)}</td>
                        <td>{getFunilBadge(contact)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Vazio */}
              {((activeTab === 'todos' && leads.length === 0 && contacts.length === 0) ||
                (activeTab === 'topo' && leads.length === 0) || 
                (activeTab !== 'topo' && activeTab !== 'todos' && contacts.length === 0)) && (
                <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <Users size={48} style={{ color: '#444', margin: '0 auto 20px' }} />
                  <p style={{ color: '#888', fontSize: '1.1rem' }}>
                    Nenhum registro encontrado neste estágio
                  </p>
                </div>
              )}

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="pagination-controls">
                  <Button 
                    variant="ghost" 
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft size={18} />
                    Anterior
                  </Button>

                  <div className="page-info">
                    Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
                    {' • '}
                    <strong>{totalContacts}</strong> registros
                  </div>

                  <Button 
                    variant="ghost" 
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                  >
                    Próxima
                    <ChevronRight size={18} />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
}