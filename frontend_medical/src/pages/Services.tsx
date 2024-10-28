import React from 'react';

const Services: React.FC = () => {
  return (
    <div className="container mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold text-center mb-12">Nuestros Servicios</h1>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Servicio 1 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Visualización Digital</h3>
          <p className="text-gray-600 mb-4">
            Sistema avanzado de visualización de muestras médicas con zoom de alta precisión
            y navegación intuitiva.
          </p>
          <ul className="text-gray-600 list-disc list-inside">
            <li>Alta resolución</li>
            <li>Zoom dinámico</li>
            <li>Navegación fluida</li>
          </ul>
        </div>

        {/* Servicio 2 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Gestión de Anotaciones</h3>
          <p className="text-gray-600 mb-4">
            Herramientas completas para crear y gestionar anotaciones en las muestras
            digitales.
          </p>
          <ul className="text-gray-600 list-disc list-inside">
            <li>Anotaciones en tiempo real</li>
            <li>Colaboración entre usuarios</li>
            <li>Historial de cambios</li>
          </ul>
        </div>

        {/* Servicio 3 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Análisis de Muestras</h3>
          <p className="text-gray-600 mb-4">
            Herramientas de análisis para facilitar el estudio y diagnóstico de las
            muestras.
          </p>
          <ul className="text-gray-600 list-disc list-inside">
            <li>Mediciones precisas</li>
            <li>Análisis de patrones</li>
            <li>Generación de informes</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Services;
