import React, { useState, useEffect } from 'react';
import { useBot } from '../context/BotContext';
import { remarketingService, planService } from '../services/api';
import Swal from 'sweetalert2';
import './Remarketing.css';

function RemarketingWizard({ plans, onSend, initialBotId }) {
    const [step, setStep] = useState(0);
    const [sending, setSending] = useState(false); 
    const [history, setHistory] = useState([]); 

    const [data, setData] = useState({
        tipo: '', target: '', promo: false, plan_id: '',
        price_type: '', custom_price: '', expiration: 'none', expire_value: '',
        periodic_days: '', periodic_time: '', message: '', media_url: '' 
    });

    useEffect(() => {
        if(initialBotId) {
            remarketingService.getHistory(initialBotId).then(res => setHistory(res || []));
        }
    }, [initialBotId]);

    const update = (field, value) => setData(prev => ({ ...prev, [field]: value }));
    const next = () => setStep(s => s + 1);
    const back = () => setStep(s => s - 1);

    const handleReuse = (h) => {
        let config = {};
        try { config = typeof h.config === 'object' ? h.config : JSON.parse(h.config); } catch(e){}
        setData({
            tipo: 'personalizado',
            target: h.target || 'todos',
            promo: config.offer || false,
            plan_id: config.plano_id || '',
            price_type: 'custom',
            custom_price: config.promo_price || '',
            expiration: 'none',
            expire_value: '',
            message: config.msg || '',
            media_url: config.media || ''
        });
        setStep(7);
    };

    // --- CORREÇÃO CRÍTICA: SANITIZAÇÃO DE DADOS ---
    const sanitizePayload = (formData, finalPrice, expireTS) => {
        return {
            bot_id: initialBotId,
            tipo_envio: formData.target,
            mensagem: formData.message,
            media_url: formData.media_url || null,
            incluir_oferta: formData.promo,
            plano_oferta_id: formData.plan_id ? String(formData.plan_id) : null,
            valor_oferta: finalPrice ? parseFloat(finalPrice) : 0.0,
            expire_timestamp: expireTS ? parseInt(expireTS) : 0,
            is_periodic: formData.tipo === 'periodico',
            periodic_days: formData.periodic_days ? parseInt(formData.periodic_days) : 0,
            periodic_time: formData.periodic_time || null,
            specific_user_id: null 
        };
    };

    const handleFinalSend = () => {
        let finalPrice = 0;
        const selectedPlan = plans.find(p => p.id == data.plan_id) || plans.find(p => p.key_id == data.plan_id);
        
        if (data.promo) {
            if (data.price_type === 'original') finalPrice = selectedPlan?.preco_cheio || 0;
            else if (data.price_type === 'promo') finalPrice = selectedPlan?.preco_atual || 0;
            else finalPrice = parseFloat(data.custom_price);
        }

        let expireTS = 0;
        if (data.promo && data.expiration !== 'none') {
            const now = Math.floor(Date.now() / 1000);
            const qtd = parseInt(data.expire_value) || 0;
            if (data.expiration === 'min') expireTS = now + (qtd * 60);
            if (data.expiration === 'day') expireTS = now + (qtd * 86400);
        }

        // Sanitiza antes de enviar
        const payload = sanitizePayload(data, finalPrice, expireTS);

        setSending(true);
        onSend(payload).then(() => {
            setSending(false);
            setStep(0);
            setData({ tipo: '', target: '', promo: false, message: '', media_url: '' });
            remarketingService.getHistory(initialBotId).then(setHistory);
        });
    };

    // (O resto do Wizard permanece com a lógica de navegação)
    return (
        <div className="wizard-container">
            <div className="wizard-step-indicator">ETAPA {step + 1}</div>
            {step === 0 && (
                <>
                    <h2 className="wizard-title">Tipo de Remarketing</h2>
                    <div className="wizard-options-grid">
                        <div className="option-card" onClick={() => { update('tipo', 'personalizado'); next(); }}>Imediato</div>
                        <div className="option-card" onClick={() => { update('tipo', 'periodico'); setStep(10); }}>Agendado</div>
                    </div>
                    <div style={{marginTop:'30px'}}>
                        <h3>Histórico</h3>
                        {history.map((h,i) => (
                            <div key={i} className="history-item">
                                <span>{h.data} • {h.target}</span>
                                <button className="btn-reuse" onClick={() => handleReuse(h)}>Reutilizar</button>
                            </div>
                        ))}
                    </div>
                </>
            )}
            
            {step === 1 && (
                <>
                    <h2 className="wizard-title">Público Alvo</h2>
                    <div className="wizard-options-grid">
                        <div className="option-card" onClick={() => { update('target', 'leads'); next(); }}>Leads</div>
                        <div className="option-card" onClick={() => { update('target', 'todos'); next(); }}>Todos</div>
                        <div className="option-card" onClick={() => { update('target', 'expirados'); next(); }}>Ex-Assinantes</div>
                    </div>
                    <div className="wizard-actions"><button onClick={back} className="btn-back">Voltar</button></div>
                </>
            )}

            {step === 2 && (
                <>
                    <h2 className="wizard-title">Incluir Oferta?</h2>
                    <div className="wizard-options-grid">
                        <div className="option-card" onClick={() => { update('promo', true); next(); }}>Sim</div>
                        <div className="option-card" onClick={() => { update('promo', false); setStep(7); }}>Não</div>
                    </div>
                    <div className="wizard-actions"><button onClick={back} className="btn-back">Voltar</button></div>
                </>
            )}

            {step === 3 && (
                <>
                    <h2 className="wizard-title">Escolha o Plano</h2>
                    <div className="wizard-options-grid">
                        {plans.map(p => (
                            <div key={p.id} className="option-card" onClick={() => { update('plan_id', p.id); next(); }}>
                                {p.nome_exibicao} - R$ {p.preco_atual}
                            </div>
                        ))}
                    </div>
                    <div className="wizard-actions"><button onClick={back} className="btn-back">Voltar</button></div>
                </>
            )}

            {step === 4 && (
                <>
                    <h2 className="wizard-title">Definir Preço</h2>
                    <div className="wizard-options-grid">
                        <div className="option-card" onClick={() => { update('price_type', 'original'); next(); }}>Original</div>
                        <div className="option-card" onClick={() => { update('price_type', 'custom'); next(); }}>Personalizado</div>
                    </div>
                    <div className="wizard-actions"><button onClick={back} className="btn-back">Voltar</button></div>
                </>
            )}

            {step === 5 && (
                <>
                    <h2 className="wizard-title">Valor (R$)</h2>
                    <input type="number" value={data.custom_price} onChange={e => update('custom_price', e.target.value)} style={{padding:'10px', fontSize:'1.2rem', color:'#000'}} />
                    <div className="wizard-actions"><button onClick={back} className="btn-back">Voltar</button><button onClick={next} className="btn-next">Próximo</button></div>
                </>
            )}

            {step === 6 && (
                <>
                    <h2 className="wizard-title">Validade</h2>
                    <div className="wizard-options-grid">
                        <div className="option-card" onClick={() => update('expiration', 'min')}>Minutos</div>
                        <div className="option-card" onClick={() => update('expiration', 'day')}>Dias</div>
                        <div className="option-card" onClick={next}>Sem Validade</div>
                    </div>
                    {data.expiration !== 'none' && (
                        <div>
                            <input type="number" placeholder="Quantidade" onChange={e => update('expire_value', e.target.value)} />
                            <button onClick={next} className="btn-next">Confirmar</button>
                        </div>
                    )}
                    <div className="wizard-actions"><button onClick={back} className="btn-back">Voltar</button></div>
                </>
            )}

            {step === 7 && (
                <>
                    <h2 className="wizard-title">Conteúdo</h2>
                    <input type="text" placeholder="URL da Mídia (Opcional)" value={data.media_url} onChange={e => update('media_url', e.target.value)} style={{width:'100%', marginBottom:'10px', padding:'10px'}} />
                    <textarea rows="5" placeholder="Mensagem..." value={data.message} onChange={e => update('message', e.target.value)} style={{width:'100%', padding:'10px'}}></textarea>
                    <div className="wizard-actions"><button onClick={back} className="btn-back">Voltar</button><button onClick={next} className="btn-next">Revisar</button></div>
                </>
            )}

            {step === 8 && (
                <>
                    <h2 className="wizard-title">Revisão</h2>
                    <div className="review-box">
                        <p>Alvo: {data.target}</p>
                        <p>Oferta: {data.promo ? 'Sim' : 'Não'}</p>
                        <p>Mensagem: {data.message}</p>
                    </div>
                    <div className="wizard-actions">
                        <button onClick={back} className="btn-back">Voltar</button>
                        <button onClick={handleFinalSend} disabled={sending} className="btn-next">DISPARAR 🚀</button>
                    </div>
                </>
            )}
        </div>
    );
}

export function Remarketing() {
  const { selectedBot } = useBot();
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    if (selectedBot) {
      planService.listPlans(selectedBot.id).then(setPlans).catch(console.error);
    }
  }, [selectedBot]);

  const handleSendApi = async (payload) => {
      try {
          await remarketingService.send(payload);
          Swal.fire({title: 'Enviando!', text: 'Campanha iniciada.', icon: 'success', background: '#151515', color:'#fff'});
      } catch (e) {
          Swal.fire('Erro', 'Falha ao iniciar campanha.', 'error');
      }
  };

  if (!selectedBot) return <div className="empty-state"><h2>Selecione um bot.</h2></div>;

  return (
    <div className="remarketing-container">
       <RemarketingWizard plans={plans} onSend={handleSendApi} initialBotId={selectedBot.id} />
    </div>
  );
}