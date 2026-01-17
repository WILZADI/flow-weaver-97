import { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  displayName?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, displayName?: string) => Promise<boolean>;
  logout: () => void;
  updateDisplayName: (displayName: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('financeUser');
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email: string, _password: string, displayName?: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newUser = {
      id: '1',
      email,
      name: email.split('@')[0],
      displayName: displayName || email.split('@')[0],
    };
    
    setUser(newUser);
    localStorage.setItem('financeUser', JSON.stringify(newUser));
    return true;
  };

  const updateDisplayName = (displayName: string) => {
    if (user) {
      const updatedUser = { ...user, displayName };
      setUser(updatedUser);
      localStorage.setItem('financeUser', JSON.stringify(updatedUser));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('financeUser');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, updateDisplayName }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
