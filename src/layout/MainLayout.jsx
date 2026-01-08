import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// 👇 AQUI ESTAVA O ERRO: Adicionamos .jsx para garantir que o Vercel encontre
import { Sidebar } from '../components/Sidebar.jsx';
import { Header } from '../components/Header.jsx';

export function MainLayout() {
  const { user } = useAuth();
  
  // Estado para controlar o Menu Mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 🔒 BLOQUEIO: Se não tiver usuário, chuta para o Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">
      {/* Sidebar recebe o estado e a função para fechar */}
      <Sidebar 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
      
      {/* Header recebe a função para abrir o menu */}
      <Header 
        onToggleMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
      />
      
      {/* Fundo escuro (Overlay) no mobile ao abrir menu */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-overlay" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <main>
        {/* Outlet é onde as páginas (Dashboard, Bots, etc) serão renderizadas */}
        <Outlet />
      </main>
    </div>
  );
}