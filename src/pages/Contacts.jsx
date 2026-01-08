import React, { useEffect, useState } from 'react';
import { crmService } from '../services/api'; 
import { Users, CheckCircle, Clock, XCircle, RefreshCw, Hash, Calendar } from 'lucide-react';
import { Button } from '../components/Button';
import './Contacts.css';

export function Contacts() {
  const [allContacts, setAllContacts] = useState([]); // Armazena todos
  const [filteredContacts, setFilteredContacts] = useState([]); // Armazena os visíveis
  const [filter, setFilter] = useState('todos');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarContatos();
  }, []);

  // Filtra localmente sempre que 'filter' ou 'allContacts' mudar
  useEffect(() => {
    aplicarFiltro();
  }, [filter, allContacts]);

  const carregarContatos = async () => {
    setLoading(true);
    try {
      // Buscamos 'todos' para poder filtrar "Expirados" localmente
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

  // --- LÓGICA DE CÁLCULO DE DATA (FRONTEND) ---
  const calcularExpiracao = (dataCriacao, nomePlano, status) => {
    if (!dataCriacao || !nomePlano) return '-';
    
    if (status === 'expired') return <span style={{color:'#ef4444'}}>Vencido</span>;
    if (status === 'pending') return '-';

    const created = new Date(dataCriacao);
    const nome = nomePlano.toLowerCase();
    let dias = 30; // Padrão Mensal

    if (nome.includes('vital') || nome.includes('mega')) {
      return <span style={{color:'#00e676', fontWeight:'bold'}}>∞ Permanente</span>;
    }
    
    if (nome.includes('diario') || nome.includes('24') || nome.includes('1 dia')) dias = 1;
    else if (nome.includes('semanal')) dias = 7;
    else if (nome.includes('trimestral')) dias = 90;
    else if (nome.includes('anual')) dias = 365;

    // Adiciona os dias
    created.setDate(created.getDate() + dias);
    
    // Formata DD/MM/AAAA
    return created.toLocaleDateString('pt-BR');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getStatusBadge = (status) => {
    if (status === 'paid') return <span className="status-badge status-paid"><CheckCircle size={12}/> Ativo</span>;
    if (status === 'expired') return <span className="status-badge status-expired"><XCircle size={12}/> Expirado</span>;
    return <span className="status-badge status-pending"><Clock size={12}/> Pendente</span>;
  };

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

      {/* --- MENU DE FILTROS ESTILO TABS --- */}
      <div className="tabs-container">
        <div className="filters-bar">
          <button onClick={() => setFilter('todos')} className={`filter-tab ${filter === 'todos' ? 'active' : ''}`}>
            Todos
          </button>
          <button onClick={() => setFilter('pagantes')} className={`filter-tab ${filter === 'pagantes' ? 'active' : ''}`}>
            Pagantes
          </button>
          <button onClick={() => setFilter('pendentes')} className={`filter-tab ${filter === 'pendentes' ? 'active' : ''}`}>
            Leads (Pendentes)
          </button>
          <button onClick={() => setFilter('expirados')} className={`filter-tab ${filter === 'expirados' ? 'active' : ''}`}>
            Expirados
          </button>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#888' }}>
            <RefreshCw className="spin" size={30} style={{marginBottom:'10px'}}/>
            <p>Sincronizando com o banco de dados...</p>
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{width: '180px'}}>Data</th>
                <th style={{width: '120px'}}><Hash size={14} style={{marginBottom:-2}}/> ID Telegram</th>
                <th>Nome / Usuário</th>
                <th>Plano Escolhido</th>
                <th>Valor</th>
                <th><Calendar size={14} style={{marginBottom:-2}}/> Expiração</th>
                <th style={{textAlign:'center'}}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.length > 0 ? filteredContacts.map((c) => (
                <tr key={c.id}>
                  {/* ADICIONADO data-label EM TODAS AS TDs ABAIXO */}
                  <td data-label="Data" style={{fontSize:'0.85rem', color:'#888'}}>
                    {formatDate(c.created_at)}
                  </td>
                  
                  <td data-label="ID Telegram">
                    <span className="id-badge">{c.telegram_id}</span>
                  </td>

                  <td data-label="Nome / Usuário">
                    <div style={{ fontWeight: '600', color: '#fff' }}>{c.first_name || 'Sem nome'}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
                      {c.username ? `@${c.username}` : '-'}
                    </div>
                  </td>
                  
                  <td data-label="Plano">
                    <span className="plan-tag">{c.plano_nome || '-'}</span>
                  </td>
                  
                  <td data-label="Valor" style={{fontWeight:'bold'}}>
                    {c.valor ? `R$ ${c.valor.toFixed(2)}` : 'R$ 0,00'}
                  </td>

                  <td data-label="Expiração" style={{fontSize:'0.9rem'}}>
                    {calcularExpiracao(c.created_at, c.plano_nome, c.status)}
                  </td>

                  <td data-label="Status" style={{textAlign:'center'}}>
                    {getStatusBadge(c.status)}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" style={{ padding: '60px', textAlign: 'center', color: '#666', fontStyle:'italic' }}>
                    Nenhum contato encontrado nesta categoria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div style={{marginTop:'20px', color:'#666', fontSize:'0.8rem', textAlign:'right'}}>
        Total visualizado: {filteredContacts.length}
      </div>

    </div>
  );
}