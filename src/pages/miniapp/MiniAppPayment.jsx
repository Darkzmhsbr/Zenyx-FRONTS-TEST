import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react'; 
import { Copy, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import '../../assets/styles/PaymentPage.css';

export function MiniAppPayment() {
  const { botId } = useParams();
  const location = useLocation();
  const { plan, bump, finalPrice } = location.state || {};
  
  const [loading, setLoading] = useState(true);
  const [pixData, setPixData] = useState(null);
  const generatedRef = useRef(false);

  // URL DA API
  const API_URL = 'https://zenyx-gbs-testes-production.up.railway.app';

  useEffect(() => {
    if (!plan || generatedRef.current) return;
    generatedRef.current = true;

    // Gerar Pix (Mesmo payload de antes)
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

    axios.post(`${API_URL}/api/pagamento/pix`, payload)
      .then(res => { setPixData(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });

  }, [plan]);

  const copyPix = () => {
      navigator.clipboard.writeText(pixData.copia_cola);
      Swal.fire({toast: true, position: 'top', icon: 'success', title: 'Copiado!', showConfirmButton: false, timer: 1500, background: '#333', color: '#fff'});
  }

  if(loading) return <div className="payment-page-container"><Loader2 className="spin" size={40} color="#10b981"/></div>;

  return (
    <div className="payment-page-container">
      <div className="payment-card">
        <div className="payment-header">
          <h2>Pagamento via PIX</h2>
          <div className="plan-summary">
            <span style={{color:'#aaa', fontSize:'0.9rem'}}>{plan.nome_exibicao}</span>
            <span className="plan-value">R$ {finalPrice.toFixed(2)}</span>
          </div>
        </div>

        <div className="qr-container">
           {pixData && <QRCodeSVG value={pixData.copia_cola} size={200} />}
        </div>

        <div style={{color:'#ef4444', fontWeight:'bold', fontSize:'0.9rem', marginBottom:10}}>
            Expira em 10 minutos
        </div>

        <div className="pix-code-box">
            {pixData?.copia_cola}
        </div>

        <button className="btn-action-main" onClick={copyPix}>
            COPIAR CÓDIGO PIX
        </button>
      </div>
    </div>
  );
}