import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Notification } from './types';

const NotificationItem: React.FC<{ notification: Notification; onRead: (id: string) => void }> = ({ notification, onRead }) => {
    const navigate = useNavigate();
    const { togglePanel } = useApp();

    const handleClick = () => {
        if (!notification.isRead) {
            onRead(notification.id);
        }
        if (notification.linkTo) {
            navigate(notification.linkTo);
        }
        togglePanel();
    };
    
    const timeAgo = (timestamp: string): string => {
        const seconds = Math.floor((new Date().getTime() - new Date(timestamp).getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return `hace ${Math.floor(interval)} años`;
        interval = seconds / 2592000;
        if (interval > 1) return `hace ${Math.floor(interval)} meses`;
        interval = seconds / 86400;
        if (interval > 1) return `hace ${Math.floor(interval)} días`;
        interval = seconds / 3600;
        if (interval > 1) return `hace ${Math.floor(interval)} horas`;
        interval = seconds / 60;
        if (interval > 1) return `hace ${Math.floor(interval)} minutos`;
        return `hace ${Math.floor(seconds)} segundos`;
    };

    return (
        <div 
            onClick={handleClick}
            className={`p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-l-4 ${notification.isRead ? 'border-transparent' : 'border-brand-blue'}`}
        >
            <p className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-800 dark:text-gray-100' : 'text-gray-600 dark:text-gray-300'}`}>
                {notification.message}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{timeAgo(notification.timestamp)}</p>
        </div>
    );
};


const NotificationPanel: React.FC = () => {
    const { notifications, markAsRead, markAllAsRead } = useApp();
    const sortedNotifications = [...notifications].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return (
        <div className="absolute top-16 right-6 w-80 max-w-sm bg-white dark:bg-slate-800 rounded-lg shadow-xl z-50 border border-gray-200 dark:border-gray-700">
            <div className="p-3 flex justify-between items-center border-b dark:border-gray-700">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">Notificaciones</h3>
                <button 
                    onClick={markAllAsRead} 
                    className="text-xs text-brand-blue hover:underline"
                >
                    Marcar todas como leídas
                </button>
            </div>
            <div className="max-h-96 overflow-y-auto divide-y dark:divide-gray-700">
                {sortedNotifications.length > 0 ? (
                    sortedNotifications.map(n => (
                        <NotificationItem key={n.id} notification={n} onRead={markAsRead} />
                    ))
                ) : (
                    <p className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">No hay notificaciones.</p>
                )}
            </div>
        </div>
    );
};

export default NotificationPanel;
