import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Dashboard } from './components/Dashboard';
import { Footer } from './components/Footer';
import { History } from './pages/History';
import { Simulation } from './pages/Simulation';
import { AppLayout } from './layouts/AppLayout';

// Subrutas que dependen de Auth para saber adónde redirigir la raíz ("/")
const BaseRoute: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) return null; // El ProtectedRoute maneja su propio loading en otras rutas, pero aquí no parpadeamos
  return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[var(--color-brand-dark)] text-white font-sans pb-16">
          <Routes>
            <Route path="/" element={<BaseRoute />} />

            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <History />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/simulation"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Simulation />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
