import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { planService, orderBumpService } from '../../services/api';
import { Check, ShieldCheck, Lock, ArrowRight, Zap } from 'lucide-react';
import '../../assets/styles/CheckoutPage.css';

export function MiniAppCheckout() {
  const { botId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    carregarDados();
  }, [botId]);

  const carregarDados = async () => {
    try {
      const plansData = await planService.listPlans(botId);
      setPlans(plansData);
      // Tenta selecionar o plano "Popular" ou o do meio
      if (plansData.length > 0) {
          // Lógica simples: seleciona o segundo se existir, senão o primeiro
          setSelectedPlan(plansData[1] || plansData[0]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = () => {
      if (!selectedPlan) return;
      navigate(`/loja/${botId}/pagamento`, {
          state: {
              plan: selectedPlan,
              finalPrice: parseFloat(selectedPlan.preco_atual),
              botId: botId
          }
      });
  };

  if (loading) return <div style={{background:'#000', height:'100vh', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center'}}>Carregando ofertas...</div>;

  return (
    <div className="checkout-container">
      
      <div className="checkout-header">
        <h2>Selecione seu plano</h2>
      </div>

      {/* BANNER VERDE */}
      <div className="discount-banner">
        <Zap size={18} fill="#fff" />
        PARABÉNS! SEU DESCONTO DE 50% FOI ATIVADO
      </div>

      <div className="plans-list">
        {plans.map((plan, index) => {
            const isSelected = selectedPlan?.id === plan.id;
            // Define tag baseada no índice (simulação do PDF)
            let tag = "";
            if (index === 0) tag = "POUCAS VAGAS";
            if (index === 1) tag = "POPULAR";
            if (index === 2) tag = "MELHOR OFERTA";

            return (
                <div 
                    key={plan.id} 
                    className={`plan-card-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedPlan(plan)}
                >
                    {/* Checkbox Lateral */}
                    <div className="plan-check-area">
                        <div className="custom-radio">
                            {isSelected && <Check size={14} strokeWidth={4} />}
                        </div>
                    </div>

                    {/* Conteúdo */}
                    <div className="plan-content">
                        {tag && <span className="plan-tag">{tag}</span>}
                        <span className="plan-title">{plan.nome_exibicao}</span>
                        <span className="plan-desc">{plan.descricao || "Acesso imediato ao grupo VIP"}</span>
                        <span className="plan-desc" style={{textDecoration:'line-through', marginTop: 5, color:'#999'}}>
                            De R$ {(parseFloat(plan.preco_atual) * 2).toFixed(2)}
                        </span>
                    </div>

                    {/* Preço Colorido */}
                    <div className="plan-price-box">
                        <div style={{display:'flex', flexDirection:'column', alignItems:'center', lineHeight:1}}>
                            <span style={{fontSize:'0.8rem', fontWeight:400}}>R$</span>
                            {Math.floor(plan.preco_atual)},<small style={{fontSize:'0.8rem'}}>{(plan.preco_atual % 1).toFixed(2).substring(2)}</small>
                        </div>
                    </div>
                </div>
            );
        })}
      </div>

      <p className="footer-note">
        * Os planos serão contados a partir da data de confirmação do pagamento.
      </p>

      {/* FOOTER FIXO */}
      <div className="checkout-fixed-footer">
          <button className="btn-pay-premium" onClick={handlePayment}>
              IR PARA O PAGAMENTO <ArrowRight size={20} strokeWidth={3} />
          </button>
          
          <div className="security-row">
              <span><ShieldCheck size={14}/> Compra Segura</span>
              <span><Lock size={14}/> Dados Protegidos</span>
          </div>
      </div>

    </div>
  );
}