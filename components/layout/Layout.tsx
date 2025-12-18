import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import NotificationPanel from './NotificationPanel';
import { useApp } from '../../context/AppContext';
import GlobalSearch from './GlobalSearch';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isPanelOpen, isSidebarOpen, closeSidebar, isSearchOpen } = useApp();

    return (
        <div className="flex h-screen bg-brand-gray-light dark:bg-gray-900 font-sans">
            <Sidebar />
            
            {isSearchOpen && <GlobalSearch />}

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                    onClick={closeSidebar}
                    aria-hidden="true"
                ></div>
            )}

            <div className="flex-1 flex flex-col overflow-hidden relative">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-brand-gray-light dark:bg-gray-800 p-4 md:p-6">
                    {children}
                </main>
                {isPanelOpen && <NotificationPanel />}
            </div>
        </div>
    );
};

export default Layout;
