import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react'; 
import { Copy, Loader2, Clock, CheckCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import '../../assets/styles/PaymentPage.css';

export function MiniAppPayment() {
  const { botId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Recebe dados do Checkout
  const { plan, bump, finalPrice } = location.state || {};
  
  const [loading, setLoading] = useState(true);
  const [pixData, setPixData] = useState(null);
  const [status, setStatus] = useState('pending');
  const [timeLeft, setTimeLeft] = useState(600); // 10 min
  
  const generatedRef = useRef(false);
  const pollRef = useRef(null);

  // SEU BACKEND
  const API_URL = 'https://zenyx-gbs-testes-production.up.railway.app';

  useEffect(() => {
    // Se não tiver plano selecionado, volta pro checkout
    if (!plan) { 
        navigate(`/loja/${botId}`); 
        return; 
    }
    
    const gerarPix = async () => {
        if (generatedRef.current) return;
        generatedRef.current = true;

        try {
            // Payload para o Backend
            const payload = {
                bot_id: parseInt(botId),
                valor: parseFloat(finalPrice),
                plano_id: plan.id,
                plano_nome: plan.nome_exibicao,
                telegram_id: "000000",
                first_name: "Visitante",
                username: "visitante",
                tem_order_bump: !!bump
            };

            const res = await axios.post(`${API_URL}/api/pagamento/pix`, payload);
            setPixData(res.data);
            iniciarMonitoramento(res.data.txid);

        } catch (error) {
            console.error(error);
            Swal.fire('Erro', 'Erro ao gerar Pix. Tente novamente.', 'error');
        } finally {
            // GARANTE QUE O LOADING PARA
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
  const iniciarMonitoramento = (txid) => {
      pollRef.current = setInterval(async () => {
          try {
              const res = await axios.get(`${API_URL}/api/pagamento/status/${txid}`);
              if (res.data.status === 'approved' || res.data.status === 'paid') {
                  setStatus('paid');
                  clearInterval(pollRef.current);
                  setTimeout(() => navigate(`/loja/${botId}/obrigado`), 1500);
              }
          } catch (e) {}
      }, 5000);
  };

  const copyPix = () => {
      // Tenta pegar o código de todas as formas possíveis
      const code = pixData?.copia_cola || pixData?.qr_code;
      if (code) {
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
          <Loader2 className="spin" size={50} color="#10b981"/>
          <p style={{marginTop: 15, color: '#aaa'}}>Gerando pagamento...</p>
      </div>
  );

  return (
    <div className="payment-page-container">
      <div className="payment-card">
        
        {status === 'paid' ? (
             <div className="success-state" style={{padding: '40px 0'}}>
                <CheckCircle size={80} color="#10b981" style={{marginBottom: 20}} />
                <h2 style={{color: '#10b981'}}>Pagamento Aprovado!</h2>
                <p style={{color: '#888'}}>Redirecionando...</p>
             </div>
        ) : (
             <>
                <div className="payment-header">
                  <h2>Pagamento via PIX</h2>
                </div>

                <div className="plan-summary">
                    <span className="plan-label">{plan.nome_exibicao}</span>
                    <span className="plan-value">R$ {finalPrice.toFixed(2).replace('.', ',')}</span>
                </div>

                <div className="qr-section">
                    <div className="qr-container">
                        {/* Se tiver QR Image (base64 ou url) usa img, senão gera SVG do copia e cola */}
                        {(pixData?.qr_code && pixData.qr_code.length > 200) ? (
                            <img src={pixData.qr_code} alt="QR Code" style={{width: 200, height: 200}} />
                        ) : (pixData?.copia_cola && (
                            <QRCodeSVG value={pixData.copia_cola} size={200} level="M" />
                        ))}
                    </div>
                    <div className="timer-badge">
                        <Clock size={14} style={{display:'inline', marginRight:5, marginBottom:-2}}/>
                        Expira em: {formatTime(timeLeft)}
                    </div>
                </div>

                <div className="copy-paste-section">
                    <label>Código Pix Copia e Cola:</label>
                    <div className="pix-code-box">
                        {pixData?.copia_cola || "Erro ao carregar código"}
                    </div>

                    <button onClick={copyPix} className="btn-action-main">
                        <Copy size={18} /> COPIAR CÓDIGO PIX
                    </button>
                </div>

                <div className="waiting-status">
                    <div className="pulse-dot"></div>
                    <span>Aguardando confirmação...</span>
                </div>
             </>
        )}

      </div>
    </div>
  );
}