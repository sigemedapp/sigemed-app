import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Email } from '../components/layout/types';
import { MOCK_USERS } from '../constants';

const EmailNotificationsPage: React.FC = () => {
    const { emails, markEmailAsRead } = useApp();
    const [selectedEmail, setSelectedEmail] = useState<Email | null>(emails.length > 0 ? emails[0] : null);

    const handleSelectEmail = (email: Email) => {
        setSelectedEmail(email);
        if (!email.isRead) {
            markEmailAsRead(email.id);
        }
    };
    
    const getUserName = (id: string) => MOCK_USERS.find(u => u.id === id)?.name || id;

    return (
        <div className="flex h-[calc(100vh-120px)] bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
            <div className="w-1/3 border-r dark:border-gray-700 overflow-y-auto">
                <div className="p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Buzón de Salida</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Notificaciones simuladas</p>
                </div>
                <ul>
                    {emails.map(email => (
                        <li
                            key={email.id}
                            onClick={() => handleSelectEmail(email)}
                            className={`p-4 cursor-pointer border-l-4 ${
                                selectedEmail?.id === email.id
                                    ? 'bg-blue-50 dark:bg-slate-700 border-brand-blue'
                                    : 'border-transparent hover:bg-gray-50 dark:hover:bg-slate-700/50'
                            } ${!email.isRead ? 'font-semibold' : ''}`}
                        >
                            <p className={`text-sm ${!email.isRead ? 'text-gray-900 dark:text-gray-50' : 'text-gray-700 dark:text-gray-300'}`}>{email.subject}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Para: {getUserName(email.to)}</p>
                            <p className="text-xs text-right text-gray-400 dark:text-gray-500">{new Date(email.timestamp).toLocaleString()}</p>
                        </li>
                    ))}
                    {emails.length === 0 && (
                        <p className="p-4 text-center text-gray-500 dark:text-gray-400">No hay notificaciones.</p>
                    )}
                </ul>
            </div>

            <div className="w-2/3 p-6 overflow-y-auto">
                {selectedEmail ? (
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{selectedEmail.subject}</h1>
                        <div className="text-sm text-gray-500 dark:text-gray-400 border-b dark:border-gray-700 pb-4 mb-4">
                            <p><strong>De:</strong> {selectedEmail.from}</p>
                            <p><strong>Para:</strong> {getUserName(selectedEmail.to)}</p>
                            <p><strong>Fecha:</strong> {new Date(selectedEmail.timestamp).toLocaleString()}</p>
                        </div>
                        <div
                            className="prose dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
                        />
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-center">
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-200">Buzón de Salida Vacío</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Seleccione una notificación para verla aquí.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmailNotificationsPage;
