import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios'; // Certifique-se que o axios está instalado
import { QRCodeSVG } from 'qrcode.react'; // Certifique-se que qrcode.react está instalado
import { Copy, Loader2, CheckCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import '../../assets/styles/PaymentPage.css';

export function MiniAppPayment() {
  const { botId } = useParams();
  const location = useLocation();
  const { plan, finalPrice } = location.state || {};
  const [pixData, setPixData] = useState(null);
  const [loading, setLoading] = useState(true);
  const generated = useRef(false);

  // Use a URL do seu backend Railway
  const API_URL = 'https://zenyx-gbs-testes-production.up.railway.app'; 

  useEffect(() => {
      if(!plan || generated.current) return;
      generated.current = true;

      // Gerar Pix
      const payload = {
          bot_id: parseInt(botId),
          valor: parseFloat(finalPrice),
          plano_id: plan.id,
          plano_nome: plan.nome_exibicao,
          telegram_id: "000000", // Visitante
          first_name: "Visitante",
          username: "visitante"
      };

      axios.post(`${API_URL}/api/pagamento/pix`, payload)
        .then(res => { setPixData(res.data); setLoading(false); })
        .catch(err => { console.error(err); setLoading(false); });

  }, [plan]);

  const copyPix = () => {
      navigator.clipboard.writeText(pixData.copia_cola);
      Swal.fire({toast:true, position:'top', icon:'success', title:'Copiado!', timer:1500, showConfirmButton:false, background:'#333', color:'#fff'});
  }

  if(loading) return <div className="payment-page-container"><Loader2 className="spin" size={40}/></div>;

  return (
    <div className="payment-page-container">
        <div className="payment-card">
            <h2>Pagamento via PIX</h2>
            <div style={{color:'#10b981', fontSize:'1.5rem', fontWeight:'bold'}}>R$ {finalPrice.toFixed(2)}</div>
            
            <div className="qr-code-wrapper">
                {pixData && <QRCodeSVG value={pixData.copia_cola} size={200} />}
            </div>

            <div className="pix-code-box">
                {pixData?.copia_cola}
            </div>

            <button className="btn-action-main" onClick={copyPix}>
                <Copy size={18} style={{marginRight:8}}/> COPIAR CÓDIGO
            </button>
        </div>
    </div>
  );
}