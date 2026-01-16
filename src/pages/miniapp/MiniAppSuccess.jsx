import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle, Send } from 'lucide-react';
import '../../assets/styles/ObrigadoPage.css'; // Criaremos no lote 4

export function MiniAppSuccess() {
  const { botId } = useParams();

  useEffect(() => {
    // Efeito de Confete Simples (DOM Manipulation)
    createConfetti();
    
    // Feedback Tátil (Se estiver no Telegram)
    if (window.Telegram?.WebApp) {
        try { window.Telegram.WebApp.HapticFeedback.notificationOccurred('success'); } catch(e){}
    }
  }, []);

  const createConfetti = () => {
    const colors = ['#c333ff', '#00c853', '#ffffff'];
    for (let i = 0; i < 50; i++) {
      const el = document.createElement('div');
      el.className = 'confetti';
      el.style.left = Math.random() * 100 + 'vw';
      el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      el.style.animationDuration = (Math.random() * 3 + 2) + 's';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 5000);
    }
  };

  const handleReturn = () => {
    if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.close();
    } else {
        window.close();
    }
  };

  return (
    <div className="success-page">
      <div className="success-content">
        <div className="icon-bounce">
            <CheckCircle size={80} color="#10b981" />
        </div>
        
        <h1>Compra Confirmada!</h1>
        <p>Seu acesso VIP foi liberado. Verifique o chat do bot para acessar seus links.</p>

        <div className="info-box">
            <Send size={20} color="#c333ff"/>
            <span>Links enviados no privado</span>
        </div>

        <button className="btn-close" onClick={handleReturn}>
            VOLTAR PARA O BOT
        </button>
      </div>
    </div>
  );
}