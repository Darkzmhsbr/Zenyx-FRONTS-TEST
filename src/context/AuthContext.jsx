import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verifica se já tem login salvo ao abrir o site
    const savedUser = localStorage.getItem('zenyx_admin_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (username, password) => {
    // 🔒 VALIDAÇÃO SIMPLES (FRONTEND)
    // Para segurança máxima, isso deveria ser checado no backend,
    // mas para bloquear o painel visualmente agora, isso resolve.
    if (username === 'ZeKai' && password === '123456') {
      const userData = { name: 'Admin Zenyx', username };
      setUser(userData);
      localStorage.setItem('zenyx_admin_user', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('zenyx_admin_user');
    localStorage.removeItem('zenyx_selected_bot'); // Limpa seleção de bot também
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}