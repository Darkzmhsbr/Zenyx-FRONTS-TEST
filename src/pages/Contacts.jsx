import React, { useState, useEffect } from 'react';
import { useBot } from '../context/BotContext';
import { crmService } from '../services/api';
import { Card, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';
import './Contacts.css';

export function Contacts() {
  const { selectedBot } = useBot();
  
  // Estados
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
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalContacts, setTotalContacts] = useState(0);
  const perPage = 50;

  // ============================================================
  // CARREGAR DADOS
  // ============================================================
  useEffect(() => {
    loadData();
  }, [selectedBot, activeTab, currentPage]);

  const loadData = async () => {
    setLoading(true);
    try {
      const botId = selectedBot?.id || null;
      
      // Carregar estatísticas
      const statsData = await crmService.getFunnelStats(botId);
      setStats(statsData);
      
      // Carregar dados conforme aba ativa
      if (activeTab === 'topo') {
        // Buscar LEADS (tabela leads)
        const leadsData = await crmService.getLeads(botId, currentPage, perPage);
        setLeads(leadsData.data || []);
        setContacts([]);
        setTotalPages(leadsData.total_pages || 1);
        setTotalContacts(leadsData.total || 0);
      } else {
        // Buscar PEDIDOS (tabela pedidos) com filtro de funil
        const filterMap = {
          'todos': 'todos',
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
      console.error('Erro ao carregar contatos:', error);
      Swal.fire('Erro', 'Não foi possível carregar os contatos', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // FORMATAÇÃO
  // ============================================================
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
      'pending': <span className="status-badge status-pending">⏳ PENDENTE</span>,
      'expirado': <span className="status-badge status-expired">✕ EXPIRADO</span>,
      'expired': <span className="status-badge status-expired">✕ EXPIRADO</span>
    };
    return badges[status] || <span className="status-badge">{status}</span>;
  };

  // ============================================================
  // AÇÕES
  // ============================================================
  const handleResendAccess = async (userId) => {
    try {
      await crmService.resendAccess(userId);
      Swal.fire('Sucesso', 'Link de acesso reenviado!', 'success');
    } catch (error) {
      Swal.fire('Erro', 'Não foi possível reenviar o acesso', 'error');
    }
  };

  // ============================================================
  // PAGINAÇÃO
  // ============================================================
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

  // ============================================================
  // TABS CONFIG
  // ============================================================
  const tabs = [
    { id: 'todos', label: 'Todos', count: stats.total },
    { id: 'topo', label: '🎯 TOPO', count: stats.topo },
    { id: 'meio', label: '🔥 MEIO', count: stats.meio },
    { id: 'fundo', label: '✅ FUNDO', count: stats.fundo },
    { id: 'expirados', label: '⏰ Expirados', count: stats.expirados }
  ];

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="contacts-container">
      
      {/* Header */}
      <div className="contacts-header">
        <div>
          <h1>Contatos e Leads</h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>
            {selectedBot ? `Bot: ${selectedBot.nome}` : 'Todos os bots'}
          </p>
        </div>
        <Button onClick={loadData} disabled={loading}>
          <RefreshCw size={18} className={loading ? 'spin' : ''} />
          Atualizar
        </Button>
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
              {tab.label}
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
              <p>Carregando contatos...</p>
            </div>
          ) : (
            <>
              {/* TABELA PARA TOPO (LEADS) */}
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
                          <span className="status-badge" style={{ 
                            background: 'rgba(59, 130, 246, 0.1)', 
                            color: '#3b82f6',
                            border: '1px solid rgba(59, 130, 246, 0.3)'
                          }}>
                            ❄️ LEAD FRIO
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* TABELA PARA MEIO/FUNDO/EXPIRADOS (PEDIDOS) */}
              {activeTab !== 'topo' && contacts.length > 0 && (
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
                        <td>
                          <span className="status-badge" style={{
                            background: 
                              contact.status_funil === 'fundo' ? 'rgba(16, 185, 129, 0.1)' :
                              contact.status_funil === 'meio' ? 'rgba(245, 158, 11, 0.1)' :
                              'rgba(239, 68, 68, 0.1)',
                            color:
                              contact.status_funil === 'fundo' ? '#10b981' :
                              contact.status_funil === 'meio' ? '#f59e0b' :
                              '#ef4444',
                            border:
                              contact.status_funil === 'fundo' ? '1px solid rgba(16, 185, 129, 0.3)' :
                              contact.status_funil === 'meio' ? '1px solid rgba(245, 158, 11, 0.3)' :
                              '1px solid rgba(239, 68, 68, 0.3)'
                          }}>
                            {contact.status_funil === 'fundo' ? '✅ CLIENTE' :
                             contact.status_funil === 'meio' ? '🔥 QUENTE' :
                             '❄️ EXPIRADO'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Vazio */}
              {((activeTab === 'topo' && leads.length === 0) || 
                (activeTab !== 'topo' && contacts.length === 0)) && (
                <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <p style={{ color: '#888', fontSize: '1.1rem' }}>
                    {activeTab === 'topo' 
                      ? '😴 Nenhum lead encontrado neste filtro'
                      : '📭 Nenhum contato encontrado neste filtro'}
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
                    <strong>{totalContacts}</strong> {totalContacts === 1 ? 'contato' : 'contatos'}
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
