import React from 'react';
import { useApp } from '../../context/AppContext';
import NotificationBell from './NotificationBell';

const Header: React.FC = () => {
    const { user, logout, theme, toggleTheme, toggleSidebar, openSearch } = useApp();

    return (
        <header className="flex items-center justify-between h-20 px-4 md:px-6 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 shadow-sm print:hidden flex-shrink-0">
            <div className="flex items-center space-x-2 md:space-x-4">
                 <button
                    onClick={toggleSidebar}
                    className="md:hidden p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    aria-label="Open sidebar"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                 <a href="https://hospitalespolanco.mx/" target="_blank" rel="noopener noreferrer" title="Hospital Polanco">
                    <img 
                        src="https://hospitalespolanco.mx/assets/pages/images/logo-white.png" 
                        alt="Hospital Polanco Logo" 
                        // The drop-shadow makes the white logo visible on the light theme's white background.
                        className="h-8 md:h-10 object-contain filter drop-shadow-[0_1px_2px_rgba(8,47,73,0.5)] dark:filter-none" 
                    />
                </a>
            </div>
            <div className="flex items-center space-x-1 md:space-x-2">
                 <button
                    onClick={openSearch}
                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center space-x-2 border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                    title="Búsqueda Global (Ctrl+K)"
                >
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                     <span className="hidden lg:inline text-sm pr-2">Búsqueda...</span>
                </button>
                
                {/* Theme Toggle Button Logic */}
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
                    title={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
                >
                    {theme === 'light' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    )}
                </button>

                <NotificationBell />
                <div className="flex items-center">
                    <div className="text-right mr-2 md:mr-3">
                        <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate max-w-[100px] md:max-w-none">{user?.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-brand-blue flex items-center justify-center text-white font-bold flex-shrink-0">
                        {user?.name?.charAt(0)}
                    </div>
                </div>
                <button 
                    onClick={logout}
                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
                    title="Cerrar Sesión"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                </button>
            </div>
        </header>
    );
};

export default Header;
