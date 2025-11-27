import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import authService, { LoginRequest } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, firstName: string, lastName: string, role: UserRole) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user and token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      // TODO: Replace with actual API call
      const request: LoginRequest = {
        username,
        password
      };

      // Mock login for now - use email to determine role for testing
      let mockToken = 'mock-jwt-token-' + Date.now();

      // Determine role based on email for testing
      let role: UserRole = UserRole.CLIENT;
      let firstName = 'Test';
      let lastName = 'User';
      let email = 'test@user.com';
      let userId = Date.now();
      let createdAt = Date.now();
      let updatedAt = Date.now();

      // Check for admin first
      if (username === 'admin') {
        role = UserRole.ADMIN;
        userId = 999; // Special admin ID
        firstName = 'Admin';
        lastName = 'Správce';
        email = 'admin@remax.com';
      } else if (username.includes('remax')) {
        // Check for RE/MAX agents (using remax in email)
        role = UserRole.AGENT;
        // Use specific mock agent data for petr.novotny@remax.cz
        if (username === 'petr.novotny.remax') {
          userId = 1; // Match the agentId in mock properties
          firstName = 'Petr';
          lastName = 'Novotný';
          email = 'petr.novotny@remax.com';
        } else {
          firstName = 'Jan';
          lastName = 'Makléř';
          email = 'jan.makler@remax.com';
        }
      } else {
        const loginResponse = await authService.login(request);
        localStorage.setItem('token', loginResponse.token);

        const userResponse = await authService.getProfile();
        console.log(userResponse);
        mockToken = loginResponse.token;
        role = UserRole.CLIENT;
        userId = userResponse.id;
        firstName = userResponse.personalInformation.firstName;
        lastName = userResponse.personalInformation.lastName;
        email = userResponse.email;
        createdAt = userResponse.createdAt;
      }

      const mockUser: User = {
        id: userId,
        username,
        email,
        firstName,
        lastName,
        role,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));

      setToken(mockToken);
      setUser(mockUser);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: UserRole
  ) => {
    try {
      // TODO: Replace with actual API call
      // Mock register for now
      const mockToken = 'mock-jwt-token-' + Date.now();
      const mockUser: User = {
        id: Date.now(),
        username,
        email,
        firstName,
        lastName,
        role,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));

      setToken(mockToken);
      setUser(mockUser);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const hasRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
