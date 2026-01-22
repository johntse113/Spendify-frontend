import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { router, useSegments, usePathname } from 'expo-router';

export interface User {
  id: number;
  email: string;
  // name?: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  signIn: (token: string, refreshToken: string, userData?: User) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (token: string, refreshToken: string, userData?: User) => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAuthData();
  }, []);

  const loadAuthData = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync('accessToken');
      const storedUser = await SecureStore.getItemAsync('userData');
      
      setToken(storedToken);
      
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading auth data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (newToken: string, refreshToken: string, userData?: User) => {
    try {
      await SecureStore.setItemAsync('accessToken', newToken);
      await SecureStore.setItemAsync('refreshToken', refreshToken);
      
      if (userData) {
        await SecureStore.setItemAsync('userData', JSON.stringify(userData));
        setUser(userData);
      }
      
      setToken(newToken);
    } catch (error) {
      console.error('Error saving auth data:', error);
      throw error;
    }
  };

  const signUp = async (newToken: string, refreshToken: string, userData?: User) => {
    try {
      await SecureStore.setItemAsync('accessToken', newToken);
      await SecureStore.setItemAsync('refreshToken', refreshToken);
      
      if (userData) {
        await SecureStore.setItemAsync('userData', JSON.stringify(userData));
        setUser(userData);
      }
      
      setToken(newToken);
    } catch (error) {
      console.error('Error saving auth data:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      await SecureStore.deleteItemAsync('userData');
      setToken(null);
      setUser(null);
      
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error removing auth data:', error);
      throw error;
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      SecureStore.setItemAsync('userData', JSON.stringify(updatedUser));
    }
  };

  const refreshUserData = async () => {
    console.log('Refresh user data method called');
  };

  return (
    <AuthContext.Provider value={{ 
      token, 
      user, 
      isLoading, 
      signIn, 
      signOut, 
      signUp, 
      updateUser, 
      refreshUserData 
    }}>
      {children}
    </AuthContext.Provider>
  );
}