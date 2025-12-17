import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { UserRole } from './types';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import PropertiesPage from './pages/PropertiesPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import PropertyFormPage from './pages/PropertyFormPage';
import ReviewsPage from './pages/ReviewsPage';
import ReviewFormPage from './pages/ReviewFormPage';
import AppointmentsPage from './pages/AppointmentsPage';
import AppointmentFormPage from './pages/AppointmentFormPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProfilePage from './pages/ProfilePage';
import AgentProfilePage from './pages/AgentProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import { Toaster } from './components/ui/toaster';

// Create a client for TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes - No Layout */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Protected Routes - With Layout */}
            <Route element={<Layout />}>
              {/* Public pages (accessible to all) */}
              <Route path="/" element={<HomePage />} />
              <Route path="/properties" element={<PropertiesPage />} />
              <Route path="/properties/:id" element={<PropertyDetailPage />} />
              <Route path="/agents/:id" element={<AgentProfilePage />} />
              <Route path="/reviews" element={<ReviewsPage />} />

              {/* Protected: Authenticated users only */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/appointments"
                element={
                  <ProtectedRoute>
                    <AppointmentsPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected: Admin only */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Protected: Client only */}
              <Route
                path="/appointments/new"
                element={
                  <ProtectedRoute requiredRoles={[UserRole.CLIENT]}>
                    <AppointmentFormPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/reviews/new"
                element={
                  <ProtectedRoute requiredRoles={[UserRole.CLIENT]}>
                    <ReviewFormPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected: Agent only (create/edit properties) */}
              <Route
                path="/properties/new"
                element={
                  <ProtectedRoute requiredRoles={[UserRole.AGENT, UserRole.ADMIN]}>
                    <PropertyFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/properties/edit/:id"
                element={
                  <ProtectedRoute requiredRoles={[UserRole.AGENT, UserRole.ADMIN]}>
                    <PropertyFormPage />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
