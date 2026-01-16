import React, { useState, useEffect } from 'react';
import { useBot } from '../context/BotContext'; // Contexto para saber qual bot está selecionado
import { adminService } from '../services/api';
import { ShieldCheck, UserPlus, Trash2, AlertCircle, Edit } from 'lucide-react';
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import Swal from 'sweetalert2';
import './AdminManager.css';

export function AdminManager() {
  const { selectedBot } = useBot(); // Pega o bot selecionado no topo
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Formulário e Estado de Edição
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [editingAdmin, setEditingAdmin] = useState(null); // Guarda o admin sendo editado

  useEffect(() => {
    if (selectedBot) {
      carregarAdmins();
      handleCancelEdit(); // Limpa form ao mudar de bot
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

  const handleSaveAdmin = async (e) => {
    e.preventDefault();
    if (!newId) return Swal.fire('Erro', 'Informe o ID do Telegram.', 'error');

    try {
      if (editingAdmin) {
        // --- MODO EDIÇÃO ---
        await adminService.updateAdmin(selectedBot.id, editingAdmin.id, {
          telegram_id: newId,
          nome: newName || 'Admin'
        });
        Swal.fire('Sucesso', 'Administrador atualizado!', 'success');
      } else {
        // --- MODO CRIAÇÃO ---
        await adminService.addAdmin(selectedBot.id, {
          telegram_id: newId,
          nome: newName || 'Admin'
        });
        Swal.fire('Sucesso', 'Administrador adicionado!', 'success');
      }
      
      handleCancelEdit(); // Limpa o formulário
      carregarAdmins();
    } catch (error) {
      Swal.fire('Erro', error.response?.data?.detail || 'Falha ao salvar.', 'error');
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
        
        // Se estava editando este admin, cancela a edição
        if (editingAdmin?.telegram_id === telegramId) {
            handleCancelEdit();
        }
      } catch (error) {
        Swal.fire('Erro', 'Falha ao remover.', 'error');
      }
    }
  };

  // Prepara o formulário para edição
  const handleEditClick = (admin) => {
    setEditingAdmin(admin);
    setNewId(admin.telegram_id);
    setNewName(admin.nome || '');
    // Scroll para o topo para ver o form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancela edição e limpa form
  const handleCancelEdit = () => {
    setEditingAdmin(null);
    setNewId('');
    setNewName('');
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
        {/* --- CARD DE ADICIONAR / EDITAR --- */}
        <Card className="add-admin-card" style={editingAdmin ? {borderColor: '#c333ff'} : {}}>
          <CardContent>
            <div className="card-title">
              {editingAdmin ? <Edit size={20} /> : <UserPlus size={20} />}
              <h3>{editingAdmin ? 'Editar Administrador' : 'Adicionar Novo'}</h3>
            </div>
            <p className="helper-text">
              Insira o ID numérico do Telegram. Use <code>/id</code> no seu bot para descobrir.
            </p>
            
            <form onSubmit={handleSaveAdmin}>
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
              
              <div style={{display: 'flex', gap: '10px', marginTop: '15px'}}>
                {editingAdmin && (
                    <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={handleCancelEdit}
                        style={{flex: 1}}
                    >
                        Cancelar
                    </Button>
                )}
                <Button type="submit" style={{flex: 1}}>
                    {editingAdmin ? 'Salvar Alterações' : 'Adicionar Admin'}
                </Button>
              </div>
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
                  <div key={admin.id} className="admin-item" style={editingAdmin?.id === admin.id ? {borderColor: '#c333ff', background: 'rgba(195, 51, 255, 0.05)'} : {}}>
                    <div className="admin-info">
                      <div className="admin-avatar">
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <strong>{admin.nome}</strong>
                        <span>ID: {admin.telegram_id}</span>
                      </div>
                    </div>
                    
                    <div style={{display:'flex', gap:'8px'}}>
                        <button 
                          className="btn-remove"
                          onClick={() => handleEditClick(admin)}
                          title="Editar Admin"
                          style={{color: '#3b82f6'}} // Azul para editar
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          className="btn-remove"
                          onClick={() => handleRemoveAdmin(admin.telegram_id)}
                          title="Remover Admin"
                        >
                          <Trash2 size={18} />
                        </button>
                    </div>
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