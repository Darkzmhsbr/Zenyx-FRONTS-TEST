import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { History } from 'lucide-react';
import { planService, remarketingService } from '../services/api';
import { useBot } from '../context/BotContext'; // <--- Contexto
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { TextArea } from '../components/TextArea';
import './Remarketing.css';

// --- SUB-COMPONENTE: WIZARD ---
function RemarketingWizard({ plans, onSend }) {
    const [step, setStep] = useState(0);
    const [sending, setSending] = useState(false);
    const [progress, setProgress] = useState({ sent: 0, total: 0, blocked: 0 });

    const [data, setData] = useState({
        tipo: '', target: '', promo: false, plan_id: '',
        price_type: '', custom_price: '', message: '', media_url: '' 
    });

    const update = (field, value) => setData(prev => ({ ...prev, [field]: value }));
    const next = () => setStep(s => s + 1);
    const back = () => setStep(s => s - 1);

    const handleSend = async (isTest = false) => {
        let finalPrice = 0;
        const selectedPlan = plans.find(p => p.id === parseInt(data.plan_id));
        
        if (data.promo) {
            if (data.price_type === 'original') finalPrice = selectedPlan?.preco_cheio || 0;
            else if (data.price_type === 'promo') finalPrice = selectedPlan?.preco_atual || 0;
            else finalPrice = parseFloat(data.custom_price);
        }

        const payload = {
            tipo_envio: data.target,
            mensagem: data.message,
            media_url: data.media_url || null,
            incluir_oferta: data.promo,
            plano_oferta_id: data.plan_id ? String(data.plan_id) : null,
            valor_oferta: finalPrice,
            is_periodic: false
        };

        if (isTest) {
            Swal.fire({ title: 'Enviando Teste...', didOpen: () => Swal.showLoading() });
            try {
                await onSend(payload, true);
                Swal.fire('Sucesso!', 'Mensagem de teste enviada.', 'success');
            } catch (e) {
                Swal.fire('Erro', 'Falha ao enviar teste.', 'error');
            }
        } else {
            setSending(true);
            onSend(payload, false).then(() => {
                const interval = setInterval(async () => {
                    try {
                        const status = await remarketingService.getStatus();
                        setProgress({ sent: status.sent, total: status.total, blocked: status.blocked });
                        if (!status.running) {
                            clearInterval(interval);
                            setSending(false);
                            Swal.fire({
                                title: 'Envio Concluído!',
                                html: `✅ Entregues: <b>${status.sent}</b><br>🚫 Bloqueados: <b>${status.blocked}</b>`,
                                icon: 'success'
                            });
                            setStep(0); 
                        }
                    } catch (e) { console.error(e); }
                }, 1000);
            });
        }
    };

    if (sending) {
        return (
            <div className="wizard-card" style={{ textAlign: 'center' }}>
                <h2 className="wizard-title">🚀 Enviando...</h2>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>
                    {progress.sent} <span style={{ fontSize: '1.5rem', color: '#666' }}>/ {progress.total}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="wizard-card">
            <div className="wizard-step-indicator">ETAPA {step + 1} DE 5</div>
            {/* ETAPA 0 */}
            {step === 0 && (
                <>
                    <h2 className="wizard-title">Qual o tipo de envio?</h2>
                    <div className="wizard-options-grid">
                        <div className="option-card selected" onClick={() => next()}>
                            <span className="option-icon">⚡</span>
                            <div className="option-text"><strong>Imediato</strong><span>Enviar agora.</span></div>
                        </div>
                    </div>
                </>
            )}
            {/* ETAPA 1 */}
            {step === 1 && (
                <>
                    <h2 className="wizard-title">Quem deve receber?</h2>
                    <div className="wizard-options-grid">
                        <div className={`option-card ${data.target === 'leads' ? 'selected' : ''}`} onClick={() => { update('target', 'leads'); next(); }}>
                            <span className="option-icon">👥</span>
                            <div className="option-text"><strong>Leads</strong></div>
                        </div>
                        <div className={`option-card ${data.target === 'todos' ? 'selected' : ''}`} onClick={() => { update('target', 'todos'); next(); }}>
                            <span className="option-icon">📢</span>
                            <div className="option-text"><strong>Todos</strong></div>
                        </div>
                    </div>
                    <div className="wizard-actions"><Button variant="ghost" onClick={back}>Voltar</Button></div>
                </>
            )}
            {/* ETAPA 2 */}
            {step === 2 && (
                <>
                    <h2 className="wizard-title">Incluir Botão de Compra?</h2>
                    <div className="wizard-options-grid">
                        <div className={`option-card ${data.promo ? 'selected' : ''}`} onClick={() => { update('promo', true); next(); }}>
                            <span className="option-icon">✅</span>
                            <div className="option-text"><strong>SIM</strong></div>
                        </div>
                        <div className={`option-card ${!data.promo ? 'selected' : ''}`} onClick={() => { update('promo', false); setStep(4); }}>
                            <span className="option-icon">❌</span>
                            <div className="option-text"><strong>NÃO</strong></div>
                        </div>
                    </div>
                    <div className="wizard-actions"><Button variant="ghost" onClick={back}>Voltar</Button></div>
                </>
            )}
            {/* ETAPA 3 */}
            {step === 3 && (
                <>
                    <h2 className="wizard-title">Configurar Oferta</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <Select 
                            label="Qual plano vender?" 
                            options={plans.map(p => ({ value: p.id, label: `${p.nome_exibicao} (R$ ${p.preco_atual})` }))}
                            value={data.plan_id}
                            onChange={e => update('plan_id', e.target.value)}
                        />
                        <div className="wizard-actions">
                            <Button variant="ghost" onClick={back}>Voltar</Button>
                            <Button onClick={next}>Próximo</Button>
                        </div>
                    </div>
                </>
            )}
            {/* ETAPA 4 */}
            {step === 4 && (
                <>
                    <h2 className="wizard-title">Conteúdo</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <Input label="Mídia (Opcional)" value={data.media_url} onChange={e => update('media_url', e.target.value)} />
                        <TextArea label="Mensagem" value={data.message} onChange={e => update('message', e.target.value)} />
                    </div>
                    <div className="wizard-actions">
                        <Button variant="ghost" onClick={back}>Voltar</Button>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <Button variant="outline" onClick={() => handleSend(true)}>Testar</Button>
                            <Button onClick={() => handleSend(false)}>Enviar</Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export function Remarketing() {
    const { selectedBot } = useBot(); // Contexto
    const [plans, setPlans] = useState([]);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        if (selectedBot) {
            planService.listPlans(selectedBot.id).then(setPlans);
            remarketingService.getHistory(selectedBot.id).then(setHistory);
        } else {
            setPlans([]); setHistory([]);
        }
    }, [selectedBot]);

    return (
        <div className="remarketing-container">
            <div style={{ marginBottom: '40px' }}>
                <h1>Remarketing: <span style={{color:'#c333ff'}}>{selectedBot?.nome || "..."}</span></h1>
                <p style={{ color: 'var(--muted-foreground)' }}>Recupere vendas e engaje sua audiência.</p>
            </div>

            {selectedBot ? (
                <>
                    <RemarketingWizard 
                        plans={plans} 
                        onSend={(payload, isTest) => remarketingService.send({ bot_id: selectedBot.id, ...payload }, isTest)}
                    />
                    <div style={{ marginTop: '50px' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--foreground)' }}>
                            <History size={20} /> Histórico
                        </h3>
                        <div style={{ marginTop: '20px' }}>
                            {history.map(h => (
                                <div key={h.id} className="history-item">
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>{h.data}</div>
                                        <div style={{ fontWeight: '600' }}>{h.config?.content_data?.substring(0, 50)}...</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ color: '#10b981' }}>✅ {h.sent}</div>
                                        <div style={{ color: '#ef4444' }}>🚫 {h.blocked}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <div style={{textAlign:'center', marginTop:'50px', color:'#666'}}>
                    <h2>👈 Selecione um bot no topo da tela para continuar.</h2>
                </div>
            )}
        </div>
    );
}