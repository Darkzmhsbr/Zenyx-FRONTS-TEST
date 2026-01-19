import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react'; 
import { Copy, Loader2, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import Swal from 'sweetalert2';
import '../../assets/styles/PaymentPage.css';

export function MiniAppPayment() {
  const { botId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Recebe os dados do Checkout (userData tem o ID certo)
  const { plan, bump, finalPrice, userData } = location.state || {};
  
  const [loading, setLoading] = useState(true);
  const [pixData, setPixData] = useState(null);
  const [status, setStatus] = useState('pending');
  const [timeLeft, setTimeLeft] = useState(600); 
  
  const generatedRef = useRef(false);
  const pollRef = useRef(null);

  // SEU BACKEND
  const API_URL = 'https://zenyx-gbs-testes-production.up.railway.app';

  useEffect(() => {
    if (!plan) { navigate(`/loja/${botId}`); return; }
    
    const gerarPix = async () => {
        if (generatedRef.current) return;
        generatedRef.current = true;

        try {
            // Se veio do Telegram, userData.id é NÚMERO (Ex: 123456)
            // Convertemos para String para o JSON, mas o conteúdo é numérico
            const idFinal = userData?.id ? String(userData.id) : "000000";
            
            const payload = {
                bot_id: parseInt(botId),
                valor: parseFloat(finalPrice),
                plano_id: plan.id,
                plano_nome: plan.nome_exibicao,
                
                // 🔥 AQUI ESTÁ A CORREÇÃO:
                telegram_id: idFinal, 
                first_name: userData?.first_name || "Visitante",
                username: userData?.username || "site_visit",
                
                tem_order_bump: !!bump
            };

            const res = await axios.post(`${API_URL}/api/pagamento/pix`, payload);
            console.log("PIX GERADO:", res.data);
            
            if (res.data) {
                setPixData(res.data);
            } else {
                throw new Error("Sem resposta do servidor");
            }

        } catch (error) {
            console.error("Erro Pix:", error);
            Swal.fire({
                icon: 'error',
                title: 'Erro ao gerar Pix',
                background: '#222', color: '#fff'
            });
        } finally {
            setLoading(false);
        }
    };

    gerarPix();
    return () => clearInterval(pollRef.current);
  }, [plan]);

  // Timer
  useEffect(() => {
    if (timeLeft > 0 && status === 'pending') {
        const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timer);
    }
  }, [timeLeft, status]);

  // Monitoramento
  useEffect(() => {
      if (pixData?.txid && status === 'pending') {
          pollRef.current = setInterval(async () => {
              try {
                  const res = await axios.get(`${API_URL}/api/pagamento/status/${pixData.txid}`);
                  if (res.data.status === 'approved' || res.data.status === 'paid') {
                      setStatus('paid');
                      clearInterval(pollRef.current);
                      setTimeout(() => navigate(`/loja/${botId}/obrigado`), 1500);
                  }
              } catch (e) {}
          }, 5000);
      }
      return () => clearInterval(pollRef.current);
  }, [pixData, status]);

  const copyPix = () => {
      const code = pixData?.copia_cola || pixData?.qr_code;
      if (code && code !== "null") {
          navigator.clipboard.writeText(code);
          Swal.fire({toast:true, position:'top', icon:'success', title:'Copiado!', timer:1500, showConfirmButton:false, background:'#333', color:'#fff'});
      }
  };

  const formatTime = (s) => {
      const m = Math.floor(s / 60);
      const sec = s % 60;
      return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  if(loading) return (
      <div className="payment-page-container">
          <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
            <Loader2 className="spin" size={50} color="#10b981"/>
            <p style={{marginTop: 15, color: '#aaa', fontSize:'0.9rem'}}>Gerando cobrança...</p>
          </div>
      </div>
  );

  const safeCode = pixData?.copia_cola || pixData?.qr_code || "";
  const displayCode = safeCode.length > 10 ? safeCode : "Erro ao carregar código Pix.";

  return (
    <div className="payment-page-container">
      <div className="payment-card">
        {status === 'paid' ? (
             <div className="success-state" style={{padding: '40px 0'}}>
                <CheckCircle size={80} color="#10b981" style={{marginBottom: 20}} />
                <h2 style={{color: '#10b981', marginBottom: 10}}>Pagamento Aprovado!</h2>
                <p style={{color: '#888'}}>Acesso liberado no Bot.</p>
             </div>
        ) : (
             <>
                <div className="payment-header"><h2>Pagamento via PIX</h2></div>
                <div className="plan-summary">
                    <span className="plan-label">{plan.nome_exibicao}</span>
                    <span className="plan-value">R$ {finalPrice.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="qr-section">
                    <div className="qr-container">
                        {safeCode.length > 10 ? (
                            <QRCodeSVG value={safeCode} size={200} level="M" />
                        ) : (
                            <div style={{width:200, height:200, display:'flex', alignItems:'center', justifyContent:'center', color:'#555'}}>
                                <AlertTriangle size={40}/>
                            </div>
                        )}
                    </div>
                    <div className="timer-badge">
                        <Clock size={14} style={{display:'inline', marginRight:5, marginBottom:-2}}/>
                        Expira em: {formatTime(timeLeft)}
                    </div>
                </div>
                <div className="copy-paste-section">
                    <label>Código Pix Copia e Cola:</label>
                    <div className="pix-code-box">{displayCode}</div>
                    <button onClick={copyPix} className="btn-action-main" disabled={safeCode.length < 10}>
                        <Copy size={18} /> COPIAR CÓDIGO PIX
                    </button>
                </div>
                <div className="waiting-status">
                    <div className="pulse-dot"></div><span>Aguardando confirmação...</span>
                </div>
             </>
        )}
      </div>
    </div>
  );
}