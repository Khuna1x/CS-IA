import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { validateUser, saveUser, getUserById } from '../services/storageService';

interface AuthContextType {
  user: User | null;
  login: (admissionNumber: string, password: string, rememberMe: boolean) => Promise<User | null>;
  signup: (user: User) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for active session on mount in both localStorage (Remember Me) and sessionStorage (One-time)
    const storedUserId = localStorage.getItem('hostel_finder_current_user_id') || sessionStorage.getItem('hostel_finder_current_user_id');
    
    if (storedUserId) {
      const foundUser = getUserById(storedUserId);
      if (foundUser) {
        setUser(foundUser);
      }
    }
    setLoading(false);
  }, []);

  const login = async (admissionNumber: string, password: string, rememberMe: boolean): Promise<User | null> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const validUser = validateUser(admissionNumber, password);
    if (validUser) {
      setUser(validUser);
      
      if (rememberMe) {
        localStorage.setItem('hostel_finder_current_user_id', validUser.id);
      } else {
        sessionStorage.setItem('hostel_finder_current_user_id', validUser.id);
      }
      return validUser;
    }
    return null;
  };

  const signup = async (newUser: User): Promise<boolean> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const success = saveUser(newUser);
    if (success) {
      setUser(newUser);
      // Default to persistent storage for new signups for better UX
      localStorage.setItem('hostel_finder_current_user_id', newUser.id);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hostel_finder_current_user_id');
    sessionStorage.removeItem('hostel_finder_current_user_id');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
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