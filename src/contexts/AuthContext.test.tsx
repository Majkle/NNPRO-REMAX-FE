import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import authService from '@/services/authService';
import { UserRole, AddressRegion } from '@/types';

// Mock authService
jest.mock('@/services/authService');

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('AuthContext', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    // Suppress console.error for expected errors in tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  describe('Inicializace', () => {
    it('načte uživatele a token z localStorage při spuštění', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: UserRole.CLIENT,
        createdAt: '2024-01-01T00:00:00.000Z',
        personalInformation: {
          firstName: 'Test',
          lastName: 'User',
          phoneNumber: '123456789',
          degree: 'Bc.',
          birthDate: '1990-01-01T00:00:00.000Z',
          address: {
            id: 1,
            street: 'Test St',
            city: 'Prague',
            postalCode: '12000',
            country: 'CZ',
            region: AddressRegion.PRAHA,
          },
        },
      };

      localStorageMock.setItem('token', 'test-token');
      localStorageMock.setItem('user', JSON.stringify(mockUser));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.token).toBe('test-token');
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('začne s null hodnotami když není nic v localStorage', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBe(null);
      expect(result.current.token).toBe(null);
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('login', () => {
    it('úspěšně přihlásí uživatele', async () => {
      const mockLoginResponse = {
        token: 'new-token',
        role: 'CLIENT',
      };

      const mockUserProfile = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: UserRole.CLIENT,
        createdAt: new Date('2024-01-01'),
        personalInformation: {
          firstName: 'Test',
          lastName: 'User',
          phoneNumber: '123456789',
          degree: 'Bc.',
          birthDate: new Date('1990-01-01'),
          address: {
            id: 1,
            street: 'Test St',
            city: 'Prague',
            postalCode: '12000',
            country: 'CZ',
            region: AddressRegion.PRAHA,
          },
        },
      };

      (authService.login as jest.Mock).mockResolvedValue(mockLoginResponse);
      (authService.getProfile as jest.Mock).mockResolvedValue(mockUserProfile);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login('testuser', 'password123');
      });

      expect(result.current.user).toEqual(mockUserProfile);
      expect(result.current.token).toBe('new-token');
      expect(result.current.isAuthenticated).toBe(true);
      expect(localStorageMock.getItem('token')).toBe('new-token');
      expect(localStorageMock.getItem('user')).toBe(JSON.stringify(mockUserProfile));
    });

    it('vyhodí chybu při neúspěšném přihlášení', async () => {
      (authService.login as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.login('wronguser', 'wrongpassword');
        })
      ).rejects.toThrow('Invalid credentials');

      expect(result.current.user).toBe(null);
      expect(result.current.token).toBe(null);
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('register', () => {
    it('úspěšně zaregistruje a přihlásí uživatele', async () => {
      const mockRegisterResponse = {
        id: 1,
        username: 'newuser',
        email: 'new@example.com',
        role: UserRole.CLIENT,
        createdAt: new Date('2024-01-01'),
        personalInformation: {
          firstName: 'New',
          lastName: 'User',
          phoneNumber: '987654321',
          degree: 'Ing.',
          birthDate: new Date('1995-05-05'),
          address: {
            id: 1,
            street: 'New St',
            city: 'Brno',
            postalCode: '60200',
            country: 'CZ',
            region: AddressRegion.JIHOMORAVSKY,
          },
        },
      };

      const mockLoginResponse = {
        token: 'registration-token',
        role: 'CLIENT',
      };

      (authService.register as jest.Mock).mockResolvedValue(mockRegisterResponse);
      (authService.login as jest.Mock).mockResolvedValue(mockLoginResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.register(
          'newuser',
          'new@example.com',
          'password123',
          'Ing.',
          'New',
          'User',
          '987654321',
          new Date('1995-05-05'),
          'New St',
          'Brno',
          '60200',
          'CZ',
          AddressRegion.JIHOMORAVSKY
        );
      });

      expect(result.current.user).toEqual(mockRegisterResponse);
      expect(result.current.token).toBe('registration-token');
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('vyhodí chybu při neúspěšné registraci', async () => {
      (authService.register as jest.Mock).mockRejectedValue(
        new Error('Username already exists')
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.register(
            'existinguser',
            'test@example.com',
            'password',
            'Bc.',
            'Test',
            'User',
            '123',
            new Date(),
            'St',
            'City',
            '12000',
            'CZ',
            AddressRegion.PRAHA
          );
        })
      ).rejects.toThrow('Username already exists');
    });
  });

  describe('logout', () => {
    it('odhlásí uživatele a vyčistí localStorage', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: UserRole.CLIENT,
        createdAt: new Date('2024-01-01'),
        personalInformation: {
          firstName: 'Test',
          lastName: 'User',
          phoneNumber: '123',
          degree: 'Bc.',
          birthDate: new Date(),
          address: {
            id: 1,
            street: 'St',
            city: 'City',
            postalCode: '12000',
            country: 'CZ',
            region: AddressRegion.PRAHA,
          },
        },
      };

      localStorageMock.setItem('token', 'test-token');
      localStorageMock.setItem('user', JSON.stringify(mockUser));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(true);

      act(() => {
        result.current.logout();
      });

      expect(result.current.user).toBe(null);
      expect(result.current.token).toBe(null);
      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorageMock.getItem('token')).toBe(null);
      expect(localStorageMock.getItem('user')).toBe(null);
    });
  });

  describe('updateUser', () => {
    it('aktualizuje uživatele a uloží do localStorage', async () => {
      const originalUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: UserRole.CLIENT,
        createdAt: new Date('2024-01-01'),
        personalInformation: {
          firstName: 'Test',
          lastName: 'User',
          phoneNumber: '123',
          degree: 'Bc.',
          birthDate: new Date('1990-01-01'),
          address: {
            id: 1,
            street: 'Old St',
            city: 'Prague',
            postalCode: '12000',
            country: 'CZ',
            region: AddressRegion.PRAHA,
          },
        },
      };

      localStorageMock.setItem('token', 'test-token');
      localStorageMock.setItem('user', JSON.stringify(originalUser));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const updatedUser = {
        ...originalUser,
        personalInformation: {
          ...originalUser.personalInformation,
          firstName: 'Updated',
        },
      };

      act(() => {
        result.current.updateUser(updatedUser);
      });

      expect(result.current.user).toEqual(updatedUser);
      expect(localStorageMock.getItem('user')).toBe(JSON.stringify(updatedUser));
    });
  });

  describe('hasRole', () => {
    it('vrátí true když uživatel má požadovanou roli', async () => {
      const mockUser = {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
        createdAt: new Date('2024-01-01'),
        personalInformation: {
          firstName: 'Admin',
          lastName: 'User',
          phoneNumber: '123',
          degree: 'Bc.',
          birthDate: new Date(),
          address: {
            id: 1,
            street: 'St',
            city: 'City',
            postalCode: '12000',
            country: 'CZ',
            region: AddressRegion.PRAHA,
          },
        },
      };

      localStorageMock.setItem('token', 'admin-token');
      localStorageMock.setItem('user', JSON.stringify(mockUser));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasRole([UserRole.ADMIN])).toBe(true);
      expect(result.current.hasRole([UserRole.AGENT, UserRole.ADMIN])).toBe(true);
    });

    it('vrátí false když uživatel nemá požadovanou roli', async () => {
      const mockUser = {
        id: 1,
        username: 'client',
        email: 'client@example.com',
        role: UserRole.CLIENT,
        createdAt: new Date('2024-01-01'),
        personalInformation: {
          firstName: 'Client',
          lastName: 'User',
          phoneNumber: '123',
          degree: 'Bc.',
          birthDate: new Date(),
          address: {
            id: 1,
            street: 'St',
            city: 'City',
            postalCode: '12000',
            country: 'CZ',
            region: AddressRegion.PRAHA,
          },
        },
      };

      localStorageMock.setItem('token', 'client-token');
      localStorageMock.setItem('user', JSON.stringify(mockUser));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasRole([UserRole.ADMIN])).toBe(false);
      expect(result.current.hasRole([UserRole.AGENT])).toBe(false);
    });

    it('vrátí false když není přihlášený uživatel', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasRole([UserRole.CLIENT])).toBe(false);
      expect(result.current.hasRole([UserRole.ADMIN, UserRole.AGENT])).toBe(false);
    });
  });

  describe('useAuth hook chyby', () => {
    it('vyhodí chybu když se použije mimo AuthProvider', () => {
      // Suppress console.error for this specific test
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleError.mockRestore();
    });
  });

  describe('isAuthenticated', () => {
    it('je true když jsou uživatel i token nastaveny', async () => {
      const mockUser = {
        id: 1,
        username: 'user',
        email: 'user@example.com',
        role: UserRole.CLIENT,
        createdAt: new Date('2024-01-01'),
        personalInformation: {
          firstName: 'User',
          lastName: 'Test',
          phoneNumber: '123',
          degree: 'Bc.',
          birthDate: new Date(),
          address: {
            id: 1,
            street: 'St',
            city: 'City',
            postalCode: '12000',
            country: 'CZ',
            region: AddressRegion.PRAHA,
          },
        },
      };

      localStorageMock.setItem('token', 'token');
      localStorageMock.setItem('user', JSON.stringify(mockUser));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(true);
    });

    it('je false když chybí token', async () => {
      const mockUser = {
        id: 1,
        username: 'user',
        email: 'user@example.com',
        role: UserRole.CLIENT,
        createdAt: new Date('2024-01-01'),
        personalInformation: {
          firstName: 'User',
          lastName: 'Test',
          phoneNumber: '123',
          degree: 'Bc.',
          birthDate: new Date(),
          address: {
            id: 1,
            street: 'St',
            city: 'City',
            postalCode: '12000',
            country: 'CZ',
            region: AddressRegion.PRAHA,
          },
        },
      };

      localStorageMock.setItem('user', JSON.stringify(mockUser));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
    });

    it('je false když chybí uživatel', async () => {
      localStorageMock.setItem('token', 'token');

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
    });
  });
});
