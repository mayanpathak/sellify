import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, authApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const response = await authApi.getCurrentUser();
          if (response.data?.user) {
            setUser(response.data.user);
          } else {
            // No user data, remove invalid token
            localStorage.removeItem('authToken');
          }
        } catch (error) {
          // Token might be expired or invalid, remove it
          console.error('Auth check failed:', error);
          localStorage.removeItem('authToken');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authApi.login({ email, password });
      if (response.data?.user && response.token) {
        setUser(response.data.user);
        // Ensure token is properly stored
        localStorage.setItem('authToken', response.token);
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
        return true;
      }
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await authApi.register({ name, email, password });
      
      if (response.status === 'success' && response.data?.user && response.token) {
        setUser(response.data.user);
        // Ensure token is properly stored
        localStorage.setItem('authToken', response.token);
        
        toast({
          title: "Account Created!",
          description: "Welcome to Sellify! Your account has been created successfully.",
        });
        return true;
      } else {
        console.error('❌ AuthContext: Invalid response format:', response);
        toast({
          title: "Registration Failed",
          description: "Invalid response from server. Please try again.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('❌ AuthContext: Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch (error) {
      // Even if API call fails, continue with logout
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local state
      setUser(null);
      localStorage.removeItem('authToken');
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 