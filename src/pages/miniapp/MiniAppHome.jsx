import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { miniappService } from '../../services/api';
import { Play } from 'lucide-react';
import '../../assets/styles/HomePage.css';

export function MiniAppHome() {
  const { botId } = useParams();
  const navigate = useNavigate();
  const [config, setConfig] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    miniappService.getPublicData(botId).then(data => {
        setConfig(data.config);
        setCategories(data.categories || []);
    });
  }, [botId]);

  if (!config) return <div style={{background:'#000', height:'100vh'}}></div>;

  return (
    <div className="home-page-container">
      <section className="hero-section-elite">
          <div className="video-background">
             {config.hero_video_url && <video autoPlay loop muted playsInline src={config.hero_video_url} />}
             <div className="video-overlay-gradient"></div>
          </div>
          <div className="hero-content-center">
              <h1 className="hero-title-large">{config.hero_title}</h1>
              <button className="btn-hero-action" onClick={() => document.getElementById('grid').scrollIntoView()}>
                  {config.hero_btn_text}
              </button>
          </div>
      </section>

      <div id="grid" className="categories-container">
          <div className="cards-grid">
              {categories.map((cat) => (
                  <div key={cat.id} className="category-card-elite" onClick={() => navigate(`/loja/${botId}/categoria/${cat.slug}`)}>
                      <div className="card-img-wrapper">
                          {cat.cover_image && <img src={cat.cover_image} alt={cat.title} />}
                      </div>
                      <div className="card-gradient-overlay">
                          <h3 className="card-title-text" style={{color: cat.theme_color}}>{cat.title}</h3>
                      </div>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
}