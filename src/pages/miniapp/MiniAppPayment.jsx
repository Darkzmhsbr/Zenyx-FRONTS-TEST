import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Copy, Clock, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Swal from 'sweetalert2';
import '../../assets/styles/PaymentPage.css';

export function MiniAppPayment() {
  const { botId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Dados vindos do Checkout
  const { plan, bump, finalPrice } = location.state || {};

  const [loading, setLoading] = useState(true);
  const [pixData, setPixData] = useState(null);
  const [status, setStatus] = useState('pending'); 
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutos
  
  const hasGeneratedRef = useRef(false);
  const pollIntervalRef = useRef(null);

  // 🔗 URL DA API (Certifique-se que no main.py a rota /api/pagamento/pix existe)
  const API_URL = 'https://zenyx-gbs-testes-production.up.railway.app';

  useEffect(() => {
    if (!plan) {
      navigate(`/loja/${botId}`);
      return;
    }
    gerarPix();
    return () => clearInterval(pollIntervalRef.current);
  }, []);

  // Timer
  useEffect(() => {
    if (timeLeft > 0 && status === 'pending') {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, status]);

  const gerarPix = async () => {
    if (hasGeneratedRef.current) return;
    hasGeneratedRef.current = true;

    try {
      const tgUser = JSON.parse(localStorage.getItem('telegram_user') || '{}');
      
      const payload = {
        bot_id: parseInt(botId),
        valor: parseFloat(finalPrice),
        plano_id: plan.id,
        plano_nome: plan.nome_exibicao,
        telegram_id: tgUser.id?.toString() || '000000',
        first_name: tgUser.first_name || 'Visitante',
        username: tgUser.username || 'anonimo',
        tem_order_bump: !!bump
      };

      const response = await axios.post(`${API_URL}/api/pagamento/pix`, payload);
      
      if (response.data) {
        setPixData(response.data);
        setLoading(false);
        iniciarMonitoramento(response.data.txid);
      }

    } catch (error) {
      console.error("Erro PIX:", error);
      Swal.fire('Erro', 'Falha ao gerar PIX. Tente novamente.', 'error');
      navigate(-1);
    }
  };

  const iniciarMonitoramento = (txid) => {
    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await axios.get(`${API_URL}/api/pagamento/status/${txid}`);
        if (res.data.status === 'approved' || res.data.status === 'paid') {
          setStatus('paid');
          clearInterval(pollIntervalRef.current);
          setTimeout(() => navigate(`/loja/${botId}/obrigado`), 1500);
        }
      } catch (e) {}
    }, 5000);
  };

  const copyPix = () => {
    if (pixData?.copia_cola) {
      navigator.clipboard.writeText(pixData.copia_cola);
      Swal.fire({
        toast: true, position: 'top', icon: 'success',
        title: 'Copiado!', showConfirmButton: false, timer: 1500,
        background: '#333', color: '#fff'
      });
    }
  };

  const formatTime = (s) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  if (loading) return (
      <div className="payment-loading">
          <Loader2 className="spin" size={50} color="#10b981"/>
          <p>Gerando seu PIX...</p>
      </div>
  );

  return (
    <div className="payment-page">
      <div className="payment-navbar">
        <button onClick={() => navigate(-1)}><ArrowLeft color="#fff"/></button>
        <span>Pagamento Seguro</span>
        <div style={{width:24}}></div>
      </div>

      {status === 'paid' ? (
          <div className="success-state">
              <CheckCircle size={80} color="#10b981" />
              <h2>Pagamento Recebido!</h2>
              <p>Redirecionando você...</p>
          </div>
      ) : (
          <div className="payment-card">
              <h3 className="pay-title">Pagamento via PIX</h3>
              
              <div className="plan-summary">
                  <span className="plan-name">{plan.nome_exibicao}</span>
                  <span className="plan-price">R$ {finalPrice.toFixed(2)}</span>
              </div>

              <div className="timer-box">
                  <Clock size={16}/> Expira em: {formatTime(timeLeft)}
              </div>

              <div className="qr-container">
                  {pixData?.copia_cola && <QRCodeSVG value={pixData.copia_cola} size={220} level="M" />}
              </div>

              <div className="copy-area">
                  <label>Código Pix Copia e Cola:</label>
                  <div className="code-box">
                      {pixData?.copia_cola?.substring(0, 40)}...
                  </div>
                  <button className="btn-copy-pix" onClick={copyPix}>
                      <Copy size={18}/> COPIAR CÓDIGO
                  </button>
              </div>

              <div className="waiting-box">
                  <div className="pulse-green"></div>
                  <span>Aguardando pagamento...</span>
              </div>
          </div>
      )}
    </div>
  );
}