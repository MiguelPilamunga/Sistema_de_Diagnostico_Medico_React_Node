import React from 'react';

const Contact: React.FC = () => {
  return (
    <div className="container mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold text-center mb-8">Contáctenos</h1>
      
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <form className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                Nombre
              </label>
              <input
                type="text"
                id="name"
                className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Su nombre"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="su@email.com"
              />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-gray-700 font-medium mb-2">
                Mensaje
              </label>
              <textarea
                id="message"
                rows={4}
                className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Su mensaje..."
              ></textarea>
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Enviar Mensaje
            </button>
          </form>
        </div>
        
        <div className="mt-12 grid md:grid-cols-2 gap-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Dirección</h3>
            <p className="text-gray-600">
              123 Calle Principal<br />
              Ciudad, País
            </p>
          </div>
          
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Contacto</h3>
            <p className="text-gray-600">
              Email: info@medical-viewer.com<br />
              Teléfono: +1 234 567 890
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
