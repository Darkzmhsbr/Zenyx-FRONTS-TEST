import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { History, Repeat } from 'lucide-react';
import { planService, remarketingService } from '../services/api';
import { useBot } from '../context/BotContext';
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import './Remarketing.css';

// --- SUB-COMPONENTE: WIZARD (Mantido da sua versão) ---
function RemarketingWizard({ plans, onSend, initialData }) {
    const [step, setStep] = useState(0);
    const [sending, setSending] = useState(false);
    
    // Estado inicial dos dados
    const [data, setData] = useState({
        target: 'todos', 
        incluir_oferta: false, 
        plano_oferta_id: '',
        price_mode: 'original', 
        custom_price: '', 
        expiration_mode: 'none', 
        expiration_value: '', 
        mensagem: '', 
        media_url: '' 
    });

    // Efeito para carregar dados se vierem de "Reutilizar"
    useEffect(() => {
        if (initialData) {
            setData(prev => ({...prev, ...initialData}));
        }
    }, [initialData]);

    const update = (field, value) => setData(prev => ({ ...prev, [field]: value }));
    const next = () => setStep(s => s + 1);
    const back = () => setStep(s => s - 1);

    const handleSend = async () => {
        if (!data.mensagem) return Swal.fire('Erro', 'Escreva uma mensagem!', 'error');
        
        setSending(true);
        try {
            await onSend({
                ...data,
                // Converte valores para números
                custom_price: parseFloat(data.custom_price || 0),
                expiration_value: parseInt(data.expiration_value || 0)
            });
            setStep(0); // Reseta wizard
            setData({ target: 'todos', mensagem: '', media_url: '', incluir_oferta: false, custom_price: '', expiration_value: '' });
        } catch (e) {
            console.error(e);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="wizard-card">
            {/* ETAPA 1: PÚBLICO */}
            {step === 0 && (
                <div className="fade-in">
                    <h3 className="wizard-title">🎯 Quem deve receber?</h3>
                    <div className="wizard-options-grid">
                        {['todos', 'pendentes', 'pagantes', 'expirados'].map(t => (
                            <div key={t} className={`option-card ${data.target === t ? 'selected' : ''}`} onClick={() => update('target', t)}>
                                <span style={{textTransform:'capitalize'}}>{t}</span>
                            </div>
                        ))}
                    </div>
                    <div style={{marginTop: 30, textAlign:'right'}}>
                        <Button onClick={next}>Próximo ➡️</Button>
                    </div>
                </div>
            )}

            {/* ETAPA 2: MENSAGEM E OFERTA */}
            {step === 1 && (
                <div className="fade-in">
                    <h3 className="wizard-title">✍️ Conteúdo e Oferta</h3>
                    
                    <div className="form-group">
                        <label>Mensagem</label>
                        <textarea 
                            className="input-field" 
                            rows={4}
                            value={data.mensagem} 
                            onChange={e => update('mensagem', e.target.value)} 
                            placeholder="Digite sua mensagem..." 
                        />
                    </div>

                    <div className="form-group">
                        <label>Mídia (URL Opcional)</label>
                        <input 
                            className="input-field" 
                            type="text" 
                            value={data.media_url} 
                            onChange={e => update('media_url', e.target.value)} 
                            placeholder="https://..." 
                        />
                    </div>

                    <div style={{margin: '20px 0', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px'}}>
                        <label style={{display:'flex', alignItems:'center', gap:'10px', cursor:'pointer'}}>
                            <input 
                                type="checkbox" 
                                checked={data.incluir_oferta} 
                                onChange={e => update('incluir_oferta', e.target.checked)} 
                            />
                            <strong>Incluir Botão de Compra?</strong>
                        </label>

                        {data.incluir_oferta && (
                            <div style={{marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '15px'}}>
                                <select className="input-field" value={data.plano_oferta_id} onChange={e => update('plano_oferta_id', e.target.value)}>
                                    <option value="">Selecione o Plano...</option>
                                    {plans.map(p => <option key={p.id} value={p.id}>{p.nome_exibicao} - R$ {p.preco_atual}</option>)}
                                </select>

                                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
                                    <div>
                                        <label style={{fontSize:'0.8rem'}}>Tipo de Preço</label>
                                        <select className="input-field" value={data.price_mode} onChange={e => update('price_mode', e.target.value)}>
                                            <option value="original">Original</option>
                                            <option value="custom">Promocional</option>
                                        </select>
                                    </div>
                                    {data.price_mode === 'custom' && (
                                        <div>
                                            <label style={{fontSize:'0.8rem'}}>Valor (R$)</label>
                                            <input type="number" className="input-field" value={data.custom_price} onChange={e => update('custom_price', e.target.value)} />
                                        </div>
                                    )}
                                </div>

                                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
                                    <div>
                                        <label style={{fontSize:'0.8rem'}}>Validade (Escassez)</label>
                                        <select className="input-field" value={data.expiration_mode} onChange={e => update('expiration_mode', e.target.value)}>
                                            <option value="none">Sem Validade</option>
                                            <option value="minutes">Minutos</option>
                                            <option value="hours">Horas</option>
                                            <option value="days">Dias</option>
                                        </select>
                                    </div>
                                    {data.expiration_mode !== 'none' && (
                                        <div>
                                            <label style={{fontSize:'0.8rem'}}>Tempo</label>
                                            <input type="number" className="input-field" value={data.expiration_value} onChange={e => update('expiration_value', e.target.value)} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{marginTop: 30, display:'flex', justifyContent:'space-between'}}>
                        <Button variant="outline" onClick={back}>⬅️ Voltar</Button>
                        <Button onClick={handleSend} disabled={sending}>
                            {sending ? 'Enviando...' : '🚀 Enviar Agora'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- COMPONENTE PRINCIPAL ---
export function Remarketing() {
    const { selectedBot } = useBot();
    const [plans, setPlans] = useState([]);
    const [history, setHistory] = useState([]);
    const [wizardData, setWizardData] = useState(null); // Estado para passar dados para o Wizard

    useEffect(() => {
        if (selectedBot) {
            planService.listPlans(selectedBot.id).then(setPlans).catch(() => {});
            carregarHistorico();
        }
    }, [selectedBot]);

    const carregarHistorico = () => {
        remarketingService.getHistory(selectedBot.id).then(setHistory).catch(() => {});
    };

    const handleSendCampaign = async (data) => {
        try {
            await remarketingService.send({
                bot_id: selectedBot.id,
                ...data
            });
            Swal.fire('Sucesso', 'Campanha enviada em background!', 'success');
            setTimeout(carregarHistorico, 2000);
        } catch (error) {
            Swal.fire('Erro', 'Falha ao enviar campanha', 'error');
        }
    };

    // --- LÓGICA DE REUTILIZAÇÃO (AQUI ESTÁ A MÁGICA) ---
    const handleReuse = (campaign) => {
        try {
            const config = JSON.parse(campaign.config);
            // Prepara os dados para preencher o Wizard
            const dataToReuse = {
                target: campaign.target || 'todos',
                mensagem: config.msg || '',
                media_url: config.media || '',
                incluir_oferta: config.offer || false,
                plano_oferta_id: campaign.plano_id || '',
                price_mode: 'custom', // Sempre custom para manter o preço histórico
                custom_price: campaign.promo_price || '',
                expiration_mode: 'none', // Reseta validade para evitar bugs de data
                expiration_value: ''
            };
            
            setWizardData(dataToReuse); // Envia para o Wizard
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Sobe a tela
            
            Swal.fire({
                title: 'Dados Carregados!',
                text: 'As configurações da campanha antiga foram copiadas para o painel acima.',
                icon: 'info',
                timer: 2000,
                showConfirmButton: false,
                background: '#151515', color: '#fff'
            });
        } catch (e) {
            Swal.fire('Erro', 'Não foi possível ler os dados desta campanha.', 'error');
        }
    };

    if (!selectedBot) return <div className="remarketing-container empty-state"><h2>Selecione um bot.</h2></div>;

    return (
        <div className="remarketing-container">
            <h1 className="wizard-title">Campanha de Remarketing</h1>
            
            {/* Passamos o wizardData para pré-preencher */}
            <RemarketingWizard 
                plans={plans} 
                onSend={handleSendCampaign} 
                initialData={wizardData} 
            />

            <div style={{ marginTop: '50px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--foreground)' }}>
                    <History size={20} /> Histórico Recente
                </h3>
                <div style={{ marginTop: '20px' }}>
                    {history.length === 0 ? <p style={{color:'#666'}}>Nenhum histórico.</p> : history.map(h => (
                        <div key={h.id} className="history-item" style={{display:'flex', justifyContent:'space-between', alignItems:'center', background:'#1a1a1a', padding:'15px', borderRadius:'8px', marginBottom:'10px', border:'1px solid #333'}}>
                            <div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>{h.data} • Alvo: {h.target || JSON.parse(h.config || '{}').target}</div>
                                <div style={{ fontWeight: '600', color:'#fff' }}>
                                    {JSON.parse(h.config || '{}').msg?.substring(0, 50)}...
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{ textAlign: 'right', fontSize:'0.9rem' }}>
                                    <div style={{ color: '#10b981' }}>✅ {h.sent}</div>
                                    <div style={{ color: '#ef4444' }}>🚫 {h.blocked}</div>
                                </div>
                                {/* BOTÃO REUTILIZAR ADICIONADO AQUI */}
                                <Button 
                                    onClick={() => handleReuse(h)}
                                    style={{padding:'5px 10px', fontSize:'0.8rem', background:'#333', border:'1px solid #555'}}
                                >
                                    <Repeat size={14} /> Reutilizar
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}