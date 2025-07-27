
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { UserProfile } from '../types';

// Helper to decode JWT
function decodeJwt(token: string): any {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    console.error("Failed to decode JWT", e);
    return null;
  }
}

interface AuthContextType {
  user: UserProfile | null;
  login: (credential: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Check for user in session storage on initial load
    const storedUser = sessionStorage.getItem('userProfile');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (credential: string) => {
    const decodedToken = decodeJwt(credential);
    if (decodedToken) {
      const userProfile: UserProfile = {
        id: decodedToken.sub,
        name: decodedToken.name,
        email: decodedToken.email,
        picture: decodedToken.picture,
      };
      sessionStorage.setItem('userProfile', JSON.stringify(userProfile));
      setUser(userProfile);
    }
  };

  const logout = () => {
    sessionStorage.removeItem('userProfile');
    setUser(null);
    if (window.google && window.google.accounts && window.google.accounts.id) {
        window.google.accounts.id.disableAutoSelect();
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Add google to window type
declare global {
    interface Window {
        google: any;
    }
}
