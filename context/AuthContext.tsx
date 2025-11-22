import React, { createContext, useState, useCallback, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isAdmin?: boolean;
  provider: 'email' | 'google' | 'github';
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  login: (user: User) => void;
  logout: () => void;
  signInWithEmail: (email: string, password: string, isAdmin?: boolean) => Promise<User>;
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
    const userWithBooleanAdmin = {
      ...newUser,
      isAdmin: newUser.isAdmin === true,
    };
    setUser(userWithBooleanAdmin);
    localStorage.setItem('user', JSON.stringify(userWithBooleanAdmin));
    console.log('User logged in:', userWithBooleanAdmin, 'isAdmin:', userWithBooleanAdmin.isAdmin === true);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string, isAdmin = false): Promise<User> => {
    // Simulated email authentication
    const newUser: User = {
      id: `email_${Date.now()}`,
      name: email.split('@')[0],
      email,
      provider: 'email',
      isAdmin: isAdmin,
    };
    login(newUser);
    return newUser;
  }, [login]);

  const signInWithGoogle = useCallback(async (): Promise<User> => {
    // Simulated Google OAuth
    const newUser: User = {
      id: `google_${Date.now()}`,
      name: 'Google User',
      email: `user${Date.now()}@gmail.com`,
      avatar: 'https://via.placeholder.com/100',
      provider: 'google',
      isAdmin: false,
    };
    login(newUser);
    return newUser;
  }, [login]);

  const signInWithGithub = useCallback(async (): Promise<User> => {
    // Simulated GitHub OAuth
    const newUser: User = {
      id: `github_${Date.now()}`,
      name: 'GitHub User',
      email: `user${Date.now()}@github.com`,
      avatar: 'https://via.placeholder.com/100',
      provider: 'github',
      isAdmin: false,
    };
    login(newUser);
    return newUser;
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
