import React from 'react';
import { useApp } from '../context/AppContext';
import { MOCK_USERS } from '../constants';

const AuditLogPage: React.FC = () => {
    const { logEntries } = useApp();

    const getUserName = (userId: string) => {
        return MOCK_USERS.find(u => u.id === userId)?.name || 'Usuario Desconocido';
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Registro de Auditoría del Sistema</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Registro cronológico de las acciones importantes realizadas en el sistema.</p>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {logEntries.length > 0 ? (
                        logEntries.map(entry => (
                            <li key={entry.id} className="p-4 flex flex-col md:flex-row md:items-start space-x-4">
                                <div className="flex-shrink-0 w-full md:w-48 mb-2 md:mb-0">
                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{new Date(entry.timestamp).toLocaleString('es-MX')}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{getUserName(entry.userId)}</p>
                                </div>
                                <div className="flex-grow">
                                    <p className="font-semibold text-brand-blue-dark dark:text-brand-blue-light">{entry.action}</p>
                                    {entry.details && <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{entry.details}</p>}
                                </div>
                            </li>
                        ))
                    ) : (
                        <p className="text-center p-8 text-gray-500 dark:text-gray-400">No hay entradas en el registro de auditoría.</p>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default AuditLogPage;
