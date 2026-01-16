import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Copy, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Swal from 'sweetalert2';
import '../../assets/styles/PaymentPage.css'; // Criaremos no lote 4

export function MiniAppPayment() {
  const { botId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Dados vindos do Checkout
  const { plan, bump, finalPrice } = location.state || {};

  const [loading, setLoading] = useState(true);
  const [pixData, setPixData] = useState(null);
  const [status, setStatus] = useState('pending'); // pending, paid
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutos
  
  const hasGeneratedRef = useRef(false);
  const pollIntervalRef = useRef(null);

  // 🔗 SEU DOMÍNIO DO RAILWAY (Hardcoded para garantir funcionamento na loja pública)
  const API_URL = 'https://zenyx-gbs-testes-production.up.railway.app';

  useEffect(() => {
    if (!plan || !finalPrice) {
      navigate(`/loja/${botId}`);
      return;
    }
    gerarPix();

    return () => clearInterval(pollIntervalRef.current);
  }, []);

  // Timer Regressivo
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
      // Pega dados do usuário do Telegram (salvos no localStorage pelo App.jsx que vamos ajustar)
      const tgUser = JSON.parse(localStorage.getItem('telegram_user') || '{}');

      const payload = {
        bot_id: parseInt(botId),
        valor: parseFloat(finalPrice),
        plano_id: plan.id,
        plano_nome: plan.nome_exibicao,
        telegram_id: tgUser.id?.toString() || '000000', // Fallback se abrir no navegador
        first_name: tgUser.first_name || 'Visitante Web',
        username: tgUser.username || 'visitante',
        tem_order_bump: !!bump
      };

      // Chama a rota de criação de PIX (Ajuste a rota conforme seu backend real de geração)
      // Se não tiver rota pública específica, usaremos a rota padrão de webhook simulation ou create_pix
      const response = await axios.post(`${API_URL}/api/pagamento/pix`, payload);
      
      if (response.data) {
        setPixData(response.data); // Espera { qr_code, copia_cola, txid }
        setLoading(false);
        iniciarMonitoramento(response.data.txid);
      }

    } catch (error) {
      console.error("Erro ao gerar PIX:", error);
      Swal.fire('Erro', 'Falha ao gerar pagamento. Tente novamente.', 'error');
      navigate(`/loja/${botId}`);
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
      } catch (e) {
        // Ignora erros de polling
      }
    }, 5000); // Verifica a cada 5s
  };

  const copyPix = () => {
    if (pixData?.copia_cola) {
      navigator.clipboard.writeText(pixData.copia_cola);
      Swal.fire({
        toast: true, position: 'top', icon: 'success',
        title: 'Código PIX copiado!', showConfirmButton: false, timer: 2000,
        background: '#151515', color: '#fff'
      });
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) {
    return (
      <div className="payment-loading">
        <Loader2 size={48} className="spin-anim" color="#c333ff" />
        <p>Gerando seu QR Code exclusivo...</p>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="payment-card">
        
        {status === 'paid' ? (
          <div className="success-state">
            <CheckCircle size={64} color="#10b981" />
            <h2>Pagamento Aprovado!</h2>
            <p>Redirecionando...</p>
          </div>
        ) : (
          <>
            <div className="payment-header">
              <h3>Pagamento via PIX</h3>
              <div className="amount-display">
                <small>Total a pagar</small>
                <span>R$ {finalPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="qr-section">
              <div className="qr-wrapper">
                {pixData?.copia_cola && (
                    <QRCodeSVG value={pixData.copia_cola} size={200} level="M" />
                )}
              </div>
              <div className="timer-box">
                <Clock size={14} /> 
                <span>Expira em: {formatTime(timeLeft)}</span>
              </div>
            </div>

            <div className="copy-section">
              <label>Código Copia e Cola:</label>
              <div className="code-box">
                {pixData?.copia_cola?.substring(0, 25)}...
              </div>
              <button className="btn-copy" onClick={copyPix}>
                <Copy size={18} /> COPIAR CÓDIGO
              </button>
            </div>

            <div className="loader-status">
              <div className="pulse-dot"></div>
              <p>Aguardando confirmação do banco...</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}