import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { miniappService } from '../../services/api';
import { ArrowLeft, Lock, PlayCircle, FileText, Download, ShieldAlert } from 'lucide-react';
import '../../assets/styles/CategoryPage.css';

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
            const cats = await miniappService.listCategories(botId);
            const found = cats.find(c => c.slug === slug);

            if (!found) {
                navigate(`/loja/${botId}`);
                return;
            }

            // Redirecionamento direto (ex: Câmera Escondida)
            if (found.is_direct_checkout) {
                navigate(`/loja/${botId}/checkout`, { state: { categoryId: found.id } });
                return;
            }

            setCategory(found);
            
            // Parse do JSON
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

    const isHacker = category.is_hacker_mode;

    return (
        <div className={`category-page ${isHacker ? 'hacker-mode' : ''}`}>
            
            {/* 1. HEADER FIXO */}
            <div className="cat-header">
                <button className="back-btn" onClick={() => navigate(`/loja/${botId}`)}>
                    <ArrowLeft size={24} color="#fff" />
                </button>
                <h2 style={{ color: category.theme_color }}>{category.title}</h2>
            </div>

            {/* 2. BANNER DESTAQUE (Premium vs Hacker) */}
            <div className="cat-banner">
                {category.banner_mob_url ? (
                    <img src={category.banner_mob_url} className="banner-img" alt="Banner" />
                ) : (
                    <div className="banner-placeholder" style={{background: isHacker ? '#000' : category.theme_color}}>
                        {isHacker ? (
                            <div className="hacker-glitch">SYSTEM FAILURE<br/><span>ACCESS DENIED</span></div>
                        ) : (
                            <h1>{category.title}</h1>
                        )}
                    </div>
                )}
                <div className="banner-overlay"></div>
            </div>

            {/* 3. CONTEÚDO (FEED) */}
            <section className="cat-feed">
                
                {/* Descrição com linha decorativa */}
                <div className="cat-description-box">
                    <p>{category.description}</p>
                    {category.deco_line_url && <img src={category.deco_line_url} className="deco-line-small" />}
                </div>

                {/* MODO HACKER: Lista de Arquivos */}
                {isHacker ? (
                    <div className="hacker-file-list">
                        <div className="terminal-header">
                            <div className="term-dot red"></div>
                            <div className="term-dot yellow"></div>
                            <div className="term-dot green"></div>
                            <span>root@server:~/{category.slug}</span>
                        </div>
                        <div className="terminal-body">
                            {contentList.length > 0 ? contentList.map((file, idx) => (
                                <div key={idx} className="hacker-row" onClick={() => navigate(`/loja/${botId}/checkout`)}>
                                    <div className="file-icon"><FileText size={18}/></div>
                                    <div className="file-info">
                                        <span className="file-name">{file.name || `Arquivo_Secreto_${idx}.zip`}</span>
                                        <span className="file-meta">{file.size || '?? MB'} • {file.date || '2025-01-01'}</span>
                                    </div>
                                    <div className="file-status">
                                        <Lock size={14}/> {file.status || 'CRIPTOGRAFADO'}
                                    </div>
                                </div>
                            )) : (
                                <div className="hacker-row">
                                    <div className="file-icon"><ShieldAlert size={18} color="red"/></div>
                                    <div className="file-info">
                                        <span className="file-name">PASTA_OCULTA_VIPS.rar</span>
                                        <span className="file-meta">2.4 GB • PROTEGIDO</span>
                                    </div>
                                    <div className="file-status">BLOQUEADO</div>
                                </div>
                            )}
                            <div className="cursor-blink">_</div>
                        </div>
                    </div>
                ) : (
                    /* MODO GALERIA (Padrão) */
                    <div className="premium-gallery">
                        {contentList.map((item, index) => (
                            <div key={index} className="content-card">
                                <div className="content-preview">
                                    <div className="locked-overlay">
                                        <div className="lock-icon-box" style={{borderColor: category.theme_color}}>
                                            <Lock size={28} color={category.theme_color} />
                                        </div>
                                        <span>CONTEÚDO EXCLUSIVO</span>
                                    </div>
                                    {item.url && <img src={item.url} className="blur-bg" />}
                                </div>
                                <div className="content-info">
                                    <h4>{item.title || `Mídia Privada #${index+1}`}</h4>
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
                        
                        {/* Placeholder se vazio */}
                        {contentList.length === 0 && (
                            <div className="empty-gallery">
                                <Lock size={40} color="#555"/>
                                <p>Conteúdo restrito a assinantes.</p>
                            </div>
                        )}
                    </div>
                )}

            </section>

            {/* 4. FOOTER CTA (Fixado) */}
            <div className="cat-footer-cta">
                <div className="cta-content">
                    <span>LIBERAR ACESSO COMPLETO</span>
                    <small>Assine agora e veja tudo sem censura</small>
                </div>
                <button 
                    className="btn-big-footer"
                    onClick={() => navigate(`/loja/${botId}/checkout`)}
                    style={{ backgroundColor: category.theme_color || '#c333ff' }}
                >
                    ASSINAR <ArrowLeft size={18} style={{transform:'rotate(180deg)'}}/>
                </button>
            </div>
        </div>
    );
}