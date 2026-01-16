import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Role } from './types';

const NavItem: React.FC<{ to: string; label: string; icon: React.ReactElement, badge?: number }> = ({ to, label, icon, badge }) => {
    const { isSidebarOpen, closeSidebar } = useApp();

    const handleClick = () => {
        if (window.innerWidth < 768 && isSidebarOpen) {
            closeSidebar();
        }
    };

    return (
        <NavLink
            to={to}
            onClick={handleClick}
            className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 text-gray-200 hover:bg-brand-blue-dark hover:text-white rounded-lg transition-colors duration-200 ${isActive ? 'bg-brand-blue-dark font-semibold text-white' : ''
                }`
            }
        >
            <div className="flex items-center">
                {icon}
                <span className="ml-4">{label}</span>
            </div>
            {badge && badge > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">{badge}</span>
            )}
        </NavLink>
    );
};

const SiGeMedLogoIcon = () => (
    <div className="relative w-12 h-12">
        <svg viewBox="0 0 24 24" className="w-full h-full text-brand-blue" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
        </div>
    </div>
);


const Sidebar: React.FC = () => {
    const { user, isSidebarOpen, closeSidebar, unreadEmailCount } = useApp();

    const canSee = (roles: Role[]) => user && roles.includes(user.role);
    const showDashboardLink = user && user.role !== Role.AREA_HEAD && user.role !== Role.READ_ONLY;

    return (
        <div className={`fixed inset-y-0 left-0 z-30 flex flex-col w-64 bg-slate-900 shadow-lg print:hidden transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out`}>
            <div className="bg-white dark:bg-slate-800 pt-6 pb-4 flex flex-col items-center border-b-2 border-gray-200 dark:border-gray-700">
                <div className="absolute top-4 right-4 md:hidden">
                    <button onClick={closeSidebar} className="p-1 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <SiGeMedLogoIcon />
                <h1 className="mt-2 text-xl font-semibold text-gray-800 dark:text-gray-200">SiGEMed</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Gestión de Equipo Médico</p>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                {/* General Section */}
                {showDashboardLink && <NavItem to="/dashboard" label="Dashboard" icon={<IconHome />} />}
                <NavItem to="/inventory" label="Inventario" icon={<IconInventory />} />

                {/* Technical Section */}
                {canSee([Role.SUPER_ADMIN, Role.SYSTEM_ADMIN, Role.BIOMEDICAL_ENGINEER]) && (
                    <>
                        <NavItem to="/maintenance" label="Mantenimiento" icon={<IconMaintenance />} />
                        <NavItem to="/calibration" label="Calibración" icon={<IconCalibration />} />
                        <NavItem to="/annual-report" label="Calendario Anual" icon={<IconCalendar />} />
                        <NavItem to="/notifications-email" label="Notificaciones" icon={<IconEmail />} badge={unreadEmailCount} />
                    </>
                )}

                {/* Admin Section */}
                {canSee([Role.SUPER_ADMIN, Role.SYSTEM_ADMIN]) && (
                    <>
                        <NavItem to="/reports" label="Estatus" icon={<IconReports />} />
                        <NavItem to="/suppliers" label="Proveedores" icon={<IconSuppliers />} />
                        <NavItem to="/audit-log" label="Auditoría" icon={<IconAuditLog />} />
                    </>
                )}

                {/* Documentation Section */}
                <NavItem to="/procedures" label="Formatos" icon={<IconProcedures />} />
                <NavItem to="/trainings" label="Capacitaciones" icon={<IconTrainings />} />

                {/* Super Admin Section */}
                {canSee([Role.SUPER_ADMIN]) && (
                    <div className="pt-4 mt-4 border-t border-slate-700">
                        <NavItem to="/users" label="Gestionar Usuarios" icon={<IconUsers />} />
                        <NavItem to="/settings" label="Configuración" icon={<IconSettings />} />
                    </div>
                )}

                {/* Footer Section */}
                <div className="!mt-auto pt-4 border-t border-slate-700">
                    <NavItem to="/faq" label="Ayuda y FAQ" icon={<IconFAQ />} />
                </div>
            </nav>
        </div>
    );
};

// --- Icon components (copied and created as needed) ---
const iconProps = { className: "h-6 w-6" };
const IconHome = () => <svg {...iconProps} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const IconInventory = () => <svg {...iconProps} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>;
const IconMaintenance = () => <svg {...iconProps} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const IconCalibration = () => <svg {...iconProps} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M12 6.343A5.657 5.657 0 0117.657 12 5.657 5.657 0 0112 17.657 5.657 5.657 0 016.343 12 5.657 5.657 0 0112 6.343z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.343V3m0 18v-3.343M17.657 12H21M3 12h3.343" /></svg>;
const IconCalendar = () => <svg {...iconProps} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const IconEmail = () => <svg {...iconProps} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const IconReports = () => <svg {...iconProps} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const IconSuppliers = () => <svg {...iconProps} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8a1 1 0 001-1zM3 11V6a1 1 0 011-1h4l3 3v7" /></svg>;
const IconProcedures = () => <svg {...iconProps} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
const IconTrainings = () => <svg {...iconProps} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" /><path d="M14.01 14L12 12.01 9.99 14M12 12.01V6" /></svg>;
const IconUsers = () => <svg {...iconProps} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm6-11a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const IconSettings = () => <svg {...iconProps} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const IconAuditLog = () => <svg {...iconProps} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconFAQ = () => <svg {...iconProps} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;


export default Sidebar;
