import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { planService } from '../../services/api';
import { Check, ShieldCheck, Lock, Zap, Smartphone } from 'lucide-react';
import '../../assets/styles/CheckoutPage.css';

export function MiniAppCheckout() {
  const { botId } = useParams();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    planService.listPlans(botId).then(data => {
        setPlans(data);
        if(data.length > 0) setSelectedPlan(data[0]);
    });
  }, [botId]);

  const handlePay = () => {
      if(!selectedPlan) return;
      navigate(`/loja/${botId}/pagamento`, { state: { plan: selectedPlan, finalPrice: selectedPlan.preco_atual, botId } });
  }

  return (
    <div className="checkout-page-container">
      <div className="checkout-header"><h2>Finalizar Assinatura</h2></div>

      <div className="plans-container">
          {plans.map(plan => (
              <div key={plan.id} className={`plan-selection-card ${selectedPlan?.id === plan.id ? 'active' : ''}`} onClick={() => setSelectedPlan(plan)}>
                  <div style={{display:'flex', alignItems:'center', gap:15}}>
                      <div style={{width:24, height:24, borderRadius:'50%', border:'2px solid #555', display:'flex', alignItems:'center', justifyContent:'center', background: selectedPlan?.id === plan.id ? '#E10000' : 'transparent'}}>
                          {selectedPlan?.id === plan.id && <Check size={16} color="#fff"/>}
                      </div>
                      <div className="plan-info">
                          <h3>{plan.nome_exibicao}</h3>
                          <p>{plan.dias_duracao} dias de acesso</p>
                      </div>
                  </div>
                  <div className="plan-price">R$ {parseFloat(plan.preco_atual).toFixed(2)}</div>
              </div>
          ))}
      </div>

      <button className="btn-pay-now" onClick={handlePay}>PAGAR COM PIX</button>

      <div className="benefits-section">
          <div className="benefit-item"><ShieldCheck size={16}/> Pagamento Seguro</div>
          <div className="benefit-item"><Zap size={16}/> Acesso Imediato</div>
          <div className="benefit-item"><Lock size={16}/> Sigilo Total</div>
          <div className="benefit-item"><Smartphone size={16}/> Qualquer Dispositivo</div>
      </div>
    </div>
  );
}