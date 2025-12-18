import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { EquipmentStatus, WorkOrderStatus, WorkOrderType } from '../components/layout/types';
import { useApp } from '../context/AppContext';

const ReportCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4 border-b dark:border-gray-700 pb-2">{title}</h2>
        {children}
    </div>
);

const ReportsPage: React.FC = () => {
    // FIX: Replaced useInventory and useTheme with useApp to resolve module errors.
    const { equipment, workOrders, theme, addLogEntry } = useApp();
    const tickColor = theme === 'dark' ? '#A0AEC0' : '#4A5568';
    const tooltipStyles = {
        contentStyle: { 
            backgroundColor: theme === 'dark' ? '#2D3748' : '#FFFFFF',
            border: theme === 'dark' ? '1px solid #4A5568' : '1px solid #E2E8F0',
        },
        labelStyle: { color: theme === 'dark' ? '#F7FAFC' : '#1A202C' }
    };

    const equipmentStatusData = useMemo(() => {
        const counts = equipment.reduce((acc, eq) => {
            acc[eq.status] = (acc[eq.status] || 0) + 1;
            return acc;
        }, {} as Record<EquipmentStatus, number>);

        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [equipment]);

    const workOrderByTypeData = useMemo(() => {
        const counts = workOrders.reduce((acc, wo) => {
            acc[wo.type] = (acc[wo.type] || 0) + 1;
            return acc;
        }, {} as Record<WorkOrderType, number>);
        
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [workOrders]);

    const workOrderByStatusData = useMemo(() => {
         const counts = workOrders.reduce((acc, wo) => {
            acc[wo.status] = (acc[wo.status] || 0) + 1;
            return acc;
        }, {} as Record<WorkOrderStatus, number>);
        
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [workOrders]);

    const overdueMaintenance = useMemo(() => {
        const today = new Date();
        return equipment.filter(eq => {
            const nextMaintDate = new Date(eq.nextMaintenanceDate);
            return nextMaintDate < today && eq.status !== EquipmentStatus.OUT_OF_SERVICE;
        });
    }, [equipment]);

    const handleExport = () => {
        addLogEntry('Exportó Resumen de Analítica (CSV)');
        let csvContent = "";

        // Section 1: Equipment Status
        csvContent += "Resumen General del Inventario\n";
        csvContent += "Estado,Cantidad de Equipos\n";
        equipmentStatusData.forEach(item => {
            csvContent += `${item.name},${item.value}\n`;
        });
        csvContent += "\n";

        // Section 2: Work Orders by Type
        csvContent += "Análisis de Órdenes de Trabajo (por Tipo)\n";
        csvContent += "Tipo,Cantidad de Órdenes\n";
        workOrderByTypeData.forEach(item => {
            csvContent += `${item.name},${item.value}\n`;
        });
        csvContent += "\n";

        // Section 3: Work Orders by Status
        csvContent += "Estado de Tareas de Mantenimiento\n";
        csvContent += "Estado,Cantidad de Órdenes\n";
        workOrderByStatusData.forEach(item => {
            csvContent += `${item.name},${item.value}\n`;
        });
        csvContent += "\n";
        
        // Section 4: Overdue Maintenance
        csvContent += "Equipos con Mantenimiento Preventivo Vencido\n";
        csvContent += "ID,Nombre,Ubicación,Fecha de Vencimiento\n";
        overdueMaintenance.forEach(eq => {
            csvContent += `"${eq.id}","${eq.name}","${eq.location}","${new Date(eq.nextMaintenanceDate).toLocaleDateString()}"\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'resumen_analitica_sigemed.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };


    const PIE_COLORS = {
        [EquipmentStatus.OPERATIONAL]: '#48BB78', // status-active
        [EquipmentStatus.IN_MAINTENANCE]: '#F6E05E', // status-maintenance
        [EquipmentStatus.OUT_OF_SERVICE]: '#F56565', // status-oos
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Reportes y Analítica</h1>
                <button 
                    onClick={handleExport}
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 flex items-center"
                >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Exportar Resumen
                </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Equipment Status Pie Chart */}
                <ReportCard title="Resumen General del Inventario">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={equipmentStatusData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={120}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                                {equipmentStatusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.name as EquipmentStatus]} />
                                ))}
                            </Pie>
                            <Tooltip {...tooltipStyles} formatter={(value) => [`${value} equipos`, 'Cantidad']} />
                            <Legend formatter={(value) => <span style={{ color: tickColor }}>{value}</span>} />
                        </PieChart>
                    </ResponsiveContainer>
                </ReportCard>
                
                 {/* Overdue Maintenance Table */}
                 <ReportCard title="Mantenimiento Preventivo Vencido">
                     <div className="overflow-y-auto h-[300px]">
                        {overdueMaintenance.length > 0 ? (
                            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700 sticky top-0">
                                    <tr>
                                        <th scope="col" className="px-4 py-2">Equipo</th>
                                        <th scope="col" className="px-4 py-2">Ubicación</th>
                                        <th scope="col" className="px-4 py-2">Fecha Venc.</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {overdueMaintenance.map(eq => (
                                        <tr key={eq.id} className="bg-white dark:bg-slate-800 border-b dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                                            <td className="px-4 py-2 font-medium text-gray-900 dark:text-gray-100"><Link to={`/inventory/${eq.id}`} className="text-brand-blue hover:underline">{eq.name}</Link></td>
                                            <td className="px-4 py-2">{eq.location}</td>
                                            <td className="px-4 py-2 font-semibold text-red-600">{new Date(eq.nextMaintenanceDate).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                             <div className="flex items-center justify-center h-full">
                                <p className="text-gray-500 dark:text-gray-400 text-center">¡Excelente! No hay equipos con mantenimiento preventivo vencido.</p>
                            </div>
                        )}
                     </div>
                </ReportCard>

                {/* Work Orders by Type */}
                <ReportCard title="Análisis de Órdenes de Trabajo (por Tipo)">
                     <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={workOrderByTypeData} layout="vertical" margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
                            <XAxis type="number" allowDecimals={false} tick={{ fill: tickColor }} />
                            <YAxis type="category" dataKey="name" width={120} tick={{ fill: tickColor }} />
                            <Tooltip {...tooltipStyles} cursor={{ fill: theme === 'dark' ? '#4A5568' : '#f7fafc' }} />
                            <Legend formatter={(value) => <span style={{ color: tickColor }}>{value}</span>} />
                            <Bar dataKey="value" name="Cantidad de Órdenes" fill="#3182CE" />
                        </BarChart>
                    </ResponsiveContainer>
                </ReportCard>

                {/* Work Orders by Status */}
                 <ReportCard title="Estado de Tareas de Mantenimiento">
                     <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={workOrderByStatusData} layout="vertical" margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
                           <XAxis type="number" allowDecimals={false} tick={{ fill: tickColor }}/>
                            <YAxis type="category" dataKey="name" width={120} tick={{ fill: tickColor }}/>
                            <Tooltip {...tooltipStyles} cursor={{ fill: theme === 'dark' ? '#4A5568' : '#f7fafc' }}/>
                            <Legend formatter={(value) => <span style={{ color: tickColor }}>{value}</span>} />
                            <Bar dataKey="value" name="Cantidad de Órdenes" fill="#4299E1" />
                        </BarChart>
                    </ResponsiveContainer>
                </ReportCard>

            </div>
        </div>
    );
};

export default ReportsPage;