import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { 
  Plus, Trash2, Calendar, DollarSign, Edit2, Check, X, Tag 
} from 'lucide-react';
import { planService } from '../services/api';
import { useBot } from '../context/BotContext'; 
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { Input } from '../components/Input';
import './Plans.css';

export function Plans() {
  const { selectedBot } = useBot(); 
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estado para criação
  const [newPlan, setNewPlan] = useState({ 
    nome_exibicao: '', 
    preco_atual: '', // Corrigido nome do campo
    dias_duracao: '' 
  });

  // Estado para edição (Modal)
  const [editingPlan, setEditingPlan] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (selectedBot) {
        carregarPlanos();
    } else {
        setPlans([]);
    }
  }, [selectedBot]);

  const carregarPlanos = async () => {
    if (!selectedBot?.id) return;
    try {
      const lista = await planService.listPlans(selectedBot.id);
      setPlans(lista);
    } catch (error) {
      console.error(error);
      Swal.fire('Erro', 'Falha ao carregar planos', 'error');
    }
  };

  // 🔥 CORREÇÃO 1: Enviar selectedBot.id, não o objeto selectedBot
  const handleCreate = async () => {
    if (!newPlan.nome_exibicao || !newPlan.preco_atual || !newPlan.dias_duracao) {
      return Swal.fire('Atenção', 'Preencha todos os campos', 'warning');
    }

    try {
      setLoading(true);
      await planService.createPlan(selectedBot.id, {
        ...newPlan,
        preco_atual: parseFloat(newPlan.preco_atual),
        dias_duracao: parseInt(newPlan.dias_duracao)
      });
      
      Swal.fire('Sucesso', 'Plano criado!', 'success');
      setNewPlan({ nome_exibicao: '', preco_atual: '', dias_duracao: '' });
      carregarPlanos();
    } catch (error) {
      Swal.fire('Erro', 'Não foi possível criar o plano', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (plan) => {
    setEditingPlan({ ...plan });
    setIsEditModalOpen(true);
  };

  // 🔥 CORREÇÃO 2: Enviar 3 argumentos: (BotID, PlanoID, Dados)
  const handleUpdate = async () => {
    if (!editingPlan) return;
    try {
      await planService.updatePlan(
          selectedBot.id,      // Argumento 1: ID do Bot
          editingPlan.id,      // Argumento 2: ID do Plano
          {                    // Argumento 3: Dados
            nome_exibicao: editingPlan.nome_exibicao,
            preco_atual: parseFloat(editingPlan.preco_atual),
            dias_duracao: parseInt(editingPlan.dias_duracao),
            descricao: editingPlan.descricao || ""
          }
      );
      
      Swal.fire('Atualizado', 'Plano editado com sucesso', 'success');
      setIsEditModalOpen(false);
      setEditingPlan(null);
      carregarPlanos();
    } catch (error) {
      console.error(error);
      Swal.fire('Erro', 'Falha ao atualizar plano', 'error');
    }
  };

  // 🔥 CORREÇÃO 3: Enviar BotID e PlanoID
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Tem certeza?',
      text: "Isso apagará o plano permanentemente.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sim, deletar'
    });

    if (result.isConfirmed) {
      try {
        await planService.deletePlan(selectedBot.id, id);
        Swal.fire('Deletado!', 'O plano foi removido.', 'success');
        carregarPlanos();
      } catch (error) {
        Swal.fire('Erro', 'Erro ao deletar plano', 'error');
      }
    }
  };

  return (
    <div className="plans-container">
      <div className="header-actions">
        <h1>Gerenciar Planos</h1>
      </div>

      {selectedBot ? (
        <>
          {/* CARD DE CRIAÇÃO */}
          <Card className="create-plan-card">
            <CardContent>
              <h3>Novo Plano</h3>
              <div className="form-row">
                <Input 
                  placeholder="Nome (Ex: Mensal)" 
                  value={newPlan.nome_exibicao}
                  onChange={e => setNewPlan({...newPlan, nome_exibicao: e.target.value})}
                  icon={<Tag size={18}/>}
                />
                <Input 
                  placeholder="Preço (10.00)" type="number"
                  value={newPlan.preco_atual}
                  onChange={e => setNewPlan({...newPlan, preco_atual: e.target.value})}
                  icon={<DollarSign size={18}/>}
                />
                <Input 
                  placeholder="Duração (dias)" type="number"
                  value={newPlan.dias_duracao}
                  onChange={e => setNewPlan({...newPlan, dias_duracao: e.target.value})}
                  icon={<Calendar size={18}/>}
                />
                <Button onClick={handleCreate} disabled={loading}>
                  <Plus size={20} /> Criar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* LISTA DE PLANOS */}
          <div className="plans-grid">
            {plans.map(plan => (
              <Card key={plan.id} className="plan-card">
                <CardContent>
                  <div className="plan-header">
                    <h4>{plan.nome_exibicao}</h4>
                    <div className="plan-actions">
                      <button className="btn-icon edit" onClick={() => openEditModal(plan)}>
                        <Edit2 size={18} />
                      </button>
                      <button className="btn-icon delete" onClick={() => handleDelete(plan.id)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="plan-details">
                    <p><strong>R$ {parseFloat(plan.preco_atual).toFixed(2)}</strong></p>
                    <p>{plan.dias_duracao} dias de acesso</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* MODAL DE EDIÇÃO */}
          {isEditModalOpen && editingPlan && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>Editar Plano</h3>
                  <button onClick={() => setIsEditModalOpen(false)}><X size={20}/></button>
                </div>
                
                <div className="modal-body">
                  <Input 
                    label="Nome do Plano"
                    value={editingPlan.nome_exibicao}
                    onChange={e => setEditingPlan({...editingPlan, nome_exibicao: e.target.value})}
                  />
                  <div className="modal-row">
                     <Input 
                      label="Preço (R$)" type="number"
                      value={editingPlan.preco_atual}
                      onChange={e => setEditingPlan({...editingPlan, preco_atual: e.target.value})}
                      icon={<DollarSign size={16}/>}
                    />
                    <Input 
                      label="Duração (Dias)" type="number"
                      value={editingPlan.dias_duracao}
                      onChange={e => setEditingPlan({...editingPlan, dias_duracao: e.target.value})}
                      icon={<Calendar size={16}/>}
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
                  <Button onClick={handleUpdate}>
                    <Check size={18} style={{marginRight: 8}}/> Salvar Alterações
                  </Button>
                </div>
              </div>
            </div>
          )}

        </>
      ) : (
        <div className="empty-state">
            <h2>👈 Selecione um bot no menu lateral para gerenciar os planos.</h2>
        </div>
      )}
    </div>
  );
}