import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { ChevronRight, TrendingUp, Users, CreditCard, Activity, RefreshCw } from 'lucide-react';
import { dashboardService } from '../services/api';
import { useBot } from '../context/BotContext'; // <--- Uso do Contexto
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import './Dashboard.css';

export function Dashboard() {
  const navigate = useNavigate();
  const { selectedBot } = useBot(); // Pega o bot global
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    total_revenue: 0,
    active_users: 0,
    sales_today: 0
  });

  // Carrega dados quando o bot muda
  useEffect(() => {
    if (selectedBot) {
      carregarDados();
    } else {
      // Se não tiver bot, zera (ou carrega geral, opcional)
      carregarDados(null); 
    }
  }, [selectedBot]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      // Passa o ID do bot selecionado para filtrar no backend
      const botId = selectedBot ? selectedBot.id : null;
      const data = await dashboardService.getStats(botId);
      setMetrics(data);
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const stats = [
    { 
      title: "Faturamento Total", 
      value: formatMoney(metrics.total_revenue), 
      icon: <TrendingUp size={24} />, 
      trend: "Total Acumulado",
      isPositive: true 
    },
    { 
      title: "Assinantes Ativos", 
      value: metrics.active_users, 
      icon: <Users size={24} />, 
      trend: "Base Atual",
      isPositive: true 
    },
    { 
      title: "Vendas Hoje", 
      value: formatMoney(metrics.sales_today), 
      icon: <CreditCard size={24} />, 
      trend: "Últimas 24h",
      isPositive: metrics.sales_today > 0 
    },
  ];

  return (
    <div className="dashboard-container">
      
      {/* Banner Principal - Título dinâmico */}
      <div className="banner">
        <div className="banner-content">
          <h2>
            Resultados de: <span style={{color:'#c333ff'}}>{selectedBot ? selectedBot.nome : "Geral"}</span>
          </h2>
          <p>
            Acompanhe o desempenho, vendas e leads deste bot.
            Seus dados são atualizados automaticamente em tempo real.
          </p>
          <Button size="lg" onClick={() => navigate('/bots')}>
            Gerenciar Bots
            <ChevronRight size={18} />
          </Button>
        </div>
      </div>

      {/* Grid de Estatísticas */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div className="stat-icon-wrapper">
                  {stat.icon}
                </div>
                <span className={`stat-trend ${stat.isPositive ? 'trend-up' : 'trend-down'}`}>
                  {stat.trend}
                </span>
              </div>
              
              <div className="stat-value">
                {loading ? <span style={{fontSize:'1rem', opacity:0.5}}>Carregando...</span> : stat.value}
              </div>
              <div className="stat-label">{stat.title}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ações Rápidas */}
      <h3 style={{ marginTop: '30px', marginBottom: '15px', color: 'var(--foreground)' }}>Acesso Rápido</h3>
      <div className="stats-grid">
        
        <Card className="hover-effect" onClick={() => navigate('/bots')}>
          <CardContent style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }}>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(42, 171, 238, 0.1)', color: '#2AABEE' }}>
              <Activity size={24} />
            </div>
            <div>
              <h4 style={{ margin: 0, color: 'var(--foreground)' }}>Status dos Bots</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>Ver conexões</p>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <Button variant="ghost" size="icon"><ChevronRight /></Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-effect" onClick={() => carregarDados()}>
          <CardContent style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }}>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--foreground)' }}>
              <RefreshCw size={24} className={loading ? "spin" : ""} />
            </div>
            <div>
              <h4 style={{ margin: 0, color: 'var(--foreground)' }}>Atualizar Dados</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>Sincronizar agora</p>
            </div>
          </CardContent>
        </Card>

      </div>

    </div>
  );
}