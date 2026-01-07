import React, { useEffect, useState } from 'react';
import { crmService } from '../services/api';
import { Users, CheckCircle, Clock, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '../components/Button';
import './Contacts.css';

export function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [filter, setFilter] = useState('todos');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarContatos();
  }, [filter]);

  const carregarContatos = async () => {
    setLoading(true);
    try {
      const data = await crmService.getContacts(filter); // Chama API real
      setContacts(data);
    } catch (error) {
      console.error("Erro ao listar contatos", error);
    } finally {
      setLoading(false);
    }
  };

  // Formatadores
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
          <p style={{ color: 'var(--muted-foreground)' }}>Visualize leads e clientes vindos do Telegram.</p>
        </div>
        <Button variant="ghost" onClick={carregarContatos}>
          <RefreshCw size={18} className={loading ? 'spin' : ''} />
        </Button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div className="filters-bar" style={{ width: 'fit-content' }}>
          {['todos', 'pagantes', 'pendentes'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Carregando dados...</div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Nome / Usuário</th>
                <th>Plano Escolhido</th>
                <th>Valor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {contacts.length > 0 ? contacts.map((c) => (
                <tr key={c.id}>
                  <td>{formatDate(c.created_at)}</td>
                  <td>
                    <div style={{ fontWeight: 'bold', color: 'var(--foreground)' }}>{c.first_name || 'Sem nome'}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
                      {c.username ? `@${c.username}` : `ID: ${c.telegram_id}`}
                    </div>
                  </td>
                  <td>{c.plano_nome || '-'}</td>
                  <td>{c.valor ? `R$ ${c.valor.toFixed(2)}` : 'R$ 0,00'}</td>
                  <td>{getStatusBadge(c.status)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                    Nenhum contato encontrado com este filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}