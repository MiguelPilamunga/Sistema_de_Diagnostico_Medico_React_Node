import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              Medical Viewer
            </Link>
            
            {/* Enlaces públicos */}
            <div className="hidden md:flex space-x-4">
              <Link to="/" className="text-gray-600 hover:text-blue-600">
                Inicio
              </Link>
              <Link to="/services" className="text-gray-600 hover:text-blue-600">
                Servicios
              </Link>
              <Link to="/contact" className="text-gray-600 hover:text-blue-600">
                Contacto
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Enlaces protegidos */}
                <Link to="/dashboard" className="text-gray-600 hover:text-blue-600">
                  Dashboard
                </Link>
                {user?.roles.some(role => role.name === 'ADMIN') && (
                  <Link to="/admin" className="text-gray-600 hover:text-blue-600">
                    Admin
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
