import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { planService, orderBumpService } from '../../services/api';
import Swal from 'sweetalert2';
import '../../assets/styles/CheckoutPage.css';

// --- ÍCONES SVG ORIGINAIS DO PROJETO BASE ---
const CheckIcon = () => (
  <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 5L4.5 8.5L13 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SecurityIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 3.33334L6.66666 8.33334V18.3333C6.66666 26.55 12.3833 34.2 20 36.0667C27.6167 34.2 33.3333 26.55 33.3333 18.3333V8.33334L20 3.33334ZM20 23.3333H28.3333" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 18.3333L18.3333 21.6667L25 15" stroke="#E10000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LightningIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21.6667 3.33334L6.66666 21.6667H20L18.3333 36.6667L33.3333 18.3333H20L21.6667 3.33334Z" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PrivateIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 3.33334C15.4 3.33334 11.6667 7.06667 11.6667 11.6667V16.6667H10C8.16666 16.6667 6.66666 18.1667 6.66666 20V33.3333C6.66666 35.1667 8.16666 36.6667 10 36.6667H30C31.8333 36.6667 33.3333 35.1667 33.3333 33.3333V20C33.3333 18.1667 31.8333 16.6667 30 16.6667H28.3333V11.6667C28.3333 7.06667 24.6 3.33334 20 3.33334ZM20 28.3333C19.0833 28.3333 18.3333 27.5833 18.3333 26.6667C18.3333 25.75 19.0833 25 20 25C20.9167 25 21.6667 25.75 21.6667 26.6667C21.6667 27.5833 20.9167 28.3333 20 28.3333ZM25 16.6667H15V11.6667C15 8.9 17.2333 6.66667 20 6.66667C22.7667 6.66667 25 8.9 25 11.6667V16.6667Z" fill="#555"/>
  </svg>
);

const DeviceIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8.33334" y="3.33334" width="23.3333" height="33.3333" rx="3" stroke="#aaa" strokeWidth="2"/>
    <path d="M20 30H20.0167" stroke="#aaa" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

// --- COMPONENTE PRINCIPAL ---
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
    carregarDados();
  }, [botId]);

  const carregarDados = async () => {
    try {
        const [pData, bData] = await Promise.all([
            planService.listPlans(botId),
            orderBumpService.get(botId)
        ]);
        
        setPlans(pData);
        if (bData && bData.ativo) setBump(bData);
        
        // Seleciona o primeiro plano por padrão
        if (pData.length > 0) setSelectedPlan(pData[0]);
    } catch (e) {
        console.error(e);
        Swal.fire('Erro', 'Não foi possível carregar os planos.', 'error');
    } finally {
        setLoading(false);
    }
  };

  const handlePayment = () => {
    if (!selectedPlan) return;
    
    let total = parseFloat(selectedPlan.preco_atual);
    if (isBumpSelected && bump) total += parseFloat(bump.preco);

    navigate(`/loja/${botId}/pagamento`, {
        state: { 
            plan: selectedPlan, 
            bump: isBumpSelected ? bump : null, 
            finalPrice: total, 
            botId 
        }
    });
  };

  if (loading) return <div className="checkout-page-container"></div>;

  return (
    <div className="checkout-page-container">
      {/* Elementos de Grade do Fundo (Decorativos do seu CSS) */}
      <div className="bg-grid-left"></div>
      <div className="bg-grid-right"></div>

      <div className="checkout-content">
        <div className="checkout-header">
          <h2>Finalizar Assinatura</h2>
          <p>Escolha o melhor plano para você</p>
        </div>

        {/* LISTA DE PLANOS */}
        <div className="plans-list">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`plan-selection-card ${selectedPlan?.id === plan.id ? 'active' : ''}`}
              onClick={() => setSelectedPlan(plan)}
            >
              <div className="plan-left">
                <div className="custom-checkbox">
                  {selectedPlan?.id === plan.id && <CheckIcon />}
                </div>
                <div className="plan-info">
                  <span className="plan-name">{plan.nome_exibicao}</span>
                  <span className="plan-desc">{plan.descricao || `${plan.dias_duracao} dias de acesso ilimitado`}</span>
                </div>
              </div>
              
              <div className="plan-price-box">
                <span className="plan-price">R$ {parseFloat(plan.preco_atual).toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ORDER BUMP (SE TIVER) */}
        {bump && (
          <div 
            className="order-bump-container"
            onClick={() => setIsBumpSelected(!isBumpSelected)}
          >
            <div className="bump-header">
              <div className="custom-checkbox" style={{borderColor: isBumpSelected ? '#E10000' : '#555', background: isBumpSelected ? '#E10000' : 'transparent'}}>
                 {isBumpSelected && <CheckIcon />}
              </div>
              <span className="bump-tag">OFERTA ÚNICA 🔥</span>
            </div>
            <p className="bump-desc">
                Adicione <strong>{bump.nome_produto}</strong> ao seu pedido por apenas <span style={{color:'#fbbf24'}}>R$ {parseFloat(bump.preco).toFixed(2).replace('.', ',')}</span>.
            </p>
          </div>
        )}

        {/* BOTÃO DE AÇÃO */}
        <div className="btn-pay-container">
          <button className="btn-pay-now" onClick={handlePayment}>
            PAGAR COM PIX
          </button>
        </div>

        {/* BENEFÍCIOS (BASEADO NOS ÍCONES DO SEU PROJETO) */}
        <div className="benefits-section">
            <div className="benefit-item">
                <div className="benefit-icon"><SecurityIcon /></div>
                <div className="benefit-text">
                    <h4>Compra Segura</h4>
                    <p>Seus dados estão protegidos.</p>
                </div>
            </div>
            <div className="benefit-item">
                <div className="benefit-icon"><LightningIcon /></div>
                <div className="benefit-text">
                    <h4>Acesso Imediato</h4>
                    <p>Receba acesso na hora.</p>
                </div>
            </div>
            <div className="benefit-item">
                <div className="benefit-icon"><PrivateIcon /></div>
                <div className="benefit-text">
                    <h4>Sigilo Total</h4>
                    <p>Fatura discreta no cartão.</p>
                </div>
            </div>
            <div className="benefit-item">
                <div className="benefit-icon"><DeviceIcon /></div>
                <div className="benefit-text">
                    <h4>Multi-Telas</h4>
                    <p>Acesse pelo celular ou PC.</p>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}