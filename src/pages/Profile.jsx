import React, { useState, useEffect } from 'react';
import { profileService } from '../services/api';
import { User, DollarSign, ShoppingBag, Users, Bot, Award, Save, Lock, Unlock } from 'lucide-react';
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { Input } from '../components/Input';
import Swal from 'sweetalert2';
import './Profile.css';

export function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Dados do Perfil
  const [profile, setProfile] = useState({
    name: '',
    avatar_url: ''
  });

  // Dados Estatísticos (Império)
  const [stats, setStats] = useState({
    total_bots: 0,
    total_members: 0,
    total_revenue: 0,
    total_sales: 0
  });

  // Gamificação
  const [gamification, setGamification] = useState({
    current_level: null,
    next_level: null,
    progress_percentage: 0
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const data = await profileService.get();
      if (data) {
        setProfile(data.profile);
        setStats(data.stats);
        setGamification(data.gamification);
      }
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await profileService.update(profile);
      Swal.fire({
        icon: 'success',
        title: 'Perfil Salvo!',
        toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
        background: '#151515', color: '#fff'
      });
    } catch (error) {
      Swal.fire('Erro', 'Falha ao salvar perfil.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const formatMoney = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Lista de Placas (Visual)
  const badges = [
    { name: "Prodígio", target: 100000, slug: "prodigio", color: "#a855f7" },
    { name: "Empreendedor", target: 500000, slug: "empreendedor", color: "#3b82f6" },
    { name: "Milionário", target: 1000000, slug: "milionario", color: "#ef4444" },
    { name: "Magnata", target: 10000000, slug: "magnata", color: "#eab308" }
  ];

  return (
    <div className="profile-container">
      
      {/* 1. CABEÇALHO E IDENTIDADE */}
      <div className="profile-header-section">
        <div className="profile-identity">
          <div className="avatar-wrapper">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="avatar-img" />
            ) : (
              <div className="avatar-placeholder">
                <User size={40} />
              </div>
            )}
          </div>
          <div className="identity-info">
            <h1>{profile.name || "Administrador"}</h1>
            <p>Dono do Império Zenyx</p>
          </div>
        </div>

        <form className="profile-edit-form" onSubmit={handleSaveProfile}>
          <div className="inputs-row">
            <Input 
              placeholder="Seu Nome" 
              value={profile.name} 
              onChange={e => setProfile({...profile, name: e.target.value})}
            />
            <Input 
              placeholder="URL da Foto (Avatar)" 
              value={profile.avatar_url} 
              onChange={e => setProfile({...profile, avatar_url: e.target.value})}
            />
            <Button type="submit" disabled={saving}>
              <Save size={18} /> {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </div>

      {/* 2. DASHBOARD GLOBAL (O IMPÉRIO) */}
      <div className="empire-stats-grid">
        <Card className="stat-card-global">
          <CardContent>
            <div className="stat-icon-wrapper bots"><Bot size={24}/></div>
            <h3>{loading ? "..." : stats.total_bots}</h3>
            <p>Bots Ativos</p>
          </CardContent>
        </Card>

        <Card className="stat-card-global">
          <CardContent>
            <div className="stat-icon-wrapper members"><Users size={24}/></div>
            <h3>{loading ? "..." : stats.total_members}</h3>
            <p>Membros Totais</p>
          </CardContent>
        </Card>

        <Card className="stat-card-global">
          <CardContent>
            <div className="stat-icon-wrapper revenue"><DollarSign size={24}/></div>
            <h3>{loading ? "..." : formatMoney(stats.total_revenue)}</h3>
            <p>Faturamento Global</p>
          </CardContent>
        </Card>

        <Card className="stat-card-global">
          <CardContent>
            <div className="stat-icon-wrapper sales"><ShoppingBag size={24}/></div>
            <h3>{loading ? "..." : stats.total_sales}</h3>
            <p>Vendas Totais</p>
          </CardContent>
        </Card>
      </div>

      {/* 3. GAMIFICAÇÃO E PLACAS */}
      <div className="gamification-section">
        <div className="progress-area">
          <div className="progress-header">
            <h2>Próxima Conquista: <span style={{color: '#c333ff'}}>{gamification.next_level ? gamification.next_level.name : "Mestre Supremo"}</span></h2>
            <span>{gamification.progress_percentage}% Concluído</span>
          </div>
          <div className="progress-track">
            <div 
              className="progress-fill" 
              style={{width: `${gamification.progress_percentage}%`}}
            ></div>
          </div>
          <p className="progress-info">
            Faturamento Atual: <strong>{formatMoney(stats.total_revenue)}</strong> 
            {gamification.next_level && ` / Meta: ${formatMoney(gamification.next_level.target)}`}
          </p>
        </div>

        <h3 className="badges-title">Galeria de Troféus</h3>
        <div className="badges-grid">
          {badges.map((badge, index) => {
            const isUnlocked = stats.total_revenue >= badge.target;
            return (
              <div key={index} className={`badge-card ${isUnlocked ? 'unlocked' : 'locked'}`}>
                <div className="badge-icon" style={{ borderColor: isUnlocked ? badge.color : '#333', color: isUnlocked ? badge.color : '#555' }}>
                  {isUnlocked ? <Award size={40} /> : <Lock size={40} />}
                </div>
                <h4>{badge.name}</h4>
                <p className="badge-target">{formatMoney(badge.target)}</p>
                <div className="badge-status">
                  {isUnlocked ? <span className="status-unlocked">CONQUISTADO</span> : <span className="status-locked">BLOQUEADO</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  );
}