import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Home from './pages/Home';
import Contact from './pages/Contact';
import Services from './pages/Services';
import Login from './pages/Login';

import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import MedicalViewer from './pages/Visor';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/services" element={<Services />} />
          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute requiredPermissions={['VIEW_SAMPLES']}>
                <Dashboard />
              </PrivateRoute>
            }
          />
            <Route
                path="/visor"
                element={
                    <PrivateRoute>
                        <MedicalViewer />
                    </PrivateRoute>
                }
            />
          <Route
            path="/admin"
            element={
              <PrivateRoute requiredPermissions={['MANAGE_USERS']}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          
          {/* Redirigir rutas no encontradas al inicio */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </AuthProvider>
  );
};

export default App;
