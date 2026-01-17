import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { miniappService } from '../../services/api';
import { Play, ArrowRight } from 'lucide-react'; // Ícones novos
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

  if (loading) return <div style={{background:'#050505', height:'100vh', display:'flex', alignItems:'center', justify:'center'}}></div>;
  
  // Fallback se não tiver config
  const safeConfig = config || { 
      background_value: '#000', 
      hero_title: 'Bem-vindo', 
      hero_btn_text: 'Acessar' 
  };

  return (
    <div className="home-container">
      
      {/* 1. HERO SECTION (Imersivo) */}
      <section className="hero-section">
          {safeConfig.hero_video_url ? (
            <div className="video-background">
                <video autoPlay loop muted playsInline>
                    <source src={safeConfig.hero_video_url} type="video/mp4" />
                </video>
                <div className="video-overlay"></div>
            </div>
          ) : (
             <div className="video-background" style={{background: safeConfig.background_value}}></div> 
          )}

          <div className="hero-content">
              <h1 className="hero-title">{safeConfig.hero_title}</h1>
              <p style={{color:'#ddd', fontSize:'0.9rem', marginBottom: '10px'}}>{safeConfig.hero_subtitle}</p>
              
              <button className="hero-btn" onClick={() => {
                  document.getElementById('cat-grid').scrollIntoView({ behavior: 'smooth' });
              }}>
                  {safeConfig.hero_btn_text} <Play size={16} fill="#fff" />
              </button>
          </div>
      </section>

      {/* 2. GRID DE CATEGORIAS (Estilo Poster) */}
      <section id="cat-grid" className="categories-section">
          <h3 className="section-title">CATEGORIAS DISPONÍVEIS</h3>
          
          <div className="categories-grid">
              {categories.map((cat) => (
                  <div 
                    key={cat.id} 
                    className="category-card"
                    onClick={() => navigate(`/loja/${botId}/categoria/${cat.slug}`)}
                  >
                      <div className="card-image">
                          {cat.cover_image ? (
                              <img src={cat.cover_image} alt={cat.title} loading="lazy" />
                          ) : (
                              <div style={{width:'100%', height:'100%', background:'#222', display:'flex', alignItems:'center', justifyContent:'center', color:'#444', fontSize:'0.8rem'}}>SEM CAPA</div>
                          )}
                      </div>
                      <div className="card-overlay">
                          <h3 className="card-title" style={{color: cat.theme_color || '#fff'}}>{cat.title}</h3>
                          <span className="card-cta">ACESSAR <ArrowRight size={12}/></span>
                      </div>
                  </div>
              ))}
          </div>

          {categories.length === 0 && (
              <div style={{padding:'40px', textAlign:'center', color:'#666'}}>
                  Nenhum conteúdo adicionado ainda.
              </div>
          )}
      </section>

      <footer className="simple-footer">
          <p>{safeConfig.footer_text}</p>
      </footer>
    </div>
  );
}