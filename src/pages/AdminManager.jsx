import React, { useState, useEffect } from 'react';
import { useBot } from '../context/BotContext'; // Contexto para saber qual bot está selecionado
import { adminService } from '../services/api';
import { ShieldCheck, UserPlus, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import Swal from 'sweetalert2';
import './AdminManager.css';

export function AdminManager() {
  const { selectedBot } = useBot(); // Pega o bot selecionado no topo
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Formulário
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (selectedBot) {
      carregarAdmins();
    }
  }, [selectedBot]);

  const carregarAdmins = async () => {
    setLoading(true);
    try {
      const data = await adminService.listAdmins(selectedBot.id);
      setAdmins(data);
    } catch (error) {
      console.error("Erro ao carregar admins", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!newId) return Swal.fire('Erro', 'Informe o ID do Telegram.', 'error');

    try {
      await adminService.addAdmin(selectedBot.id, {
        telegram_id: newId,
        nome: newName || 'Admin'
      });
      Swal.fire('Sucesso', 'Administrador adicionado!', 'success');
      setNewId('');
      setNewName('');
      carregarAdmins();
    } catch (error) {
      Swal.fire('Erro', error.response?.data?.detail || 'Falha ao adicionar.', 'error');
    }
  };

  const handleRemoveAdmin = async (telegramId) => {
    const result = await Swal.fire({
      title: 'Remover Admin?',
      text: "Essa pessoa perderá acesso aos comandos restritos do bot.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, remover',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#333',
      background: '#151515',
      color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        await adminService.removeAdmin(selectedBot.id, telegramId);
        setAdmins(admins.filter(a => a.telegram_id !== telegramId));
        Swal.fire('Removido!', 'Admin removido com sucesso.', 'success');
      } catch (error) {
        Swal.fire('Erro', 'Falha ao remover.', 'error');
      }
    }
  };

  if (!selectedBot) {
    return (
      <div className="admin-manager-container empty-state">
        <AlertCircle size={48} color="#c333ff" />
        <h2>Nenhum Bot Selecionado</h2>
        <p>Selecione um bot no menu superior (Header) para gerenciar seus administradores.</p>
      </div>
    );
  }

  return (
    <div className="admin-manager-container">
      <div className="page-header">
        <div>
          <h1>Administradores do Bot</h1>
          <p style={{color:'var(--muted-foreground)'}}>
            Gerenciando admins para: <strong style={{color:'#c333ff'}}>{selectedBot.nome}</strong>
          </p>
        </div>
      </div>

      <div className="content-grid">
        {/* --- CARD DE ADICIONAR --- */}
        <Card className="add-admin-card">
          <CardContent>
            <div className="card-title">
              <UserPlus size={20} />
              <h3>Adicionar Novo</h3>
            </div>
            <p className="helper-text">
              Insira o ID numérico do Telegram. Use <code>/id</code> no seu bot para descobrir.
            </p>
            
            <form onSubmit={handleAddAdmin}>
              <div className="form-group">
                <label>ID do Telegram</label>
                <input 
                  type="text" 
                  placeholder="Ex: 123456789" 
                  value={newId} 
                  onChange={e => setNewId(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label>Nome (Identificação)</label>
                <input 
                  type="text" 
                  placeholder="Ex: Suporte João" 
                  value={newName} 
                  onChange={e => setNewName(e.target.value)} 
                />
              </div>
              <Button type="submit" style={{width:'100%', marginTop:'10px'}}>
                Adicionar Admin
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* --- LISTA DE ADMINS --- */}
        <div className="admins-list">
          <h3>Administradores Ativos ({admins.length})</h3>
          
          {loading ? <p>Carregando...</p> : (
            admins.length === 0 ? (
              <div className="no-admins">
                Nenhum administrador extra configurado.
              </div>
            ) : (
              <div className="admins-grid">
                {admins.map(admin => (
                  <div key={admin.id} className="admin-item">
                    <div className="admin-info">
                      <div className="admin-avatar">
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <strong>{admin.nome}</strong>
                        <span>ID: {admin.telegram_id}</span>
                      </div>
                    </div>
                    <button 
                      className="btn-remove"
                      onClick={() => handleRemoveAdmin(admin.telegram_id)}
                      title="Remover Admin"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}