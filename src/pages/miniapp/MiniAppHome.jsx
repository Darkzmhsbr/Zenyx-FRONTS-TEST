import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { miniappService } from '../../services/api';
import Swal from 'sweetalert2';
import { Play, Star, Lock, ShoppingBag } from 'lucide-react';
import '../../assets/styles/HomePage.css'; // Vamos criar esse CSS no próximo lote

export function MiniAppHome() {
  const { botId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showPromoPopup, setShowPromoPopup] = useState(false);

  useEffect(() => {
    carregarLoja();
  }, [botId]);

  const carregarLoja = async () => {
    try {
      setLoading(true);
      const data = await miniappService.getPublicData(botId);
      
      setConfig(data.config);
      setCategories(data.categories || []);

      // Lógica do Popup (Se ativado no painel)
      if (data.config.enable_popup) {
          const hasSeenPromo = sessionStorage.getItem(`promo_shown_${botId}`);
          if (!hasSeenPromo) {
              setTimeout(() => {
                  setShowPromoPopup(true);
                  sessionStorage.setItem(`promo_shown_${botId}`, 'true');
              }, 3000);
          }
      }

    } catch (error) {
      console.error("Erro ao carregar loja:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClosePopup = () => {
      setShowPromoPopup(false);
      localStorage.setItem('active_coupon', 'OFERTA_POPUP_50');
      Swal.fire({
          toast: true, position: 'top', icon: 'success', 
          title: 'Cupom de desconto ativado!',
          showConfirmButton: false, timer: 3000,
          background: '#151515', color: '#fff'
      });
  };

  if (loading) return <div className="loading-screen">Carregando loja...</div>;
  if (!config) return <div className="error-screen">Loja não encontrada.</div>;

  return (
    <div className="home-container" style={{ background: config.background_value || '#000' }}>
      
      {/* 1. HERO SECTION DINÂMICA */}
      <section className="hero-section">
          {config.hero_video_url ? (
            <div className="video-background">
                <video autoPlay loop muted playsInline>
                    <source src={config.hero_video_url} type="video/mp4" />
                </video>
                <div className="video-overlay"></div>
            </div>
          ) : (
             <div className="video-background" style={{background: config.background_value}}></div> 
          )}

          <div className="hero-content">
              <h1 className="glitch-text" data-text={config.hero_title}>{config.hero_title}</h1>
              <p className="hero-subtitle">{config.hero_subtitle}</p>
              
              <button className="cta-button" onClick={() => {
                  document.getElementById('categories-section').scrollIntoView({ behavior: 'smooth' });
              }}>
                  {config.hero_btn_text || "VER CONTEÚDO"} <Play size={18} fill="#fff" />
              </button>
          </div>
      </section>

      {/* 2. GRID DE CATEGORIAS */}
      <section id="categories-section" className="categories-section">
          <h2 className="section-title">SELECIONE UMA CATEGORIA <span className="dot">.</span></h2>
          
          <div className="categories-grid">
              {categories.map((cat) => (
                  <div 
                    key={cat.id} 
                    className="category-card"
                    onClick={() => navigate(`/loja/${botId}/categoria/${cat.slug}`)}
                  >
                      <div className="card-image">
                          {cat.cover_image ? (
                              <img src={cat.cover_image} alt={cat.title} />
                          ) : (
                              <div className="placeholder-img"><Lock size={40}/></div>
                          )}
                          <div className="card-overlay"></div>
                      </div>
                      <div className="card-info">
                          <h3 style={{ color: cat.theme_color || '#fff' }}>{cat.title}</h3>
                          <p>{cat.description || "Toque para acessar"}</p>
                          <span className="card-btn" style={{ borderColor: cat.theme_color }}>
                              ACESSAR <ShoppingBag size={14}/>
                          </span>
                      </div>
                  </div>
              ))}

              {categories.length === 0 && (
                  <p style={{color: '#666', textAlign: 'center', width: '100%'}}>Nenhuma categoria disponível.</p>
              )}
          </div>
      </section>

      {/* 3. RODAPÉ */}
      <footer className="simple-footer">
          <p>{config.footer_text}</p>
      </footer>

      {/* 4. POPUP PROMO */}
      {showPromoPopup && (
          <div className="promo-modal-overlay">
              <div className="promo-modal-content">
                  <button className="close-modal" onClick={handleClosePopup}>✖</button>
                  <div className="modal-video-box">
                      {config.popup_video_url && (
                        <video autoPlay loop muted playsInline>
                            <source src={config.popup_video_url} type="video/mp4" />
                        </video>
                      )}
                      <div className="discount-badge">🎁 PRESENTE</div>
                  </div>
                  <div className="modal-text">
                      <h3>{config.popup_text}</h3>
                      <button className="btn-claim-discount" onClick={handleClosePopup}>
                          PEGAR MEU DESCONTO
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}