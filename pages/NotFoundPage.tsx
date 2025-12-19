
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <h1 className="text-6xl font-bold text-brand-blue">404</h1>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mt-4">Página no encontrada</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Lo sentimos, la página que estás buscando no existe.</p>
            <Link to="/dashboard" className="mt-6 px-6 py-2 bg-brand-blue text-white rounded-md hover:bg-brand-blue-dark transition-colors">
                Volver al Dashboard
            </Link>
        </div>
    );
};

export default NotFoundPage;