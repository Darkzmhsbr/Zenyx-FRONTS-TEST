import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  RefreshCw, 
  Activity,
  UserPlus,
  Percent,
  CreditCard,
  Calendar as CalendarIcon, 
  ChevronDown,
  LayoutGrid, // Ícone novo para "Todos os bots"
  Bot         // Ícone novo para "Bot único"
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

// --- IMPORTS DO CALENDÁRIO ---
import DatePicker, { registerLocale } from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import ptBR from 'date-fns/locale/pt-BR'; // Para português

import { dashboardService } from '../services/api';
import { useBot } from '../context/BotContext'; 
import { Button } from '../components/Button';
import './Dashboard.css';

// Registra idioma português no calendário
registerLocale('pt-BR', ptBR);

export function Dashboard() {
  const navigate = useNavigate();
  const { selectedBot } = useBot(); 
  const [loading, setLoading] = useState(true);
  
  // --- ESTADO DE VISÃO (GLOBAL OU BOT ÚNICO) ---
  // false = Vê apenas o bot selecionado no menu lateral
  // true = Vê a soma de todos os bots
  const [isGlobalView, setIsGlobalView] = useState(false);

  // --- ESTADO DE DATA (PADRÃO: MÊS ATUAL) ---
  const [dateRange, setDateRange] = useState([
    new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Dia 1 do mês atual
    new Date() // Hoje
  ]);
  const [startDate, endDate] = dateRange;

  // Estado das métricas
  const [metrics, setMetrics] = useState({
    total_revenue: 0,
    active_users: 0,
    sales_today: 0,
    leads_mes: 0,
    leads_hoje: 0,
    ticket_medio: 0,
    total_transacoes: 0,
    reembolsos: 0,
    taxa_conversao: 0,
    chart_data: [] 
  });

  // Efeito para recarregar quando mudar: Bot, Data ou Modo de Visão
  useEffect(() => {
    carregarDados();
    // eslint-disable-next-line
  }, [selectedBot, endDate, isGlobalView]); 

  const carregarDados = async () => {
    // Só busca se tiver data fim definida
    if (!startDate || !endDate) return;

    try {
      setLoading(true);
      
      // LÓGICA MESTRA:
      // Se estiver em Visão Global, mandamos null como ID.
      // Se não, mandamos o ID do bot selecionado.
      const botId = isGlobalView ? null : (selectedBot ? selectedBot.id : null);
      
      // Passa as datas e o ID para o serviço
      const data = await dashboardService.getStats(botId, startDate, endDate);
      
      // Garante que chart_data seja um array
      if (!data.chart_data) data.chart_data = [];
      
      setMetrics(data);
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  };

  // Função para alternar entre Visão Global e Bot Selecionado
  const toggleViewMode = () => {
    setIsGlobalView(!isGlobalView);
  };

  // Componente visual do botão de data
  const CustomDateInput = React.forwardRef(({ value, onClick }, ref) => (
    <button className="date-filter-btn" onClick={onClick} ref={ref}>
      <CalendarIcon size={16} />
      <span>{value || "Filtrar Data"}</span>
      <ChevronDown size={14} />
    </button>
  ));

  return (
    <div className="dashboard-container fade-in">
      
      {/* 1. CABEÇALHO DA PÁGINA */}
      <div className="dashboard-header">
        <div>
          <h2 className="page-title">
            {/* Título Dinâmico */}
            {isGlobalView ? (
              <>Resumo analítico de <span className="highlight-text">todos os bots</span></>
            ) : (
              <>Resumo analítico de bot selecionado: <span className="highlight-text">{selectedBot ? selectedBot.nome : "Selecione um Bot"}</span></>
            )}
          </h2>
          <p className="page-subtitle">Gerencie, acompanhe e tome decisões com mais clareza.</p>
        </div>
        
        <div className="header-actions">
           {/* Botão de Atualizar */}
           <Button variant="ghost" size="icon" onClick={carregarDados} title="Atualizar Dados">
            <RefreshCw size={20} className={loading ? "spin" : ""} />
          </Button>

          {/* BOTÃO MÁGICO DE ALTERNAR VISÃO */}
          <Button onClick={toggleViewMode} style={{ minWidth: '180px' }}>
            {isGlobalView ? (
              <>
                <Bot size={18} style={{ marginRight: '8px' }} />
                Ver bot selecionado
              </>
            ) : (
              <>
                <LayoutGrid size={18} style={{ marginRight: '8px' }} />
                Ver todos os bots
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 2. TOP CARDS */}
      <div className="top-cards-grid">
        
        {/* Card 1 */}
        <div className="analytic-card">
          <div className="card-header-row">
            <span className="card-label">LEADS (NO PERÍODO)</span>
            <Users size={18} className="card-icon-muted" />
          </div>
          <div className="card-main-value">
            {loading ? "..." : metrics.leads_mes}
          </div>
        </div>

        {/* Card 2 */}
        <div className="analytic-card">
          <div className="card-header-row">
            <span className="card-label">NOVOS LEADS HOJE</span>
            <UserPlus size={18} className="card-icon-muted" />
          </div>
          <div className="card-main-value">
            {loading ? "..." : metrics.leads_hoje}
          </div>
        </div>

        {/* Card 3 */}
        <div className="analytic-card">
          <div className="card-header-row">
            <span className="card-label">ASSINANTES ATIVOS</span>
            <Activity size={18} className="card-icon-muted" />
          </div>
          <div className="card-main-value">
            {loading ? "..." : metrics.active_users}
          </div>
        </div>

      </div>

      {/* 3. GRID PRINCIPAL */}
      <div className="main-analytic-grid">
        
        {/* COLUNA ESQUERDA: GRÁFICO */}
        <div className="chart-section card-box">
          <div className="chart-header">
             
             {/* Info Esquerda */}
             <div className="chart-info">
               <div className="icon-circle">
                 <ShoppingBag size={20} />
               </div>
               <div>
                 <span className="chart-label">FATURAMENTO (PERÍODO)</span>
                 <div className="chart-big-number">
                    {loading ? "..." : formatMoney(metrics.total_revenue)}
                 </div>
               </div>
             </div>

             {/* Filtro de Data */}
             <div className="chart-filter-wrapper">
                <DatePicker
                  selectsRange={true}
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(update) => {
                    setDateRange(update);
                  }}
                  locale="pt-BR"
                  dateFormat="dd/MM/yyyy"
                  customInput={<CustomDateInput />}
                  withPortal
                />
             </div>

          </div>

          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={metrics.chart_data}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c333ff" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#c333ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2d2647" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#b9b6c9', fontSize: 12}} 
                  dy={10}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#b9b6c9', fontSize: 12}} 
                  tickFormatter={(value) => `R$${value}`}
                />
                <Tooltip 
                  contentStyle={{backgroundColor: '#1b1730', border: '1px solid #2d2647', borderRadius: '8px', color: '#fff'}}
                  itemStyle={{color: '#c333ff'}}
                  formatter={(value) => [`R$ ${value.toFixed(2)}`, "Faturamento"]}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#c333ff" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* COLUNA DIREITA: LISTA DE KPIs */}
        <div className="side-stats-column">
          
          <div className="side-stat-card">
             <div className="side-stat-header">
               <span>TICKET MÉDIO</span>
               <ShoppingBag size={16} />
             </div>
             <div className="side-stat-value">
               {loading ? "..." : formatMoney(metrics.ticket_medio)}
             </div>
          </div>

          <div className="side-stat-card">
             <div className="side-stat-header">
               <span>VENDAS HOJE</span>
               <DollarSign size={16} />
             </div>
             <div className="side-stat-value">
               {loading ? "..." : formatMoney(metrics.sales_today)}
             </div>
          </div>

          <div className="side-stat-card">
             <div className="side-stat-header">
               <span>TRANSAÇÕES (Período)</span>
               <RefreshCw size={16} />
             </div>
             <div className="side-stat-value">
               {loading ? "..." : metrics.total_transacoes}
             </div>
          </div>

           <div className="side-stat-card">
             <div className="side-stat-header">
               <span>REEMBOLSOS</span>
               <CreditCard size={16} />
             </div>
             <div className="side-stat-value text-danger">
               {loading ? "..." : formatMoney(metrics.reembolsos)}
             </div>
          </div>

          <div className="side-stat-card">
             <div className="side-stat-header">
               <span>CONVERSÃO</span>
               <Percent size={16} />
             </div>
             <div className="side-stat-value highlight-text">
               {loading ? "..." : `${metrics.taxa_conversao}%`}
             </div>
          </div>

        </div>

      </div>
    </div>
  );
}