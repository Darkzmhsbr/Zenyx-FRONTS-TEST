import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { planService, orderBumpService, miniappService } from '../../services/api';
import { Check, ShieldCheck, Zap, ArrowLeft, Plus } from 'lucide-react';
import '../../assets/styles/CheckoutPage.css'; // Criaremos no próximo lote

export function MiniAppCheckout() {
  const { botId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [bump, setBump] = useState(null);
  const [config, setConfig] = useState(null);
  
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isBumpSelected, setIsBumpSelected] = useState(false);

  useEffect(() => {
    carregarCheckout();
  }, [botId]);

  const carregarCheckout = async () => {
    try {
      setLoading(true);
      // Busca Planos, OrderBump e Config Visual em paralelo
      const [plansData, bumpData, appData] = await Promise.all([
          planService.listPlans(botId),
          orderBumpService.get(botId),
          miniappService.getPublicData(botId)
      ]);

      setPlans(plansData);
      setBump(bumpData && bumpData.ativo ? bumpData : null);
      setConfig(appData.config);

      // Seleciona o primeiro plano por padrão
      if (plansData.length > 0) setSelectedPlan(plansData[0]);

    } catch (error) {
      console.error("Erro checkout", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = () => {
      if (!selectedPlan) return;

      let finalPrice = parseFloat(selectedPlan.preco_atual);
      if (isBumpSelected && bump) {
          finalPrice += parseFloat(bump.preco);
      }

      // Redireciona para a página de pagamento (Pix Generator)
      navigate(`/loja/${botId}/pagamento`, {
          state: {
              plan: selectedPlan,
              bump: isBumpSelected ? bump : null,
              finalPrice: finalPrice,
              botId: botId
          }
      });
  };

  if (loading) return <div className="loading-screen">Carregando ofertas...</div>;

  return (
    <div className="checkout-container" style={{background: config?.background_value || '#000'}}>
      
      <div className="checkout-header">
        <button onClick={() => navigate(-1)}><ArrowLeft/></button>
        <h2>Finalizar Assinatura</h2>
      </div>

      <div className="checkout-content">
        <h3 className="section-label">ESCOLHA SEU PLANO</h3>
        
        <div className="plans-list">
            {plans.map(plan => (
                <div 
                    key={plan.id} 
                    className={`plan-card-item ${selectedPlan?.id === plan.id ? 'selected' : ''}`}
                    onClick={() => setSelectedPlan(plan)}
                    style={{borderColor: selectedPlan?.id === plan.id ? '#c333ff' : '#333'}}
                >
                    <div className="plan-radio">
                        {selectedPlan?.id === plan.id && <div className="radio-dot"></div>}
                    </div>
                    <div className="plan-info">
                        <h4>{plan.nome_exibicao}</h4>
                        <span className="plan-desc">{plan.dias_duracao} dias de acesso total</span>
                    </div>
                    <div className="plan-price">
                        R$ {parseFloat(plan.preco_atual).toFixed(2)}
                    </div>
                </div>
            ))}
        </div>

        {/* ORDER BUMP */}
        {bump && (
            <div className={`order-bump-box ${isBumpSelected ? 'active' : ''}`} onClick={() => setIsBumpSelected(!isBumpSelected)}>
                <div className="bump-header">
                    <div className="bump-check">
                        {isBumpSelected && <Check size={14} color="#fff"/>}
                    </div>
                    <span className="bump-blink">OFERTA ESPECIAL 🔥</span>
                </div>
                <div className="bump-body">
                    <p>Adicionar <strong>{bump.nome_produto}</strong> por apenas <strong>R$ {parseFloat(bump.preco).toFixed(2)}</strong>?</p>
                </div>
            </div>
        )}

        {/* RESUMO */}
        <div className="checkout-footer">
            <div className="total-row">
                <span>Total a pagar:</span>
                <span className="total-val">
                    R$ {(parseFloat(selectedPlan?.preco_atual || 0) + (isBumpSelected ? parseFloat(bump?.preco || 0) : 0)).toFixed(2)}
                </span>
            </div>
            
            <button className="btn-pay-now" onClick={handlePayment}>
                PAGAR COM PIX <Zap size={18} fill="#000" />
            </button>
            
            <div className="security-badges">
                <span><ShieldCheck size={12}/> Pagamento Seguro</span>
                <span><Check size={12}/> Acesso Imediato</span>
            </div>
        </div>

      </div>
    </div>
  );
}