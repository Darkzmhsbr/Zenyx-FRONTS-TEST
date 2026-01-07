import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Plus, Trash2, Calendar, CreditCard, DollarSign } from 'lucide-react';
import { planService } from '../services/api';
import { useBot } from '../context/BotContext'; // <--- Contexto
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { Input } from '../components/Input';
import './Plans.css';

export function Plans() {
  const { selectedBot } = useBot(); // Pega bot global
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  const [newPlan, setNewPlan] = useState({ 
    nome_exibicao: '', 
    preco: '', 
    dias_duracao: '' 
  });

  // Carrega Planos automaticamente quando o bot muda no topo
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
      
      Swal.fire({ title: 'Sucesso!', text: 'Plano criado.', icon: 'success', background: '#1b1730', color: '#fff' });
      setNewPlan({ nome_exibicao: '', preco: '', dias_duracao: '' });
      carregarPlanos();
    } catch (error) {
      Swal.fire('Erro', 'Falha ao criar plano.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (planId) => {
    const result = await Swal.fire({
      title: 'Tem certeza?', text: "Remover este plano?", icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#d65ad1', cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, excluir!', background: '#1b1730', color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        await planService.deletePlan(planId);
        Swal.fire({ title: 'Excluído!', icon: 'success', background: '#1b1730', color: '#fff' });
        carregarPlanos();
      } catch (error) {
        Swal.fire('Erro', 'Não foi possível excluir.', 'error');
      }
    }
  };

  return (
    <div className="plans-container">
      
      <div className="page-header">
        <div>
          <h1>Planos: <span style={{color:'#c333ff'}}>{selectedBot?.nome || "..."}</span></h1>
          <p style={{ color: 'var(--muted-foreground)' }}>Configure os produtos para este bot.</p>
        </div>
      </div>

      {selectedBot ? (
        <>
          {/* FORMULÁRIO DE CRIAÇÃO */}
          <Card>
            <CardContent>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: 'var(--primary)' }}>
                <Plus size={20} />
                <h3 style={{ margin: 0 }}>Criar Novo Plano</h3>
              </div>
              
              <div className="create-plan-form">
                <Input 
                  label="Nome do Plano" placeholder="Ex: VIP Mensal"
                  value={newPlan.nome_exibicao}
                  onChange={e => setNewPlan({...newPlan, nome_exibicao: e.target.value})}
                />
                
                <Input 
                  label="Preço (R$)" placeholder="29,90" type="number"
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

                <Button onClick={handleCreate} disabled={loading} style={{ height: '42px', marginBottom: '2px' }}>
                  {loading ? 'Criando...' : 'Criar Plano'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* LISTA DE PLANOS */}
          <div className="plans-grid">
            {plans.map((plan) => (
              <Card key={plan.id} className="plan-card-item">
                <CardContent style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ flex: 1 }}>
                    <div className="plan-title">{plan.nome_exibicao}</div>
                    <div className="plan-price">R$ {plan.preco_atual.toFixed(2)}</div>
                    <div className="plan-duration"><Calendar size={16} /> {plan.dias_duracao} dias</div>
                  </div>
                  <div className="plan-actions">
                    <Button variant="ghost" size="sm" style={{ color: '#ef4444' }} onClick={() => handleDelete(plan.id)}>
                      <Trash2 size={16} /> Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <div style={{textAlign:'center', marginTop:'50px', color:'#666'}}>
            <h2>👈 Selecione um bot no topo da tela para começar.</h2>
        </div>
      )}
    </div>
  );
}