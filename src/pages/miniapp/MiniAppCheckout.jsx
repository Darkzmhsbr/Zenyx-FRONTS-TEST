import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { planService, orderBumpService } from '../../services/api';
import { Check, ShieldCheck, Lock, Zap } from 'lucide-react';
import '../../assets/styles/CheckoutPage.css';

export function MiniAppCheckout() {
  const { botId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  
  // Bump
  const [bump, setBump] = useState(null);
  const [isBumpSelected, setIsBumpSelected] = useState(false);

  useEffect(() => {
    const carregar = async () => {
      try {
        const [pData, bData] = await Promise.all([
            planService.listPlans(botId),
            orderBumpService.get(botId)
        ]);
        setPlans(pData);
        if (bData && bData.ativo) setBump(bData);
        if (pData.length > 0) setSelectedPlan(pData[1] || pData[0]); // Pega o 2º ou 1º
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    carregar();
  }, [botId]);

  const handlePayment = () => {
    if (!selectedPlan) return;
    let total = parseFloat(selectedPlan.preco_atual);
    if (isBumpSelected && bump) total += parseFloat(bump.preco);

    navigate(`/loja/${botId}/pagamento`, {
        state: { plan: selectedPlan, bump: isBumpSelected ? bump : null, finalPrice: total, botId }
    });
  };

  if (loading) return <div className="checkout-page-container">Carregando...</div>;

  return (
    <div className="checkout-page-container">
      <div className="checkout-header">
        <h2>FINALIZAR ASSINATURA</h2>
      </div>

      <div style={{display:'flex', flexDirection:'column', gap: 15}}>
        {plans.map((plan) => (
            <div 
                key={plan.id}
                className={`plan-selection-card ${selectedPlan?.id === plan.id ? 'active' : ''}`}
                onClick={() => setSelectedPlan(plan)}
            >
                <div className="plan-left">
                    <div className="custom-checkbox">
                        {selectedPlan?.id === plan.id && <Check size={16} color="#fff" strokeWidth={4} />}
                    </div>
                    <div className="plan-info">
                        <h3>{plan.nome_exibicao}</h3>
                        <p>{plan.dias_duracao} dias de acesso</p>
                    </div>
                </div>
                <div className="plan-price">
                    R$ {parseFloat(plan.preco_atual).toFixed(2)}
                </div>
            </div>
        ))}
      </div>

      {/* ORDER BUMP */}
      {bump && (
          <div className="order-bump-container" onClick={() => setIsBumpSelected(!isBumpSelected)}>
              <div className="bump-header">
                  <div className={`custom-checkbox ${isBumpSelected ? 'active' : ''}`} style={{background: isBumpSelected ? '#E10000' : 'transparent', borderColor: isBumpSelected ? '#E10000' : '#555'}}>
                      {isBumpSelected && <Check size={14} color="#fff"/>}
                  </div>
                  <span className="blink-text">OFERTA ÚNICA 🔥</span>
              </div>
              <div className="bump-title">
                  Adicionar {bump.nome_produto} por + R$ {parseFloat(bump.preco).toFixed(2)}
              </div>
          </div>
      )}

      {/* BOTÃO */}
      <div className="btn-pay-container">
          <button className="btn-pay-now" onClick={handlePayment}>
              PAGAR COM PIX
          </button>
      </div>

      {/* BENEFÍCIOS */}
      <div className="benefits-section">
          <div className="benefit-item"><ShieldCheck size={18} color="#aaa"/> Pagamento Seguro</div>
          <div className="benefit-item"><Zap size={18} color="#aaa"/> Acesso Imediato</div>
          <div className="benefit-item"><Lock size={18} color="#aaa"/> Sigilo Total na Fatura</div>
      </div>
    </div>
  );
}