import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  redirectTo?: string;
}

/**
 * Protected Route component with Role-Based Access Control
 *
 * @param children - The component to render if access is granted
 * @param requiredRoles - Optional array of roles that are allowed to access this route
 * @param redirectTo - Optional path to redirect to if access is denied (defaults to /login)
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
  redirectTo = '/login',
}) => {
  const { isAuthenticated, isLoading, user, hasRole } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Načítání...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role-based access if requiredRoles is specified
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = hasRole(requiredRoles);

    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-col items-center space-y-2">
              <ShieldAlert className="h-12 w-12 text-destructive" />
              <CardTitle className="text-2xl font-bold text-center">
                Přístup odepřen
              </CardTitle>
              <CardDescription className="text-center">
                Nemáte oprávnění k přístupu na tuto stránku
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  <strong>Vaše role:</strong>{' '}
                  {user?.role === UserRole.ADMIN && 'Administrátor'}
                  {user?.role === UserRole.AGENT && 'Makléř'}
                  {user?.role === UserRole.CLIENT && 'Klient'}
                </p>
                <p>
                  <strong>Požadované role:</strong>{' '}
                  {requiredRoles.map((role) => {
                    if (role === UserRole.ADMIN) return 'Administrátor';
                    if (role === UserRole.AGENT) return 'Makléř';
                    if (role === UserRole.CLIENT) return 'Klient';
                    return role;
                  }).join(', ')}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => window.history.back()}
                  variant="default"
                  className="w-full"
                >
                  Zpět
                </Button>
                <Button
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                  className="w-full"
                >
                  Domovská stránka
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  // User is authenticated and has required role (if any)
  return <>{children}</>;
};

export default ProtectedRoute;
