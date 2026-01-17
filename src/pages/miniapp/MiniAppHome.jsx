import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { miniappService } from '../../services/api';
import { Play } from 'lucide-react';
import '../../assets/styles/HomePage.css';

export function MiniAppHome() {
  const { botId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const carregarLoja = async () => {
      try {
        const data = await miniappService.getPublicData(botId);
        setConfig(data.config);
        setCategories(data.categories || []);
      } catch (error) {
        console.error("Erro ao carregar loja:", error);
      } finally {
        setLoading(false);
      }
    };
    carregarLoja();
  }, [botId]);

  if (loading) return <div style={{background:'#000', height:'100vh', width:'100%'}}></div>;
  
  // Fallback seguro caso a config não venha
  const safeConfig = config || { 
      hero_title: 'BEM-VINDO', 
      hero_btn_text: 'ACESSAR AGORA',
      background_value: '#000'
  };

  return (
    <div className="home-page-container">
      
      {/* HERO SECTION ELITE (Estrutura do seu arquivo base) */}
      <section className="hero-section-elite">
          <div className="video-background">
             {safeConfig.hero_video_url ? (
                 <video autoPlay loop muted playsInline>
                     <source src={safeConfig.hero_video_url} type="video/mp4" />
                 </video>
             ) : (
                 <div style={{width:'100%', height:'100%', background: safeConfig.background_value}}></div>
             )}
             <div className="video-overlay-gradient"></div>
          </div>

          <div className="hero-content-center">
              <h1 className="hero-title-large">{safeConfig.hero_title}</h1>
              {safeConfig.hero_subtitle && <p style={{color:'#ccc', marginBottom: 20}}>{safeConfig.hero_subtitle}</p>}
              
              <button className="btn-hero-action" onClick={() => document.getElementById('grid').scrollIntoView({ behavior: 'smooth' })}>
                  {safeConfig.hero_btn_text} <Play size={18} fill="#fff" style={{marginLeft:8, display:'inline'}}/>
              </button>
          </div>
      </section>

      {/* GRID DE CATEGORIAS (Cards Verticais) */}
      <div id="grid" className="categories-container">
          <div className="cards-grid">
              {categories.map((cat) => (
                  <div 
                    key={cat.id} 
                    className="category-card-elite" 
                    onClick={() => navigate(`/loja/${botId}/categoria/${cat.slug}`)}
                  >
                      <div className="card-img-wrapper">
                          {cat.cover_image ? (
                              <img src={cat.cover_image} alt={cat.title} />
                          ) : (
                              <div style={{width:'100%', height:'100%', background:'#222', display:'flex', alignItems:'center', justifyContent:'center'}}>SEM CAPA</div>
                          )}
                      </div>
                      <div className="card-gradient-overlay">
                          <h3 className="card-title-text" style={{color: cat.theme_color || '#fff'}}>{cat.title}</h3>
                      </div>
                  </div>
              ))}
          </div>
      </div>

      <footer className="simple-footer">
          <p>{safeConfig.footer_text || "© 2026 Premium Club."}</p>
      </footer>
    </div>
  );
}