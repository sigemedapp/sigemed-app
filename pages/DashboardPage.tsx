import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Role, WorkOrderStatus, WorkOrderType } from '../components/layout/types';

const ModuleCard: React.FC<{
    title: string;
    description: string;
    icon: React.ReactElement<{ className?: string }>;
    linkTo: string;
    badgeCount?: number;
    color: 'blue' | 'orange' | 'cyan' | 'green' | 'red' | 'gray';
}> = ({ title, description, icon, linkTo, badgeCount, color }) => {
    
    const colorClasses = {
        blue: { border: 'border-blue-500', text: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/30' },
        orange: { border: 'border-orange-500', text: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/30' },
        cyan: { border: 'border-cyan-500', text: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-900/30' },
        green: { border: 'border-green-500', text: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/30' },
        red: { border: 'border-red-500', text: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/30' },
        gray: { border: 'border-gray-500', text: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-900/30' },
    };

    const selectedColor = colorClasses[color];

    return (
        <Link 
            to={linkTo} 
            className={`group bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-l-4 ${selectedColor.border} flex flex-col justify-between`}
        >
            <div>
                <div className="flex justify-between items-start">
                    <div className={`p-3 rounded-full ${selectedColor.bg}`}>
                        {React.cloneElement(icon, { className: `h-8 w-8 ${selectedColor.text}` })}
                    </div>
                    {badgeCount !== undefined && badgeCount > 0 && (
                        <div className="bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full">
                            {badgeCount}
                        </div>
                    )}
                </div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-4">{title}</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">{description}</p>
            </div>
            <div className="mt-4">
                <span className="text-sm font-semibold text-brand-blue group-hover:underline">
                    Ir al módulo &rarr;
                </span>
            </div>
        </Link>
    );
};


const DashboardPage: React.FC = () => {
    const { user, workOrders, unreadEmailCount } = useApp();

    const stats = useMemo(() => {
        return {
            reportedFailures: workOrders.filter(wo => wo.status === WorkOrderStatus.REPORTED).length,
            openCalibrations: workOrders.filter(wo => wo.type === WorkOrderType.CALIBRATION && wo.status !== WorkOrderStatus.CLOSED).length,
            unreadEmails: unreadEmailCount
        };
    }, [workOrders, unreadEmailCount]);
    
    const moduleCards = useMemo(() => [
        {
            key: 'failures',
            title: 'Fallas Reportadas',
            description: 'Gestionar nuevas fallas y órdenes de trabajo correctivas.',
            icon: <IconFailure />,
            linkTo: '/maintenance',
            color: 'orange' as const,
            isVisible: (u: any) => u && [Role.SUPER_ADMIN, Role.SYSTEM_ADMIN, Role.BIOMEDICAL_ENGINEER].includes(u.role),
            getBadgeCount: (s: typeof stats) => s.reportedFailures,
        },
        {
            key: 'calibration',
            title: 'Calibración',
            description: 'Ver y gestionar las órdenes de calibración programadas y abiertas.',
            icon: <IconCalibration />,
            linkTo: '/calibration',
            color: 'cyan' as const,
            isVisible: (u: any) => u && [Role.SUPER_ADMIN, Role.SYSTEM_ADMIN, Role.BIOMEDICAL_ENGINEER].includes(u.role),
            getBadgeCount: (s: typeof stats) => s.openCalibrations,
        },
        {
            key: 'inventory',
            title: 'Inventario',
            description: 'Consultar el listado completo de equipos médicos, estados y ubicaciones.',
            icon: <IconInventory />,
            linkTo: '/inventory',
            color: 'green' as const,
            isVisible: () => true,
        },
        {
            key: 'annual-report',
            title: 'Calendario Anual',
            description: 'Visualizar el programa de mantenimiento preventivo para todo el año.',
            icon: <IconCalendar />,
            linkTo: '/annual-report',
            color: 'blue' as const,
            isVisible: (u: any) => u && [Role.SUPER_ADMIN, Role.SYSTEM_ADMIN, Role.BIOMEDICAL_ENGINEER].includes(u.role),
        },
        {
            key: 'reports',
            title: 'Reportes',
            description: 'Analizar métricas clave sobre el inventario y las órdenes de trabajo.',
            icon: <IconReports />,
            linkTo: '/reports',
            color: 'blue' as const,
            isVisible: (u: any) => u && [Role.SUPER_ADMIN, Role.SYSTEM_ADMIN].includes(u.role),
        },
        {
            key: 'notifications',
            title: 'Notificaciones por Correo',
            description: 'Revisar el buzón de salida con las alertas y resúmenes enviados.',
            icon: <IconEmail />,
            linkTo: '/notifications-email',
            color: 'red' as const,
            isVisible: (u: any) => u && [Role.SUPER_ADMIN, Role.SYSTEM_ADMIN, Role.BIOMEDICAL_ENGINEER].includes(u.role),
            getBadgeCount: (s: typeof stats) => s.unreadEmails,
        },
        {
            key: 'users',
            title: 'Gestionar Usuarios',
            description: 'Agregar, editar o eliminar usuarios y gestionar sus roles de acceso.',
            icon: <IconUsers />,
            linkTo: '/users',
            color: 'gray' as const,
            isVisible: (u: any) => u && u.role === Role.SUPER_ADMIN,
        },
        {
            key: 'settings',
            title: 'Configuración',
            description: 'Realizar cargas masivas, corrección de datos y exportar inventario.',
            icon: <IconSettings />,
            linkTo: '/settings',
            color: 'gray' as const,
            isVisible: (u: any) => u && u.role === Role.SUPER_ADMIN,
        },
        {
            key: 'audit',
            title: 'Registro de Auditoría',
            description: 'Consultar el historial cronológico de todas las acciones en el sistema.',
            icon: <IconAuditLog />,
            linkTo: '/audit-log',
            color: 'gray' as const,
            isVisible: (u: any) => u && u.role === Role.SUPER_ADMIN,
        }
    ], []);

    const visibleCards = useMemo(() => moduleCards.filter(card => card.isVisible(user)), [user, moduleCards]);

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Bienvenido, {user?.name}</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">Aquí tiene un resumen del estado de sus equipos y tareas.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                 {visibleCards.map(card => (
                    <ModuleCard 
                        key={card.key}
                        title={card.title}
                        description={card.description}
                        icon={card.icon}
                        linkTo={card.linkTo}
                        color={card.color}
                        badgeCount={card.getBadgeCount ? card.getBadgeCount(stats) : undefined}
                    />
                ))}
            </div>
        </div>
    );
};

const IconFailure = ({className = "h-6 w-6"}: {className?: string}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const IconCalibration = ({className = "h-6 w-6"}: {className?: string}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M12 6.343A5.657 5.657 0 0117.657 12 5.657 5.657 0 0112 17.657 5.657 5.657 0 016.343 12 5.657 5.657 0 0112 6.343z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.343V3m0 18v-3.343M17.657 12H21M3 12h3.343" /></svg>;
const IconInventory = ({className = "h-6 w-6"}: {className?: string}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>;
const IconCalendar = ({className = "h-6 w-6"}: {className?: string}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const IconReports = ({className = "h-6 w-6"}: {className?: string}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const IconEmail = ({className = "h-6 w-6"}: {className?: string}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const IconUsers = ({className = "h-6 w-6"}: {className?: string}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm6-11a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const IconSettings = ({className = "h-6 w-6"}: {className?: string}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const IconAuditLog = ({className = "h-6 w-6"}: {className?: string}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

export default DashboardPage;
