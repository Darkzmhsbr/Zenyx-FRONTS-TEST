import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { planService, orderBumpService } from '../../services/api';
import Swal from 'sweetalert2';
import '../../assets/styles/CheckoutPage.css';

// --- ÍCONES ---
const CheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Ícones de Benefícios (Estilo Outline Red)
const SecurityIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#E10000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const ImmediateIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="#E10000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const DiscreteIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" stroke="#E10000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const MultiDeviceIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" stroke="#E10000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 18h.01" stroke="#E10000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
);

export function MiniAppCheckout() {
  const { botId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  
  // Bump
  const [bump, setBump] = useState(null);
  const [isBumpSelected, setIsBumpSelected] = useState(false);

  // Estado para capturar o usuário (Manual ou Automático)
  const [telegramUser, setTelegramUser] = useState('');
  const [autoUser, setAutoUser] = useState(null); // 🔥 Dados automáticos do Telegram

  useEffect(() => {
    carregarDados();
    verificarTelegram(); // 🕵️‍♂️ Roda a detecção automática
    window.scrollTo(0, 0);
  }, [botId]);

  // 🔥 A CARTA NA MANGA: Detecta quem é o usuário automaticamente
  const verificarTelegram = () => {
    try {
      if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.ready();
        
        // Pega os dados do usuário se disponíveis
        if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
          const user = tg.initDataUnsafe.user;
          setAutoUser({
            id: user.id, // O ID REAL NUMÉRICO! 💎
            username: user.username,
            first_name: user.first_name
          });
          // Se identificou, já expande a tela do Telegram
          tg.expand();
        }
      }
    } catch (e) {
      console.log("Acesso externo (fora do Telegram)", e);
    }
  };

  const carregarDados = async () => {
    try {
        const [pData, bData] = await Promise.all([
            planService.listPlans(botId),
            orderBumpService.get(botId)
        ]);
        
        setPlans(pData);
        if (bData && bData.ativo) setBump(bData);
        
        if (pData.length > 0) setSelectedPlan(pData[0]);
    } catch (e) {
        console.error(e);
        Swal.fire('Erro', 'Não foi possível carregar os planos.', 'error');
    } finally {
        setLoading(false);
    }
  };

  const handlePayment = (e) => {
    e.preventDefault();
    if (!selectedPlan) return;
    
    // 🔥 Validação Inteligente
    // Se NÃO tem usuário automático E o campo manual está vazio
    if (!autoUser && (!telegramUser || telegramUser.trim().length < 2)) {
        return Swal.fire({
            title: 'Identificação Necessária',
            text: 'Para receber o acesso, informe seu Usuário do Telegram.',
            icon: 'warning',
            confirmButtonColor: '#E10000',
            background: '#222',
            color: '#fff'
        });
    }

    let total = parseFloat(selectedPlan.preco_atual);
    if (isBumpSelected && bump) total += parseFloat(bump.preco);

    // Prioriza o dado automático (ID Real) sobre o manual
    const userDataFinal = autoUser ? {
        id: autoUser.id,
        username: autoUser.username || "SemUser",
        name: autoUser.first_name
    } : {
        id: telegramUser, // Vai como string se for manual
        username: telegramUser,
        name: telegramUser
    };

    navigate(`/loja/${botId}/pagamento`, {
        state: { 
            plan: selectedPlan, 
            bump: isBumpSelected ? bump : null, 
            finalPrice: total, 
            botId,
            userData: userDataFinal // 🔥 Envia o objeto completo
        }
    });
  };

  const formatPriceParts = (val) => {
    const price = parseFloat(val || 0).toFixed(2);
    const [int, dec] = price.split('.');
    return { int, dec };
  };

  if (loading) {
    return (
      <div className="checkout-page-container" style={{display:'flex', justifyContent:'center', alignItems:'center'}}>
        <p style={{color:'#fff'}}>Carregando ofertas...</p>
      </div>
    );
  }

  return (
    <div className="checkout-page-container">
      <img src="https://f005.backblazeb2.com/file/Bot-TikTok/Cards/left-grid.png" alt="" className="bg-grid-left" />
      <img src="https://f005.backblazeb2.com/file/Bot-TikTok/Cards/right-grid.png" alt="" className="bg-grid-right" />

      <header className="checkout-header">
        <h1>ASSINE JÁ!</h1>
        <p>LIBERAÇÃO IMEDIATA DE ACESSO!</p>
      </header>

      <div className="checkout-content-wrapper">
        <div className="plans-column">
          <h2>Selecione seu plano</h2>
          
          <form onSubmit={handlePayment}>
            {plans.map((plan) => {
              const isSelected = selectedPlan?.id === plan.id;
              const { int, dec } = formatPriceParts(plan.preco_atual);

              return (
                <label 
                  key={plan.id} 
                  className={`plan-card-label ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedPlan(plan)}
                >
                  <input type="radio" name="planId" value={plan.id} checked={isSelected} onChange={() => setSelectedPlan(plan)} className="plan-radio-input"/>
                  
                  <div className="radio-custom">
                    {isSelected ? (
                       <div style={{background: 'var(--primary-red)', borderRadius: '50%', width: 24, height: 24, display:'flex', alignItems:'center', justifyContent:'center'}}>
                         <CheckIcon />
                       </div>
                    ) : (
                       <div style={{border: '2px solid #ccc', borderRadius: '50%', width: 20, height: 20}}></div>
                    )}
                  </div>

                  <div className="plan-info">
                    <div className="plan-name">{plan.nome_exibicao}</div>
                    <div className="plan-desc">{plan.descricao || `${plan.dias_duracao} dias de acesso VIP`}</div>
                  </div>

                  <div className="plan-price-box">
                    <div className="price-row">
                      <span className="currency-symbol">R$</span>
                      <span className="price-int">{int},</span>
                      <span className="price-dec">{dec}</span>
                    </div>
                    <span className="pix-text">via PIX</span>
                  </div>
                </label>
              );
            })}

            {bump && (
              <div className={`order-bump-box ${isBumpSelected ? 'active' : ''}`} onClick={() => setIsBumpSelected(!isBumpSelected)}>
                <div className="bump-checkbox">{isBumpSelected && <CheckIcon />}</div>
                <div className="bump-content">
                  <h4>OFERTA ÚNICA 🔥</h4>
                  <p>Leve também <strong>{bump.nome_produto}</strong> por apenas <span style={{color: 'var(--text-yellow)', fontWeight: 'bold'}}>R$ {formatPriceParts(bump.preco).int},{formatPriceParts(bump.preco).dec}</span></p>
                </div>
              </div>
            )}

            {/* 🔥 IDENTIFICAÇÃO DO USUÁRIO (AUTO OU MANUAL) */}
            <div style={{margin: '20px 0'}}>
                <label style={{color: '#ccc', display: 'block', marginBottom: '8px', fontSize: '0.9rem'}}>
                    Identificação para Acesso <span style={{color: 'red'}}>*</span>
                </label>

                {autoUser ? (
                    // 🤖 MODO AUTOMÁTICO: Mostra o cartão do usuário detectado
                    <div style={{
                        background: 'rgba(16, 185, 129, 0.1)', 
                        border: '1px solid #10b981', 
                        padding: '12px', 
                        borderRadius: '8px',
                        display: 'flex', alignItems: 'center', gap: '10px'
                    }}>
                        <div style={{background: '#10b981', width: 32, height: 32, borderRadius: '50%', display:'flex', alignItems:'center', justifyContent:'center'}}>
                            <CheckIcon />
                        </div>
                        <div>
                            <p style={{color: '#fff', fontWeight: 'bold', margin: 0, fontSize: '0.9rem'}}>
                                {autoUser.first_name} {autoUser.username ? `(@${autoUser.username})` : ''}
                            </p>
                            <p style={{color: '#10b981', fontSize: '0.75rem', margin: 0}}>
                                ✅ Conta do Telegram identificada
                            </p>
                        </div>
                    </div>
                ) : (
                    // ✍️ MODO MANUAL: Fallback para quem acessa pelo navegador
                    <>
                        <input 
                            type="text" 
                            placeholder="Seu @usuario ou Número (Ex: (11) 99999-9999)"
                            value={telegramUser}
                            onChange={(e) => setTelegramUser(e.target.value)}
                            style={{
                                width: '100%', padding: '12px', borderRadius: '8px',
                                background: '#222', border: '1px solid #444', color: '#fff', fontSize: '1rem'
                            }}
                        />
                        <p style={{fontSize: '0.75rem', color: '#666', marginTop: '5px'}}>
                            Informe seu contato do Telegram para receber o link.
                        </p>
                    </>
                )}
            </div>

            <div className="btn-pay-container">
              <button type="submit" className="btn-pay-now">
                IR PARA O PAGAMENTO
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <div className="secure-info">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              Pagamento processado com segurança bancária
            </div>
          </form>
        </div>

        <div className="benefits-column">
          <div className="benefit-item">
            <div className="benefit-icon"><MultiDeviceIcon /></div>
            <div className="benefit-text"><h4>Acesso Universal</h4><p>Computador, Notebook, Celular ou Tablet.</p></div>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon"><DiscreteIcon /></div>
            <div className="benefit-text"><h4>Sigilo Absoluto</h4><p>Fatura discreta e 100% segura.</p></div>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon"><ImmediateIcon /></div>
            <div className="benefit-text"><h4>Liberação Imediata</h4><p>Receba seu acesso assim que pagar.</p></div>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon"><SecurityIcon /></div>
            <div className="benefit-text"><h4>Site Blindado</h4><p>Seus dados protegidos por criptografia.</p></div>
          </div>
        </div>

      </div>
    </div>
  );
}