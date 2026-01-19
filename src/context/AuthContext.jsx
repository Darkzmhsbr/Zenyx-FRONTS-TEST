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
    // 🔒 LISTA DE USUÁRIOS E PERMISSÕES (ATUALIZADA)
    // ============================================================
    const usuarios = {
      'ZeKai': { 
        pass: '123456', 
        name: 'Admin Zenyx', 
        role: 'master',      // Mestre: Vê tudo
        allowed_bots: []     // (Master ignora essa lista)
      },
      'ManitoMHS': { 
        pass: 'Hermano8762', 
        name: 'Sócio Manito', 
        role: 'partner',     // Sócio: Vê apenas os bots permitidos
        // 👇 AQUI ESTÁ O BOT DELE CONFIGURADO
        allowed_bots: [3]    // ID 3 Liberado!
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