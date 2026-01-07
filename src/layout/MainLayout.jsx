import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function MainLayout() {
  const { user } = useAuth();

  // 🔒 BLOQUEIO: Se não tiver usuário, chuta para o Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se tiver logado, mostra o painel completo
  return (
    <div className="app-container">
      <Sidebar />
      <Header />
      <main>
        {/* Outlet é onde as páginas (Dashboard, Bots, etc) serão renderizadas */}
        <Outlet />
      </main>
    </div>
  );
}