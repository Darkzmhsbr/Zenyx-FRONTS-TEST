import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verifica se já tem login salvo ao abrir o site
    const savedUser = localStorage.getItem('zenyx_admin_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
        localStorage.removeItem('zenyx_admin_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (username, password) => {
    // 🔒 VALIDAÇÃO SIMPLES (FRONTEND)
    if (username === 'ZeKai' && password === '123456') {
      const userData = { name: 'Admin Zenyx', username };
      setUser(userData);
      localStorage.setItem('zenyx_admin_user', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  // ============================================================
  // 🔥 FUNÇÃO LOGOUT CORRIGIDA
  // ============================================================
  const logout = () => {
    console.log("🚪 Fazendo logout...");
    
    // Limpa estado
    setUser(null);
    
    // Limpa localStorage
    localStorage.removeItem('zenyx_admin_user');
    localStorage.removeItem('zenyx_selected_bot');
    localStorage.removeItem('zenyx_theme');
    
    // Força reload da página para garantir limpeza total
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
