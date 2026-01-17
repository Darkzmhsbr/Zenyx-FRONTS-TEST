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
        console.error("Erro", error);
      } finally {
        setLoading(false);
      }
    };
    carregarLoja();
  }, [botId]);

  if (loading) return <div style={{background:'#000', height:'100vh'}}></div>;
  if (!config) return <div style={{color:'#fff'}}>Loja não encontrada.</div>;

  return (
    <div className="home-container">
      
      {/* 1. HERO COM VÍDEO FULL */}
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
              <h1 className="hero-title">{config.hero_title}</h1>
              <p style={{color:'#ccc', fontSize:'1rem'}}>{config.hero_subtitle}</p>
              
              <button className="hero-btn" onClick={() => {
                  document.getElementById('cat-grid').scrollIntoView({ behavior: 'smooth' });
              }}>
                  {config.hero_btn_text} <Play size={18} fill="#fff" style={{marginLeft:5}}/>
              </button>
          </div>
      </section>

      {/* 2. GRID DE CATEGORIAS (VERTICAL) */}
      <section id="cat-grid" className="categories-section">
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
                              <div style={{width:'100%', height:'100%', background:'#333'}}></div>
                          )}
                      </div>
                      <div className="card-overlay">
                          <h3 className="card-title" style={{color: cat.theme_color}}>{cat.title}</h3>
                          <span className="card-cta">VER CONTEÚDO ➜</span>
                      </div>
                  </div>
              ))}
          </div>
      </section>

      <footer className="simple-footer">
          <p>{config.footer_text}</p>
      </footer>
    </div>
  );
}