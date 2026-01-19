import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    // ============================================================
    // 🔒 LISTA DE USUÁRIOS E PERMISSÕES
    // ============================================================
    const usuarios = {
      'ZeKai': { 
        pass: '123456', 
        name: 'Admin Zenyx', 
        // 🔥 MUDEI AQUI: De 'master' para 'admin' para aplicar o filtro de IDs
        role: 'admin',      
        // 👇 SEUS BOTS (ZeKinha e Mister MK7)
        allowed_bots: [1, 2] 
      },
      'ManitoMHS': { 
        pass: 'Hermano8762', 
        name: 'Sócio Manito', 
        role: 'partner',     
        // 👇 BOT DELE (Club Fans)
        allowed_bots: [3]    
      }
    };

    if (usuarios[username] && usuarios[username].pass === password) {
      const userConfig = usuarios[username];
      
      const userData = { 
        name: userConfig.name, 
        username: username,
        role: userConfig.role,
        allowed_bots: userConfig.allowed_bots 
      };

      setUser(userData);
      localStorage.setItem('zenyx_admin_user', JSON.stringify(userData));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    console.log("🚪 Fazendo logout...");
    setUser(null);
    localStorage.removeItem('zenyx_admin_user');
    localStorage.removeItem('zenyx_selected_bot');
    localStorage.removeItem('zenyx_theme');
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