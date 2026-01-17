import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react'; 
import { Copy, Loader2, CheckCircle, Clock } from 'lucide-react';
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
  const [timeLeft, setTimeLeft] = useState(600); // 10 min
  
  const generatedRef = useRef(false);
  const pollRef = useRef(null);

  // 🔗 SEU BACKEND REAL
  const API_URL = 'https://zenyx-gbs-testes-production.up.railway.app';

  useEffect(() => {
    if (!plan) { navigate(`/loja/${botId}`); return; }
    
    const gerarPix = async () => {
        if (generatedRef.current) return;
        generatedRef.current = true;

        try {
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
            setPixData(res.data); // O backend retorna { copia_cola, qr_code, txid }
            setLoading(false);
            iniciarMonitoramento(res.data.txid);

        } catch (error) {
            console.error(error);
            Swal.fire('Erro', 'Erro ao gerar Pix', 'error');
            setLoading(false);
        }
    };

    gerarPix();
    return () => clearInterval(pollRef.current);
  }, [plan]);

  // Timer Regressivo
  useEffect(() => {
    if (timeLeft > 0 && status === 'pending') {
        const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timer);
    }
  }, [timeLeft, status]);

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
      if (pixData?.copia_cola) {
          navigator.clipboard.writeText(pixData.copia_cola);
          Swal.fire({toast:true, position:'top', icon:'success', title:'Copiado!', timer:1500, showConfirmButton:false, background:'#333', color:'#fff'});
      } else {
          Swal.fire('Erro', 'Código não disponível', 'error');
      }
  }

  const formatTime = (s) => {
      const m = Math.floor(s / 60);
      const sec = s % 60;
      return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  if(loading) return (
      <div className="payment-page-container">
          <Loader2 className="spin" size={50} color="#10b981"/>
          <p style={{marginTop: 15, color: '#aaa'}}>Gerando QR Code...</p>
      </div>
  );

  return (
    <div className="payment-page-container">
      <div className="payment-card">
        
        {/* HEADER IGUAL AO SEU PROJETO */}
        <div className="payment-header">
          <h2>Pagamento via PIX</h2>
          <div className="plan-summary">
            <span style={{color:'#aaa', fontSize:'0.9rem', textTransform:'uppercase'}}>{plan.nome_exibicao}</span>
            <span style={{color:'#10b981', fontSize:'1.8rem', fontWeight:'800', display:'block', marginTop:5}}>
                R$ {finalPrice.toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>

        {/* QR CODE CONTAINER */}
        <div className="qr-container">
           {/* Usa o copia_cola para gerar o QR se a imagem não vier */}
           {(pixData?.copia_cola || pixData?.qr_code) && (
               <QRCodeSVG value={pixData.copia_cola} size={200} level="M" />
           )}
        </div>

        <div className="timer-badge" style={{color:'#ef4444', fontWeight:'bold', marginBottom:15}}>
            <Clock size={16} style={{display:'inline', marginRight:5, marginBottom:-2}}/>
            Expira em: {formatTime(timeLeft)}
        </div>

        {/* CÓDIGO PIX (CORRIGIDO O NULL) */}
        <div style={{textAlign:'left', width:'100%'}}>
            <label style={{fontSize:'0.8rem', color:'#888', marginBottom:5, display:'block'}}>Código Pix Copia e Cola:</label>
            <div className="pix-code-box">
                {pixData?.copia_cola || "Erro ao carregar código"}
            </div>
        </div>

        {/* BOTÃO VERDE */}
        <button className="btn-action-main" onClick={copyPix}>
            <Copy size={18} style={{marginRight:8}}/> COPIAR CÓDIGO PIX
        </button>

        {/* STATUS */}
        <div className="waiting-status" style={{marginTop:20, display:'flex', alignItems:'center', justifyContent:'center', gap:10, color:'#666'}}>
            <div className="pulse-dot" style={{background:'#10b981', width:10, height:10, borderRadius:'50%'}}></div>
            <span>Aguardando pagamento...</span>
        </div>

      </div>
    </div>
  );
}