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
    // ============================================================
    // 🔒 LISTA DE USUÁRIOS E PERMISSÕES (CORRIGIDA)
    // ============================================================
    const usuarios = {
      'ZeKai': { 
        pass: '123456', 
        name: 'Admin Zenyx', 
        // 🔥 ALTERADO: De 'master' para 'admin' para ativar o filtro de visualização
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

    // Verifica se o usuário existe e a senha bate
    if (usuarios[username] && usuarios[username].pass === password) {
      const userConfig = usuarios[username];
      
      // Cria o objeto do usuário com as permissões
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

  // ============================================================
  // 🔥 FUNÇÃO LOGOUT
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