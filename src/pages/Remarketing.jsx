import React, { useState, useEffect } from 'react';
import { useBot } from '../context/BotContext';
import { remarketingService, planService } from '../services/api';
import Swal from 'sweetalert2';
import './Remarketing.css';

// COMPONENTE WIZARD INTERNO
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

    // FUNÇÃO DE REUTILIZAR
    const handleReuse = (h) => {
        let config = {};
        try { config = typeof h.config === 'object' ? h.config : JSON.parse(h.config); } catch(e){}
        
        setData({
            tipo: 'personalizado',
            target: h.target || config.target || 'todos',
            promo: config.offer || false,
            plan_id: config.plano_id || '',
            price_type: 'custom',
            custom_price: config.promo_price || '',
            expiration: 'none',
            expire_value: '',
            message: config.msg || '',
            media_url: config.media || ''
        });
        
        Swal.fire({
            title: 'Dados Carregados!', text: 'Revise antes de enviar.', icon: 'success',
            timer: 1500, showConfirmButton: false, background: '#151515', color:'#fff'
        });
        
        setStep(7); // Vai direto para o passo de conteúdo
    };

    const handleTestSend = async () => {
        // Lógica de cálculo de preço
        let finalPrice = 0;
        const selectedPlan = plans.find(p => p.id === parseInt(data.plan_id)) || plans.find(p => p.key_id === data.plan_id);
        
        if (data.promo) {
            if (data.price_type === 'original') finalPrice = selectedPlan?.preco_cheio || 0;
            else if (data.price_type === 'promo') finalPrice = selectedPlan?.preco_atual || 0;
            else finalPrice = parseFloat(data.custom_price);
        }

        const payload = {
            bot_id: initialBotId,
            tipo_envio: data.target,
            mensagem: data.message,
            media_url: data.media_url || null,
            incluir_oferta: data.promo,
            plano_oferta_id: data.plan_id || null,
            valor_oferta: finalPrice,
            expire_timestamp: 0,
            is_periodic: false,
            specific_user_id: null 
        };

        Swal.fire({ title: 'Enviando Teste...', background: '#151515', color:'#fff', didOpen: () => Swal.showLoading() });
        try {
            // No teste enviamos para o Admin (você) - O Backend precisa tratar isso se quiser
            // Como não temos seu ID aqui, vamos simular enviando para "teste"
            await remarketingService.send({ ...payload, tipo_envio: 'teste' }); 
            Swal.fire({title:'Sucesso!', text:'Teste enviado para Admins.', icon:'success', background:'#151515', color:'#fff'});
        } catch (e) {
            Swal.fire('Erro', 'Falha ao enviar teste.', 'error');
        }
    };

    const handleFinalSend = () => {
        let finalPrice = 0;
        const selectedPlan = plans.find(p => p.id === parseInt(data.plan_id)) || plans.find(p => p.key_id === data.plan_id);

        if (data.promo) {
            if (data.price_type === 'original') finalPrice = selectedPlan?.preco_cheio || 0;
            else if (data.price_type === 'promo') finalPrice = selectedPlan?.preco_atual || 0;
            else finalPrice = parseFloat(data.custom_price);
        }

        // Calculo validade
        let expireTS = 0;
        if (data.promo && data.expiration !== 'none') {
            const now = Math.floor(Date.now() / 1000);
            const qtd = parseInt(data.expire_value);
            if (data.expiration === 'min') expireTS = now + (qtd * 60);
            if (data.expiration === 'day') expireTS = now + (qtd * 86400);
        }

        const payload = {
            bot_id: initialBotId,
            tipo_envio: data.target,
            mensagem: data.message,
            media_url: data.media_url || null,
            incluir_oferta: data.promo,
            plano_oferta_id: data.plan_id || null,
            valor_oferta: finalPrice,
            expire_timestamp: expireTS,
            is_periodic: data.tipo === 'periodico',
            periodic_days: parseInt(data.periodic_days || 0),
            periodic_time: data.periodic_time || null
        };

        setSending(true);
        onSend(payload).then(() => {
            setSending(false);
            setStep(0);
            setData({ tipo: '', target: '', promo: false, message: '', media_url: '' });
            remarketingService.getHistory(initialBotId).then(setHistory);
        });
    };

    return (
        <div className="wizard-container">
            <div className="wizard-step-indicator">ETAPA {step + 1}</div>
            
            {step === 0 && (
                <>
                    <h2 className="wizard-title">Qual tipo de Remarketing?</h2>
                    <div className="wizard-options-grid">
                        <div className="option-card" onClick={() => { update('tipo', 'personalizado'); next(); }}>
                            <div className="option-icon">🔄</div>
                            <div className="option-text"><strong>Personalizado (Imediato)</strong><span>Envio único agora mesmo.</span></div>
                        </div>
                        <div className="option-card" onClick={() => { update('tipo', 'periodico'); setStep(10); }}>
                            <div className="option-icon">📅</div>
                            <div className="option-text"><strong>Periódico (Automático)</strong><span>Configurar envio recorrente.</span></div>
                        </div>
                    </div>
                    {/* HISTÓRICO */}
                    <div style={{marginTop: '40px', borderTop:'1px solid #333', paddingTop:'20px'}}>
                        <h3 style={{color:'#888', marginBottom:'15px'}}>📜 Histórico Recente</h3>
                        {history.length > 0 ? (
                            <table className="crm-table">
                                <thead><tr><th>Data</th><th>Alvo</th><th>Enviados</th><th>Ação</th></tr></thead>
                                <tbody>
                                    {history.map((h, i) => (
                                        <tr key={i}>
                                            <td>{h.data}</td>
                                            <td>{h.target}</td>
                                            <td style={{color:'#10b981'}}>✅ {h.sent}</td>
                                            <td><button className="btn-reuse" onClick={() => handleReuse(h)}>🔄 Reutilizar</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : <p style={{color:'#666'}}>Nenhum disparo recente.</p>}
                    </div>
                </>
            )}

            {step === 1 && (
                <>
                    <h2 className="wizard-title">Quem deve receber?</h2>
                    <div className="wizard-options-grid">
                        <div className={`option-card ${data.target === 'leads' ? 'selected' : ''}`} onClick={() => { update('target', 'leads'); next(); }}>
                            <div className="option-icon">👥</div>
                            <div className="option-text"><strong>Somente Não Pagantes</strong><span>Leads que não compraram.</span></div>
                        </div>
                        <div className={`option-card ${data.target === 'todos' ? 'selected' : ''}`} onClick={() => { update('target', 'todos'); next(); }}>
                            <div className="option-icon">📢</div>
                            <div className="option-text"><strong>Todos os Usuários</strong><span>Inclui quem já é VIP.</span></div>
                        </div>
                        <div className={`option-card ${data.target === 'expirados' ? 'selected' : ''}`} onClick={() => { update('target', 'expirados'); next(); }}>
                            <div className="option-icon">💔</div>
                            <div className="option-text"><strong>Ex-Assinantes</strong><span>Recuperação de acesso.</span></div>
                        </div>
                    </div>
                    <div className="wizard-actions"><button className="btn-back" onClick={back}>Voltar</button></div>
                </>
            )}

            {step === 2 && (
                <>
                    <h2 className="wizard-title">Incluir Botão de Compra?</h2>
                    <div className="wizard-options-grid">
                        <div className={`option-card ${data.promo ? 'selected' : ''}`} onClick={() => { update('promo', true); next(); }}>
                            <div className="option-icon">✅</div>
                            <div className="option-text"><strong>SIM, Incluir Promoção</strong></div>
                        </div>
                        <div className={`option-card ${!data.promo ? 'selected' : ''}`} onClick={() => { update('promo', false); setStep(7); }}>
                            <div className="option-icon">❌</div>
                            <div className="option-text"><strong>NÃO, Apenas Conteúdo</strong></div>
                        </div>
                    </div>
                    <div className="wizard-actions"><button className="btn-back" onClick={back}>Voltar</button></div>
                </>
            )}

            {step === 3 && (
                <>
                    <h2 className="wizard-title">Selecione o Plano</h2>
                    <div className="wizard-options-grid">
                        {plans.map(p => (
                            <div key={p.id} className={`option-card ${data.plan_id === p.id ? 'selected' : ''}`} onClick={() => { update('plan_id', p.id); next(); }}>
                                <div className="option-icon">💎</div>
                                <div className="option-text"><strong>{p.nome_exibicao}</strong><span>R$ {p.preco_atual}</span></div>
                            </div>
                        ))}
                    </div>
                    <div className="wizard-actions"><button className="btn-back" onClick={back}>Voltar</button></div>
                </>
            )}

            {step === 4 && (
                <>
                    <h2 className="wizard-title">Qual valor usar?</h2>
                    <div className="wizard-options-grid">
                        <div className="option-card" onClick={() => { update('price_type', 'original'); next(); }}>
                            <div className="option-icon">💲</div><strong>Valor Original</strong>
                        </div>
                        <div className="option-card" onClick={() => { update('price_type', 'custom'); next(); }}>
                            <div className="option-icon">✏️</div><strong>Valor Personalizado</strong>
                        </div>
                    </div>
                    <div className="wizard-actions"><button className="btn-back" onClick={back}>Voltar</button></div>
                </>
            )}

            {step === 5 && (
                <>
                    <h2 className="wizard-title">Digite o Valor (R$)</h2>
                    <div style={{textAlign:'center'}}>
                        <input type="number" step="0.01" value={data.custom_price} onChange={e => update('custom_price', e.target.value)} style={{fontSize: '1.5rem', padding: '15px', borderRadius:'8px', border:'1px solid #333', background:'#111', color:'#fff'}} />
                    </div>
                    <div className="wizard-actions"><button className="btn-back" onClick={back}>Voltar</button><button className="btn-next" onClick={next}>Próximo</button></div>
                </>
            )}

             {step === 6 && (
                <>
                    <h2 className="wizard-title">Validade da Oferta</h2>
                    {data.expiration === 'none' && (
                        <div className="wizard-options-grid">
                            <div className="option-card" onClick={() => update('expiration', 'min')}>⏳ Minutos</div>
                            <div className="option-card" onClick={() => update('expiration', 'day')}>📅 Dias</div>
                            <div className="option-card" onClick={() => next()}>♾️ Sem Validade</div>
                        </div>
                    )}
                    {data.expiration !== 'none' && (
                        <div style={{textAlign:'center'}}>
                            <p>Quantidade de {data.expiration === 'min' ? 'Minutos' : 'Dias'}:</p>
                            <input type="number" onChange={e => update('expire_value', e.target.value)} style={{padding:'10px', borderRadius:'6px', background:'#111', color:'#fff', border:'1px solid #333'}} />
                            <br/><br/>
                            <button className="btn-next" onClick={next}>Confirmar</button>
                        </div>
                    )}
                     <div className="wizard-actions"><button className="btn-back" onClick={() => {update('expiration', 'none'); back();}}>Voltar</button></div>
                </>
            )}

            {step === 7 && (
                <>
                    <h2 className="wizard-title">Conteúdo da Mensagem</h2>
                    <div style={{marginBottom:'20px'}}>
                        <label>Link da Mídia (Opcional)</label>
                        <input type="text" placeholder="https://..." value={data.media_url} onChange={e => update('media_url', e.target.value)} style={{width:'100%', padding:'10px', background:'#222', color:'#fff', border:'1px solid #444', borderRadius:'8px'}} />
                    </div>
                    <div>
                        <label>Mensagem de Texto</label>
                        <textarea rows="5" placeholder="Digite sua mensagem..." value={data.message} onChange={e => update('message', e.target.value)} style={{width:'100%', padding:'15px', background:'#222', color:'#fff', border:'1px solid #444', borderRadius:'8px'}}></textarea>
                    </div>
                    <div className="wizard-actions"><button className="btn-back" onClick={back}>Voltar</button><button className="btn-next" onClick={next}>Revisar</button></div>
                </>
            )}

            {step === 8 && (
                <>
                    <h2 className="wizard-title">Revisão Final</h2>
                    <div style={{background:'#222', padding:'20px', borderRadius:'10px', marginBottom:'20px'}}>
                        <p><strong>Tipo:</strong> {data.tipo}</p>
                        <p><strong>Público:</strong> {data.target}</p>
                        <p><strong>Oferta:</strong> {data.promo ? 'Sim' : 'Não'}</p>
                        <p><strong>Mensagem:</strong> {data.message}</p>
                    </div>
                    <div className="wizard-actions">
                        <button className="btn-back" onClick={back}>Voltar</button>
                        <div style={{display:'flex', gap:'10px'}}>
                            <button className="btn-reuse" onClick={handleTestSend}>🔬 Teste</button>
                            <button className="btn-next" onClick={handleFinalSend} disabled={sending}>🚀 DISPARAR</button>
                        </div>
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