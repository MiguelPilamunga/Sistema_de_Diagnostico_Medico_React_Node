import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Panel de Administración</h1>
      <p className="text-lg mb-4">Bienvenido, {user.username} (Admin)!</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Tarjeta de Gestión de Usuarios */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Gestión de Usuarios</h2>
          <p className="text-gray-600 mb-4">Administra los usuarios del sistema</p>
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Gestionar Usuarios
          </button>
        </div>

        {/* Tarjeta de Roles y Permisos */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Roles y Permisos</h2>
          <p className="text-gray-600 mb-4">Configura los roles y permisos</p>
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Gestionar Roles
          </button>
        </div>

        {/* Tarjeta de Gestión de Muestras */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Gestión de Muestras</h2>
          <p className="text-gray-600 mb-4">Administra las muestras del sistema</p>
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Gestionar Muestras
          </button>
        </div>
      </div>

      {/* Sección de Estadísticas */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Estadísticas del Sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="font-medium text-gray-500">Total Usuarios</h3>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="font-medium text-gray-500">Total Muestras</h3>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="font-medium text-gray-500">Anotaciones Hoy</h3>
            <p className="text-2xl font-bold">0</p>
          </div>
        </div>
      </div>

      {/* Lista de Actividad Reciente */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Actividad Reciente</h2>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b">
            <p className="text-gray-600">No hay actividad reciente para mostrar</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
