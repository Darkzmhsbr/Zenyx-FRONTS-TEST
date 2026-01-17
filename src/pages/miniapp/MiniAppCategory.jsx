import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { miniappService } from '../../services/api';
import { ArrowLeft } from 'lucide-react';
import '../../assets/styles/CategoryPage.css';

export function MiniAppCategory() {
    const { botId, slug } = useParams();
    const navigate = useNavigate();
    const [category, setCategory] = useState(null);

    useEffect(() => {
        miniappService.listCategories(botId).then(cats => {
            setCategory(cats.find(c => c.slug === slug));
        });
    }, [slug]);

    if (!category) return <div style={{background:'#000', height:'100vh'}}></div>;

    return (
        <div className="category-page-container">
            {/* Header Voltar */}
            <div style={{position:'fixed', top:15, left:15, zIndex:99}}>
                <button onClick={() => navigate(-1)} style={{background:'rgba(0,0,0,0.6)', border:'none', borderRadius:'50%', padding:8, color:'#fff'}}><ArrowLeft /></button>
            </div>

            {/* Banner Sem Zoom (Height Auto) */}
            <div className="cat-hero-section">
                {category.banner_mob_url ? (
                    <img src={category.banner_mob_url} className="hero-banner-img" alt="Capa" />
                ) : (
                    <div style={{height:300, background: category.theme_color, display:'flex', alignItems:'center', justifyContent:'center'}}><h1>{category.title}</h1></div>
                )}
            </div>

            <div className="content-feed">
                <div className="description-text">{category.description}</div>
                {/* Aqui viria a galeria... */}
            </div>

            <div className="cta-fixed-bottom">
                <button 
                    className="btn-pulse-main"
                    onClick={() => navigate(`/loja/${botId}/checkout`)}
                    style={{ backgroundColor: category.theme_color || '#E10000', boxShadow: `0 0 20px ${category.theme_color}` }}
                >
                    LIBERAR ACESSO AGORA
                </button>
            </div>
        </div>
    );
}