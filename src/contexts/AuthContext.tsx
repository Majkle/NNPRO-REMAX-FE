import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, AddressRegion } from '@/types';
import authService, { LoginRequest, RegisterRequest } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, degree: string, firstName: string, lastName: string, phoneNumber: string, birthDate: Date, street: string, city: string, postalNumber: string, country: string, region: AddressRegion, flatNumber?: string) => Promise<void>;
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
      const request: LoginRequest = {
        username,
        password
      };

      const loginResponse = await authService.login(request);
      localStorage.setItem('token', loginResponse.token);
      setToken(loginResponse.token);

      const userResponse = await authService.getProfile();
      userResponse.role = loginResponse.role as unknown as UserRole;
      localStorage.setItem('user', JSON.stringify(userResponse));
      setUser(userResponse);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string,
    degree: string,
    firstName: string,
    lastName: string,
    phoneNumber: string,
    birthDate: Date,
    street: string,
    city: string,
    postalCode: string,
    country: string,
    region: AddressRegion,
    flatNumber?: string
  ) => {
    const registerRequest: RegisterRequest = {
      username,
      email,
      password,
      degree,
      firstName,
      lastName,
      phoneNumber,
      birthDate,
      street,
      city,
      postalCode,
      country,
      region,
      flatNumber
    };
    const loginRequest: LoginRequest = {
      username,
      password
    };

    try {
      const registerResponse = await authService.register(registerRequest);
      registerResponse.role = UserRole.CLIENT;
      localStorage.setItem('user', JSON.stringify(registerResponse));
      setUser(registerResponse);

      const loginResponse = await authService.login(loginRequest);
      localStorage.setItem('token', loginResponse.token);
      setToken(loginResponse.token);
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
