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
    preco: '', 
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
    try {
      const lista = await planService.listPlans(selectedBot.id);
      setPlans(lista);
    } catch (error) {
      console.error("Erro ao buscar planos", error);
    }
  };

  // --- CRIAÇÃO ---
  const handleCreate = async () => {
    if (!selectedBot) return Swal.fire('Erro', 'Selecione um bot no topo da tela!', 'warning');
    if (!newPlan.nome_exibicao || !newPlan.preco) return Swal.fire('Atenção', 'Preencha nome e preço.', 'warning');

    setLoading(true);
    try {
      await planService.createPlan({
        bot_id: selectedBot.id,
        nome_exibicao: newPlan.nome_exibicao,
        preco: parseFloat(newPlan.preco.replace(',', '.')),
        dias_duracao: parseInt(newPlan.dias_duracao || 30)
      });
      
      Swal.fire({ title: 'Criado!', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
      setNewPlan({ nome_exibicao: '', preco: '', dias_duracao: '' });
      carregarPlanos();
    } catch (error) {
      Swal.fire('Erro', 'Falha ao criar plano.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- PREPARAR EDIÇÃO ---
  const openEditModal = (plan) => {
    setEditingPlan({
      id: plan.id,
      nome_exibicao: plan.nome_exibicao,
      preco: plan.preco_atual,
      dias_duracao: plan.dias_duracao
    });
    setIsEditModalOpen(true);
  };

  // --- SALVAR EDIÇÃO ---
  const handleUpdate = async () => {
    if (!editingPlan) return;
    
    try {
      await planService.updatePlan(editingPlan.id, {
        nome_exibicao: editingPlan.nome_exibicao,
        preco: parseFloat(String(editingPlan.preco).replace(',', '.')),
        dias_duracao: parseInt(editingPlan.dias_duracao)
      });

      Swal.fire({ title: 'Atualizado!', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
      setIsEditModalOpen(false);
      setEditingPlan(null);
      carregarPlanos();
    } catch (error) {
      Swal.fire('Erro', 'Falha ao atualizar plano.', 'error');
    }
  };

  // --- EXCLUSÃO ---
  const handleDelete = async (planId) => {
    const result = await Swal.fire({
      title: 'Excluir plano?', 
      text: "Isso não afeta vendas passadas, mas remove a opção para novos clientes.", 
      icon: 'warning',
      showCancelButton: true, 
      confirmButtonColor: '#d65ad1', 
      cancelButtonColor: '#2d2647',
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await planService.deletePlan(planId);
        Swal.fire({ title: 'Excluído!', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
        carregarPlanos();
      } catch (error) {
        Swal.fire('Erro', 'Não foi possível excluir.', 'error');
      }
    }
  };

  return (
    <div className="plans-container fade-in">
      
      <div className="page-header">
        <div>
          <h1>Planos de Venda: <span className="highlight-text">{selectedBot?.nome || "..."}</span></h1>
          <p className="page-subtitle">Gerencie os produtos que seu bot oferece no Telegram.</p>
        </div>
      </div>

      {selectedBot ? (
        <>
          {/* PAINEL DE CRIAÇÃO RÁPIDA */}
          <Card className="create-plan-card">
            <CardContent>
              <div className="card-header-title">
                <Plus size={20} />
                <h3>Adicionar Novo Plano</h3>
              </div>
              
              <div className="create-plan-form">
                <Input 
                  label="Nome do Plano" placeholder="Ex: Acesso Vitalício"
                  value={newPlan.nome_exibicao}
                  onChange={e => setNewPlan({...newPlan, nome_exibicao: e.target.value})}
                />
                
                <Input 
                  label="Preço (R$)" placeholder="0,00" type="number"
                  value={newPlan.preco}
                  onChange={e => setNewPlan({...newPlan, preco: e.target.value})}
                  icon={<DollarSign size={16}/>}
                />
                
                <Input 
                  label="Duração (Dias)" placeholder="30" type="number"
                  value={newPlan.dias_duracao}
                  onChange={e => setNewPlan({...newPlan, dias_duracao: e.target.value})}
                  icon={<Calendar size={16}/>}
                />

                <div className="form-action-btn">
                  <Button onClick={handleCreate} disabled={loading} style={{width: '100%', height: '42px'}}>
                    {loading ? 'Salvando...' : 'Criar Plano'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* GRID DE PLANOS EXISTENTES */}
          <div className="plans-grid">
            {plans.map((plan) => (
              <div key={plan.id} className="plan-card-item">
                
                {/* Cabeçalho do Card */}
                <div className="plan-card-top">
                  <div className="plan-icon">
                    <Tag size={20} />
                  </div>
                  <div className="plan-info">
                    <h4 className="plan-title">{plan.nome_exibicao}</h4>
                    <span className="plan-badge">
                      {plan.dias_duracao > 3650 ? 'Vitalício' : `${plan.dias_duracao} Dias`}
                    </span>
                  </div>
                </div>

                {/* Preço */}
                <div className="plan-price-area">
                  <span className="currency">R$</span>
                  <span className="amount">{plan.preco_atual.toFixed(2)}</span>
                </div>

                {/* Ações */}
                <div className="plan-actions">
                  <button className="btn-icon edit" onClick={() => openEditModal(plan)} title="Editar">
                    <Edit2 size={18} />
                  </button>
                  <button className="btn-icon delete" onClick={() => handleDelete(plan.id)} title="Excluir">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* --- MODAL DE EDIÇÃO --- */}
          {isEditModalOpen && editingPlan && (
            <div className="modal-overlay">
              <div className="modal-content fade-in">
                <div className="modal-header">
                  <h3>Editar Plano</h3>
                  <button onClick={() => setIsEditModalOpen(false)} className="close-btn"><X size={20}/></button>
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
                      value={editingPlan.preco}
                      onChange={e => setEditingPlan({...editingPlan, preco: e.target.value})}
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