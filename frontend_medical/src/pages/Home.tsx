import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white">
        <div className="container mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Sistema de Visualización de Muestras Médicas
          </h1>
          <p className="text-xl mb-8">
            Plataforma avanzada para la visualización y análisis de muestras médicas digitales
          </p>
          {!isAuthenticated && (
            <Link
              to="/login"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Iniciar Sesión
            </Link>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Visualización Digital</h3>
            <p className="text-gray-600">
              Visualice muestras médicas en alta resolución con herramientas avanzadas de zoom.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Anotaciones</h3>
            <p className="text-gray-600">
              Realice y comparta anotaciones en las muestras con otros profesionales.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Colaboración</h3>
            <p className="text-gray-600">
              Trabaje en equipo con otros profesionales médicos en tiempo real.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
