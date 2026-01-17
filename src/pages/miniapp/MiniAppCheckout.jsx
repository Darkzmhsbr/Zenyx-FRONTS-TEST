import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { planService, orderBumpService } from '../../services/api';
import { Check, ShieldCheck, Lock, Zap, Smartphone, ArrowRight } from 'lucide-react';
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
        if (pData.length > 0) setSelectedPlan(pData[0]); // Seleciona o primeiro por padrão
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

  if (loading) return <div className="checkout-page-container"></div>;

  return (
    <div className="checkout-page-container">
      <div className="checkout-header">
        <h2>FINALIZAR ASSINATURA</h2>
      </div>

      <div style={{display:'flex', flexDirection:'column', gap: 10}}>
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

      {/* ORDER BUMP (Se houver) */}
      {bump && (
          <div 
            style={{marginTop: 20, background: 'rgba(251, 191, 36, 0.05)', border: '1px dashed #fbbf24', padding: 15, borderRadius: 8, cursor: 'pointer'}} 
            onClick={() => setIsBumpSelected(!isBumpSelected)}
          >
              <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:5}}>
                  <div style={{width:20, height:20, border:'2px solid #555', display:'flex', alignItems:'center', justifyContent:'center', background: isBumpSelected ? '#E10000' : 'transparent', borderColor: isBumpSelected ? '#E10000' : '#555'}}>
                      {isBumpSelected && <Check size={14} color="#fff"/>}
                  </div>
                  <span style={{color: '#E10000', fontWeight:800, fontSize:'0.8rem'}}>OFERTA ESPECIAL 🔥</span>
              </div>
              <div style={{color:'#fff', fontWeight:700, fontSize:'0.9rem'}}>
                  Levar {bump.nome_produto} por + R$ {parseFloat(bump.preco).toFixed(2)}
              </div>
          </div>
      )}

      {/* BOTÃO */}
      <div className="btn-pay-container">
          <button className="btn-pay-now" onClick={handlePayment}>
              PAGAR COM PIX <ArrowRight size={20} />
          </button>
      </div>

      {/* BENEFÍCIOS */}
      <div className="benefits-section">
          <div className="benefit-item"><ShieldCheck size={18} color="#555"/> 100% Seguro</div>
          <div className="benefit-item"><Zap size={18} color="#555"/> Acesso Imediato</div>
          <div className="benefit-item"><Lock size={18} color="#555"/> Sigilo Total</div>
          <div className="benefit-item"><Smartphone size={18} color="#555"/> Qualquer Aparelho</div>
      </div>
    </div>
  );
}