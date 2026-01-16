import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Email } from '../components/layout/types';
import { MOCK_USERS } from '../constants';

const EmailNotificationsPage: React.FC = () => {
    const { emails, markEmailAsRead, notifications, markAsRead } = useApp();
    const [selectedEmail, setSelectedEmail] = useState<Email | null>(emails.length > 0 ? emails[0] : null);
    const [activeTab, setActiveTab] = useState<'emails' | 'notifications'>('emails');

    const handleSelectEmail = (email: Email) => {
        setSelectedEmail(email);
        if (!email.isRead) {
            markEmailAsRead(email.id);
        }
    };

    const getUserName = (id: string) => MOCK_USERS.find(u => u.id === id)?.name || id;

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
            {/* Tabs Header */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-700/50">
                <button
                    onClick={() => setActiveTab('emails')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'emails'
                            ? 'text-brand-blue border-b-2 border-brand-blue bg-white dark:bg-slate-800'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                >
                    ✉️ Buzón de Correos
                </button>
                <button
                    onClick={() => setActiveTab('notifications')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'notifications'
                            ? 'text-brand-blue border-b-2 border-brand-blue bg-white dark:bg-slate-800'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                >
                    🔔 Alertas del Sistema
                </button>
            </div>

            {/* Content Area */}
            {activeTab === 'emails' ? (
                <div className="flex flex-1 overflow-hidden">
                    <div className="w-1/3 border-r dark:border-gray-700 overflow-y-auto">
                        <ul>
                            {emails.map(email => (
                                <li
                                    key={email.id}
                                    onClick={() => handleSelectEmail(email)}
                                    className={`p-4 cursor-pointer border-l-4 ${selectedEmail?.id === email.id
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
                                <p className="p-4 text-center text-gray-500 dark:text-gray-400">No hay correos.</p>
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
                                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-200">Buzón Vacío</h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Seleccione un correo para leerlo.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-slate-900">
                    <div className="max-w-3xl mx-auto space-y-4">
                        {notifications.length > 0 ? (
                            notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    onClick={() => !notification.isRead && markAsRead(notification.id)}
                                    className={`bg-white dark:bg-slate-800 p-4 rounded-lg shadow border-l-4 cursor-pointer ${notification.isRead ? 'border-gray-300 dark:border-gray-600' : 'border-brand-blue'
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className={`text-md ${!notification.isRead ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {new Date(notification.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                        {notification.linkTo && (
                                            <a href={`#${notification.linkTo}`} className="text-sm text-brand-blue hover:underline">
                                                Ver Detalle
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10">
                                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-200">Sin Alertas</h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">No tienes notificaciones del sistema.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmailNotificationsPage;
