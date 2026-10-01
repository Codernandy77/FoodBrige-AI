import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { NotificationProvider } from './context/NotificationContext';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { DonorDashboard } from './pages/DonorDashboard';
import { NGODashboard } from './pages/NGODashboard';
import { VolunteerDashboard } from './pages/VolunteerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { ImpactPage } from './pages/ImpactPage';
import { NeedMapPage } from './pages/NeedMapPage';

// Protection router guard wrapper
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  allowedRoles: Array<'DONOR' | 'NGO' | 'VOLUNTEER' | 'ADMIN'> 
}> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-xs text-slate-400">
        Authenticating user profile session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <NotificationProvider>
            <Layout>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/impact" element={<ImpactPage />} />
                <Route path="/need-map" element={<NeedMapPage />} />

                {/* Role Protected Routes */}
                <Route 
                  path="/donor-dashboard" 
                  element={
                    <ProtectedRoute allowedRoles={['DONOR', 'ADMIN']}>
                      <DonorDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/ngo-dashboard" 
                  element={
                    <ProtectedRoute allowedRoles={['NGO', 'ADMIN']}>
                      <NGODashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/volunteer-dashboard" 
                  element={
                    <ProtectedRoute allowedRoles={['VOLUNTEER', 'ADMIN']}>
                      <VolunteerDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin-dashboard" 
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />

                {/* General Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </NotificationProvider>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};
export default App;
