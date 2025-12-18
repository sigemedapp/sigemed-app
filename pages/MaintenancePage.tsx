import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
// FIX: Corrected import paths for constants and types to be relative.
import { MOCK_USERS } from '../constants';
import { WorkOrder, WorkOrderStatus, WorkOrderType, Role, User, EquipmentStatus, Equipment } from '../components/layout/types';

const WorkOrderStatusBadge: React.FC<{ status: WorkOrderStatus }> = ({ status }) => {
    const baseClasses = "px-2 py-1 text-xs font-semibold leading-5 rounded-full";
    const statusClasses: Record<WorkOrderStatus, string> = {
        [WorkOrderStatus.REPORTED]: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300",
        [WorkOrderStatus.OPEN]: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
        [WorkOrderStatus.IN_PROGRESS]: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
        [WorkOrderStatus.AWAITING_PART]: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300",
        [WorkOrderStatus.CLOSED]: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    };
    return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};

const WorkOrderModal: React.FC<{
    workOrder: WorkOrder;
    onClose: () => void;
    updateWorkOrder: (wo: WorkOrder) => void;
    updateEquipment: (eq: Equipment) => void;
}> = ({ workOrder, onClose, updateWorkOrder, updateEquipment }) => {
    // FIX: Replaced context hooks with useApp to resolve module errors.
    const { user, equipment: allEquipment, sendEmail, addLogEntry } = useApp();
    const equipment = allEquipment.find(e => e.id === workOrder.equipmentId);
    
    // Local state for updates
    const [status, setStatus] = useState(workOrder.status);
    const [assignedTo, setAssignedTo] = useState(workOrder.assignedTo || '');
    const [partsNeeded, setPartsNeeded] = useState(workOrder.partsNeeded || '');
    const [estimatedRepairDate, setEstimatedRepairDate] = useState(workOrder.estimatedRepairDate || '');
    const [newHistoryAction, setNewHistoryAction] = useState('');
    const [equipmentStatus, setEquipmentStatus] = useState(equipment?.status || EquipmentStatus.OPERATIONAL);

    const technicians = MOCK_USERS.filter(u => u.role === Role.BIOMEDICAL_ENGINEER || u.role === Role.SYSTEM_ADMIN);

    const getUserName = (id: string) => MOCK_USERS.find(u => u.id === id)?.name || 'Desconocido';

    const canAssign = user && (user.role === Role.SUPER_ADMIN || user.role === Role.SYSTEM_ADMIN) && workOrder.status === WorkOrderStatus.REPORTED;
    const canUpdate = user && user.id === workOrder.assignedTo && workOrder.status !== WorkOrderStatus.CLOSED;

    const handleAssignment = () => {
        if (!user || !assignedTo || !equipment) return;
        
        const technicianName = getUserName(assignedTo);
        const updatedHistory = [
           ...(workOrder.history || []),
           { timestamp: new Date().toISOString(), userId: user.id, action: `Asignado a ${technicianName}.` },
           { timestamp: new Date().toISOString(), userId: user.id, action: `Estado del equipo actualizado a '${EquipmentStatus.IN_MAINTENANCE}'.` }
        ];

        const updatedWorkOrder: WorkOrder = {
           ...workOrder,
           assignedTo,
           status: WorkOrderStatus.OPEN,
           history: updatedHistory
        };
        updateWorkOrder(updatedWorkOrder);

        const updatedEquipment: Equipment = { ...equipment, status: EquipmentStatus.IN_MAINTENANCE };
        updateEquipment(updatedEquipment);
        
        addLogEntry('Asignó Orden de Trabajo', `OT: ${workOrder.id} a ${technicianName}`);
        
        // Simulate sending an email
        sendEmail({
            to: assignedTo,
            from: user.name,
            subject: `Nueva Tarea Asignada: OT ${workOrder.id} para ${equipment.name}`,
            body: `
                <p>Hola ${technicianName},</p>
                <p>Se te ha asignado una nueva orden de trabajo con los siguientes detalles:</p>
                <ul>
                    <li><strong>ID de Orden:</strong> ${workOrder.id}</li>
                    <li><strong>Equipo:</strong> ${equipment.name} (N/S: ${equipment.serialNumber})</li>
                    <li><strong>Ubicación:</strong> ${equipment.location}</li>
                    <li><strong>Descripción del Reporte:</strong> ${workOrder.description}</li>
                </ul>
                <p>Por favor, revisa la orden en el sistema para más detalles.</p>
                <p>Saludos,</p>
                <p>${user.name}</p>
            `
        });

        onClose();
    };
    
    const handleUpdate = () => {
        if (!user || !equipment) return;
        
        const updatedHistory = [...(workOrder.history || [])];
        const logDetails: string[] = [];

        if (workOrder.status !== status) {
            updatedHistory.push({ timestamp: new Date().toISOString(), userId: user.id, action: `Estado de la orden cambiado a: ${status}.` });
            logDetails.push(`Estado de OT cambiado de '${workOrder.status}' a '${status}'.`);
        }

        let finalEquipmentStatus = equipmentStatus;
        if (status === WorkOrderStatus.CLOSED) {
            if (equipment.status !== EquipmentStatus.OPERATIONAL) {
                finalEquipmentStatus = EquipmentStatus.OPERATIONAL;
                updatedHistory.push({ timestamp: new Date().toISOString(), userId: user.id, action: `Equipo marcado como '${EquipmentStatus.OPERATIONAL}'.` });
                logDetails.push(`Estado de equipo cambiado a '${EquipmentStatus.OPERATIONAL}'.`);
            }
        } else {
            if (equipment.status !== equipmentStatus) {
                updatedHistory.push({ timestamp: new Date().toISOString(), userId: user.id, action: `Estado del equipo cambiado a: '${equipmentStatus}'.` });
                logDetails.push(`Estado de equipo cambiado de '${equipment.status}' a '${equipmentStatus}'.`);
            }
        }

        if (newHistoryAction.trim()) {
            updatedHistory.push({ timestamp: new Date().toISOString(), userId: user.id, action: newHistoryAction.trim() });
        }

        const updatedWorkOrder: WorkOrder = {
            ...workOrder,
            status,
            partsNeeded,
            estimatedRepairDate,
            history: updatedHistory
        };
        updateWorkOrder(updatedWorkOrder);

        if (equipment.status !== finalEquipmentStatus) {
            updateEquipment({ ...equipment, status: finalEquipmentStatus });
        }
        
        if (logDetails.length > 0) {
            addLogEntry('Actualizó Orden de Trabajo', `OT: ${workOrder.id}. Detalles: ${logDetails.join(' ')}`);
        }
        
        onClose();
    };
    
    const handleExportToCSV = () => {
        if (!workOrder || !equipment) return;
        addLogEntry('Exportó Detalles de OT (CSV)', `OT: ${workOrder.id}`);
        let csvContent = "";

        // Header
        csvContent += `Orden de Trabajo,${workOrder.id}\n`;
        csvContent += `Equipo,${equipment.name} (N/S: ${equipment.serialNumber})\n\n`;

        // Details
        const details = [
            ["ID de Orden", workOrder.id],
            ["Tipo", workOrder.type],
            ["Estado", workOrder.status],
            ["Fecha de Creación", new Date(workOrder.createdAt).toLocaleString()],
            ["Asignado a", workOrder.assignedTo ? getUserName(workOrder.assignedTo) : 'No asignado'],
            ["Reportado por", workOrder.reportedBy ? getUserName(workOrder.reportedBy) : 'N/A'],
            ["Descripción", `"${workOrder.description.replace(/"/g, '""')}"`],
        ];
        csvContent += details.map(row => `"${row[0]}","${row[1]}"`).join('\n');
        csvContent += '\n\n';
        
        // History
        csvContent += "Historial de la Orden\n";
        csvContent += "Fecha,Usuario,Acción\n";
        if (workOrder.history) {
            [...workOrder.history].reverse().forEach(entry => {
                const row = [
                    new Date(entry.timestamp).toLocaleString(),
                    getUserName(entry.userId),
                    `"${entry.action.replace(/"/g, '""')}"`
                ];
                csvContent += row.join(',') + '\n';
            });
        }
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `OT_${workOrder.id}_${equipment.name.replace(/\s+/g, '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl max-h-full overflow-y-auto">
                <div className="flex justify-between items-start">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Detalle Orden de Trabajo - {workOrder.id}</h2>
                     <div className="flex items-center space-x-2">
                        <button onClick={handleExportToCSV} className="p-2 rounded-full text-gray-500 hover:bg-gray-100" title="Exportar a CSV">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        </button>
                        <button onClick={onClose} className="text-2xl font-bold text-gray-500 hover:text-gray-800">&times;</button>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-gray-900">
                    <div><p><strong>Equipo:</strong> {equipment?.name}</p></div>
                    <div><p><strong>Estado Actual:</strong> <WorkOrderStatusBadge status={workOrder.status} /></p></div>
                    <div><p><strong>Tipo:</strong> {workOrder.type}</p></div>
                    <div><p><strong>Fecha de Creación:</strong> {new Date(workOrder.createdAt).toLocaleDateString()}</p></div>
                    <div className="md:col-span-2"><p><strong>Descripción:</strong> {workOrder.description}</p></div>
                    {workOrder.reportedBy && <div><p><strong>Reportado por:</strong> {getUserName(workOrder.reportedBy)}</p></div>}
                    {workOrder.assignedTo && <div><p><strong>Asignado a:</strong> {getUserName(workOrder.assignedTo)}</p></div>}
                </div>

                {/* --- Management Section --- */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-3 text-gray-800">Gestionar Orden</h3>
                    {canAssign && (
                        <div className="flex items-center space-x-3">
                            <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                                <option value="" disabled>Seleccionar técnico...</option>
                                {technicians.map(t => <option key={t.id} value={t.id}>{t.name} ({t.role})</option>)}
                            </select>
                            <button onClick={handleAssignment} className="bg-brand-blue text-white px-4 py-2 rounded-md hover:bg-brand-blue-dark whitespace-nowrap">Asignar Tarea</button>
                        </div>
                    )}
                    {canUpdate && (
                         <div className="space-y-4">
                             <div>
                                 <label className="block text-sm font-medium text-gray-700">Cambiar Estado de la Orden</label>
                                 <select value={status} onChange={e => setStatus(e.target.value as WorkOrderStatus)} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md">
                                    {Object.values(WorkOrderStatus).filter(s => s !== WorkOrderStatus.REPORTED).map(s => <option key={s} value={s}>{s}</option>)}
                                 </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Actualizar Estado del Equipo</label>
                                <select 
                                    value={equipmentStatus} 
                                    onChange={e => setEquipmentStatus(e.target.value as EquipmentStatus)} 
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                                    disabled={status === WorkOrderStatus.CLOSED}
                                >
                                    <option value={EquipmentStatus.IN_MAINTENANCE}>{EquipmentStatus.IN_MAINTENANCE}</option>
                                    <option value={EquipmentStatus.OUT_OF_SERVICE}>{EquipmentStatus.OUT_OF_SERVICE}</option>
                                </select>
                                {status === WorkOrderStatus.CLOSED && <p className="text-xs text-gray-500 mt-1">Al cerrar la orden, el equipo se marcará como '{EquipmentStatus.OPERATIONAL}'.</p>}
                            </div>
                            <div>
                                 <label className="block text-sm font-medium text-gray-700">Refacciones Necesarias (Opcional)</label>
                                 <input type="text" value={partsNeeded} onChange={e => setPartsNeeded(e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md" placeholder="Ej: Batería modelo X, Sensor SpO2"/>
                            </div>
                             <div>
                                 <label className="block text-sm font-medium text-gray-700">Fecha Estimada de Reparación (Opcional)</label>
                                 <input type="date" value={estimatedRepairDate} onChange={e => setEstimatedRepairDate(e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"/>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Agregar Actualización al Historial</label>
                                <textarea value={newHistoryAction} onChange={e => setNewHistoryAction(e.target.value)} rows={3} className="w-full mt-1 p-2 border border-gray-300 rounded-md" placeholder="Ej: Se realizó diagnóstico, se solicita pieza de recambio."></textarea>
                            </div>
                             <div className="text-right">
                                <button onClick={handleUpdate} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">Guardar Actualización</button>
                            </div>
                         </div>
                    )}
                    {!canAssign && !canUpdate && <p className="text-gray-500 text-sm">No tiene permisos para modificar esta orden en su estado actual.</p>}
                </div>

                {/* --- History Section --- */}
                <div className="mt-6">
                    <h3 className="font-semibold text-lg mb-3 text-gray-800">Historial de la Orden</h3>
                    <div className="border rounded-lg max-h-60 overflow-y-auto">
                        {workOrder.history && workOrder.history.length > 0 ? (
                             <ul className="divide-y">
                                {[...workOrder.history].reverse().map(entry => (
                                     <li key={entry.timestamp} className="p-3">
                                        <p className="text-sm text-gray-800">{entry.action}</p>
                                        <p className="text-xs text-gray-500">Por: {getUserName(entry.userId)} - {new Date(entry.timestamp).toLocaleString()}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="p-3 text-gray-500">No hay historial para esta orden.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


const MaintenancePage: React.FC = () => {
    const { equipment, workOrders, updateEquipment, updateWorkOrder } = useApp();
    const [statusFilter, setStatusFilter] = useState<WorkOrderStatus | 'ALL'>('ALL');
    const [typeFilter, setTypeFilter] = useState<WorkOrderType | 'ALL'>('ALL');
    const [selectedWO, setSelectedWO] = useState<WorkOrder | null>(null);

    const filteredWorkOrders = useMemo(() => {
        let filtered = workOrders;
        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(wo => wo.status === statusFilter);
        }
        if (typeFilter !== 'ALL') {
            filtered = filtered.filter(wo => wo.type === typeFilter);
        }
        return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [statusFilter, typeFilter, workOrders]);

    const getEquipmentName = (id: string) => equipment.find(e => e.id === id)?.name || 'Desconocido';
    const getTechnicianName = (id?: string) => id ? MOCK_USERS.find(u => u.id === id)?.name : 'No asignado';
    
    return (
        <div>
            {selectedWO && <WorkOrderModal 
                workOrder={selectedWO} 
                onClose={() => setSelectedWO(null)} 
                updateWorkOrder={updateWorkOrder}
                updateEquipment={updateEquipment}
            />}
            
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">Órdenes de Trabajo</h1>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-blue focus:border-brand-blue dark:bg-slate-700 dark:border-gray-600 dark:text-gray-200"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value as WorkOrderStatus | 'ALL')}
                    >
                        <option value="ALL">Todos los Estados</option>
                        {Object.values(WorkOrderStatus).map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                     <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-blue focus:border-brand-blue dark:bg-slate-700 dark:border-gray-600 dark:text-gray-200"
                        value={typeFilter}
                        onChange={e => setTypeFilter(e.target.value as WorkOrderType | 'ALL')}
                    >
                        <option value="ALL">Todos los Tipos</option>
                        {Object.values(WorkOrderType).map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full whitespace-nowrap">
                    <thead className="text-left font-bold bg-gray-50 dark:bg-slate-700 border-b dark:border-gray-700 text-gray-800 dark:text-gray-300">
                        <tr>
                            <th className="px-6 py-3">ID</th>
                            <th className="px-6 py-3">Equipo</th>
                            <th className="px-6 py-3">Tipo</th>
                            <th className="px-6 py-3">Descripción</th>
                            <th className="px-6 py-3">Asignado a</th>
                            <th className="px-6 py-3">Estado</th>
                            <th className="px-6 py-3">Creada</th>
                             <th className="px-6 py-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-700 text-gray-900 dark:text-gray-200">
                        {filteredWorkOrders.map(wo => (
                            <tr key={wo.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                <td className="px-6 py-4 font-mono text-sm">{wo.id}</td>
                                <td className="px-6 py-4">{getEquipmentName(wo.equipmentId)}</td>
                                <td className="px-6 py-4">{wo.type}</td>
                                <td className="px-6 py-4 max-w-sm truncate" title={wo.description}>{wo.description}</td>
                                <td className="px-6 py-4">{getTechnicianName(wo.assignedTo)}</td>
                                <td className="px-6 py-4"><WorkOrderStatusBadge status={wo.status} /></td>
                                <td className="px-6 py-4">{new Date(wo.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4">
                                    <button onClick={() => setSelectedWO(wo)} className="text-brand-blue hover:underline">
                                        Ver / Gestionar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredWorkOrders.length === 0 && (
                    <p className="text-center py-8 text-gray-500 dark:text-gray-400">No se encontraron órdenes de trabajo con los filtros seleccionados.</p>
                )}
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {filteredWorkOrders.map(wo => (
                    <div key={wo.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 space-y-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-gray-800 dark:text-gray-100">{getEquipmentName(wo.equipmentId)}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{wo.id} - {wo.type}</p>
                            </div>
                            <WorkOrderStatusBadge status={wo.status} />
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{wo.description}</p>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            <p><strong>Asignado a:</strong> {getTechnicianName(wo.assignedTo)}</p>
                            <p><strong>Creada:</strong> {new Date(wo.createdAt).toLocaleDateString()}</p>
                        </div>
                         <div className="border-t dark:border-gray-700 pt-3 text-right">
                            <button onClick={() => setSelectedWO(wo)} className="text-brand-blue font-semibold hover:underline">
                                Ver / Gestionar &rarr;
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MaintenancePage;