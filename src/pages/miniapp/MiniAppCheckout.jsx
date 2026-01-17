import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { planService, orderBumpService } from '../../services/api';
import { Check, ShieldCheck, Lock, Zap, Smartphone, ArrowRight } from 'lucide-react';
import '../../assets/styles/CheckoutPage.css';

export function MiniAppCheckout() {
  const { botId } = useParams();
  const navigate = useNavigate();
  
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [bump, setBump] = useState(null);
  const [isBumpSelected, setIsBumpSelected] = useState(false);

  useEffect(() => {
    const carregar = async () => {
        const [pData, bData] = await Promise.all([
            planService.listPlans(botId),
            orderBumpService.get(botId)
        ]);
        setPlans(pData);
        if(bData && bData.ativo) setBump(bData);
        if(pData.length > 0) setSelectedPlan(pData[0]);
    };
    carregar();
  }, [botId]);

  const handlePay = () => {
      if(!selectedPlan) return;
      let total = parseFloat(selectedPlan.preco_atual);
      if(isBumpSelected && bump) total += parseFloat(bump.preco);
      
      navigate(`/loja/${botId}/pagamento`, { state: { plan: selectedPlan, bump: isBumpSelected ? bump : null, finalPrice: total } });
  }

  return (
    <div className="checkout-page-container">
      <div className="checkout-header"><h2>FINALIZAR ASSINATURA</h2></div>

      <div style={{display:'flex', flexDirection:'column', gap: 15}}>
        {plans.map(plan => (
            <div key={plan.id} className={`plan-selection-card ${selectedPlan?.id === plan.id ? 'active' : ''}`} onClick={() => setSelectedPlan(plan)}>
                <div className="plan-left">
                    <div className="custom-checkbox">
                        {selectedPlan?.id === plan.id && <Check size={18} color="#fff" strokeWidth={3}/>}
                    </div>
                    <div className="plan-info">
                        <h3>{plan.nome_exibicao}</h3>
                        <p>{plan.dias_duracao} dias de acesso VIP</p>
                    </div>
                </div>
                <div className="plan-price">R$ {parseFloat(plan.preco_atual).toFixed(2)}</div>
            </div>
        ))}
      </div>

      {bump && (
          <div className="order-bump-container" onClick={() => setIsBumpSelected(!isBumpSelected)}>
              <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:8}}>
                  <div className={`custom-checkbox`} style={{width:20, height:20, background: isBumpSelected ? '#E10000' : 'transparent', borderColor: isBumpSelected ? '#E10000' : '#fbbf24'}}>
                      {isBumpSelected && <Check size={14} color="#fff"/>}
                  </div>
                  <span style={{color: '#E10000', fontWeight:800}}>OFERTA ESPECIAL 🔥</span>
              </div>
              <p style={{margin:0, color:'#fff'}}>Adicione <strong>{bump.nome_produto}</strong> por apenas <span style={{color:'#fbbf24'}}>R$ {parseFloat(bump.preco).toFixed(2)}</span></p>
          </div>
      )}

      <div className="btn-pay-container">
          <button className="btn-pay-now" onClick={handlePay}>
              PAGAR COM PIX <ArrowRight size={24} style={{marginLeft:10}}/>
          </button>
      </div>

      <div className="benefits-section">
          <div className="benefit-item"><ShieldCheck size={20} color="#555"/> Pagamento Seguro</div>
          <div className="benefit-item"><Zap size={20} color="#555"/> Acesso Imediato</div>
          <div className="benefit-item"><Lock size={20} color="#555"/> Sigilo Total</div>
          <div className="benefit-item"><Smartphone size={20} color="#555"/> Qualquer Aparelho</div>
      </div>
    </div>
  );
}