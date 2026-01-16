import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { miniappService } from '../../services/api';
import { ArrowLeft, Lock, PlayCircle } from 'lucide-react';
import '../../assets/styles/CategoryPage.css'; // Criaremos no próximo lote

export function MiniAppCategory() {
    const { botId, slug } = useParams();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState(null);
    const [contentList, setContentList] = useState([]);

    useEffect(() => {
        carregarCategoria();
        window.scrollTo(0, 0);
    }, [slug]);

    const carregarCategoria = async () => {
        try {
            setLoading(true);
            // Busca todas e filtra localmente (ou poderia ter uma rota específica no back)
            const cats = await miniappService.listCategories(botId);
            const found = cats.find(c => c.slug === slug);

            if (!found) {
                navigate(`/loja/${botId}`); // Volta pra home se não achar
                return;
            }

            // Se for checkout direto, redireciona
            if (found.is_direct_checkout) {
                navigate(`/loja/${botId}/checkout`, { state: { categoryId: found.id } });
                return;
            }

            setCategory(found);
            
            // Parse do JSON de conteúdo (Galeria)
            try {
                const parsedContent = JSON.parse(found.content_json || "[]");
                setContentList(parsedContent);
            } catch (e) {
                setContentList([]);
            }

        } catch (error) {
            console.error("Erro", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-screen">Carregando...</div>;
    if (!category) return null;

    return (
        <div className={`category-page ${category.is_hacker_mode ? 'hacker-mode' : ''}`}>
            
            {/* 1. CABEÇALHO */}
            <div className="cat-header">
                <button className="back-btn" onClick={() => navigate(`/loja/${botId}`)}>
                    <ArrowLeft size={24} color="#fff" />
                </button>
                <h2>{category.title}</h2>
            </div>

            {/* 2. BANNER DE DESTAQUE */}
            <div className="cat-banner">
                {category.banner_mob_url ? (
                    <img src={category.banner_mob_url} className="banner-img" alt="Banner" />
                ) : (
                    <div className="banner-placeholder" style={{background: category.theme_color}}>
                        <h1>{category.title}</h1>
                    </div>
                )}
                <div className="banner-overlay"></div>
            </div>

            {/* 3. LISTA DE CONTEÚDO (FEED) */}
            <section className="cat-feed">
                <div className="cat-description">
                    <p>{category.description}</p>
                </div>

                {contentList.map((item, index) => (
                    <div key={index} className="content-card">
                        <div className="content-preview">
                            {item.type === 'video' ? (
                                <div className="video-wrapper">
                                    <video src={item.url} muted loop autoPlay playsInline />
                                    <div className="locked-overlay">
                                        <Lock size={32} />
                                        <span>CONTEÚDO BLOQUEADO</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="image-wrapper">
                                    <img src={item.url} alt="Preview" />
                                    <div className="locked-overlay">
                                        <Lock size={32} />
                                        <span>CONTEÚDO BLOQUEADO</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="content-info">
                            <h4>{item.title || `Conteúdo Exclusivo #${index+1}`}</h4>
                            <button 
                                className="unlock-btn"
                                style={{ backgroundColor: category.theme_color }}
                                onClick={() => navigate(`/loja/${botId}/checkout`)}
                            >
                                <PlayCircle size={16} /> DESBLOQUEAR
                            </button>
                        </div>
                    </div>
                ))}
            </section>

            {/* 4. FOOTER CTA */}
            <div className="cat-footer-cta">
                {category.deco_line_url && <img src={category.deco_line_url} className="deco-line" />}
                
                <button 
                    className="btn-big-footer"
                    onClick={() => navigate(`/loja/${botId}/checkout`)}
                    style={{ backgroundColor: category.theme_color }}
                >
                    ASSINE AGORA E LIBERE TUDO
                </button>
            </div>
        </div>
    );
}