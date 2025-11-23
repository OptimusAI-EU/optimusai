import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { saveUser, updateLastLogin } from '../utils/userStorage';
import { logAdminAction } from '../utils/auditLog';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isAdmin?: boolean;
  provider: 'email' | 'google' | 'github';
  createdAt?: string;
  lastLogin?: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  login: (user: User) => void;
  logout: () => void;
  signInWithEmail: (email: string, password: string, isAdmin?: boolean, isSignUp?: boolean, firstName?: string, lastName?: string) => Promise<User>;
  signInWithGoogle: () => Promise<User>;
  signInWithGithub: () => Promise<User>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        // Ensure isAdmin is explicitly a boolean
        if (parsedUser) {
          parsedUser.isAdmin = parsedUser.isAdmin === true;
        }
        return parsedUser;
      }
    } catch (error) {
      console.error('Failed to parse stored user:', error);
    }
    return null;
  });

  const login = useCallback((newUser: User) => {
    // Ensure isAdmin is explicitly boolean
    const userWithBooleanAdmin: User = {
      ...newUser,
      isAdmin: newUser.isAdmin === true,
      lastLogin: new Date().toISOString(),
    };
    setUser(userWithBooleanAdmin);
    localStorage.setItem('user', JSON.stringify(userWithBooleanAdmin));
    
    // Save user to global users list for admin management
    saveUser({
      id: userWithBooleanAdmin.id,
      name: userWithBooleanAdmin.name,
      email: userWithBooleanAdmin.email,
      avatar: userWithBooleanAdmin.avatar,
      isAdmin: userWithBooleanAdmin.isAdmin,
      provider: userWithBooleanAdmin.provider,
      createdAt: userWithBooleanAdmin.createdAt || new Date().toISOString(),
      lastLogin: userWithBooleanAdmin.lastLogin || new Date().toISOString(),
    });

    // Log login action
    logAdminAction({
      adminId: userWithBooleanAdmin.id,
      adminEmail: userWithBooleanAdmin.email,
      action: 'login',
      description: `${userWithBooleanAdmin.email} logged in`,
      status: 'success',
    });

    console.log('User logged in:', userWithBooleanAdmin, 'isAdmin:', userWithBooleanAdmin.isAdmin === true);
  }, []);

  const logout = useCallback(() => {
    if (user) {
      // Log logout action
      logAdminAction({
        adminId: user.id,
        adminEmail: user.email,
        action: 'logout',
        description: `${user.email} logged out`,
        status: 'success',
      });
    }
    setUser(null);
    localStorage.removeItem('user');
  }, [user]);

  const signInWithEmail = useCallback(async (email: string, password: string, isAdmin = false, isSignUp = false, firstName?: string, lastName?: string): Promise<User> => {
    try {
      const backendUrl = typeof (window as any).VITE_API_URL !== 'undefined' 
        ? (window as any).VITE_API_URL 
        : 'http://localhost:5000';
      
      const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';
      const body: any = { email, password };
      
      if (isSignUp) {
        body.firstName = firstName || email.split('@')[0];
        body.lastName = lastName || 'User';
      }

      const response = await fetch(`${backendUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || (isSignUp ? 'Registration failed' : 'Login failed'));
      }

      const data = await response.json();

      // For signup - success response even if email not yet verified
      if (isSignUp && !data.accessToken) {
        // User needs to verify email first
        console.log('Email verification required:', data.message);
        console.log('Verification URL for development:', data.verificationUrl);
        // Return user data without throwing error, so parent component can show success message
        return {
          id: String(data.user?.id || Date.now()),
          name: data.user?.firstName || firstName || email.split('@')[0],
          email: email,
          provider: 'email',
          isAdmin: false,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        };
      }

      const { accessToken, user: backendUser } = data;

      // Store JWT token
      if (accessToken) {
        localStorage.setItem('authToken', accessToken);
      }

      // Create user object from backend response
      const newUser: User = {
        id: String(backendUser.id),
        name: `${backendUser.firstName || ''} ${backendUser.lastName || ''}`.trim() || email.split('@')[0],
        email: backendUser.email,
        provider: 'email',
        isAdmin: backendUser.role === 'admin' || isAdmin,
        createdAt: backendUser.createdAt || new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      // Only login if we have a token (not for signup pending email verification)
      if (accessToken) {
        login(newUser);
      }
      
      return newUser;
    } catch (error) {
      console.error('Email sign in/up failed:', error);
      throw error;
    }
  }, [login]);

  const signInWithGoogle = useCallback(async (): Promise<User> => {
    const backendUrl = typeof (window as any).VITE_API_URL !== 'undefined' 
      ? (window as any).VITE_API_URL 
      : 'http://localhost:5000';
    
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${backendUrl}/api/auth/google`;
    
    // This line will never execute, but we need to return something for the type
    return null as any;
  }, [login]);

  const signInWithGithub = useCallback(async (): Promise<User> => {
    const backendUrl = typeof (window as any).VITE_API_URL !== 'undefined' 
      ? (window as any).VITE_API_URL 
      : 'http://localhost:5000';
    
    // Redirect to backend GitHub OAuth endpoint
    window.location.href = `${backendUrl}/api/auth/github`;
    
    // This line will never execute, but we need to return something for the type
    return null as any;
  }, [login]);

  const value: AuthContextType = {
    user,
    isLoggedIn: !!user,
    isAdmin: user?.isAdmin === true,
    login,
    logout,
    signInWithEmail,
    signInWithGoogle,
    signInWithGithub,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
