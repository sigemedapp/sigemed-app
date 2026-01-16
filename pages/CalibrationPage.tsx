import React, { useState, useMemo } from 'react';
import { MOCK_USERS } from '../constants';
import { WorkOrder, WorkOrderStatus, WorkOrderType, Role, Equipment } from '../components/layout/types';
import { useApp } from '../context/AppContext';

const WorkOrderStatusBadge: React.FC<{ status: WorkOrderStatus }> = ({ status }) => {
    const baseClasses = "px-2 py-1 text-xs font-semibold leading-5 rounded-full";
    const statusClasses: Record<WorkOrderStatus, string> = {
        [WorkOrderStatus.REPORTED]: "bg-orange-100 text-orange-800",
        [WorkOrderStatus.OPEN]: "bg-blue-100 text-blue-800",
        [WorkOrderStatus.IN_PROGRESS]: "bg-yellow-100 text-yellow-800",
        [WorkOrderStatus.AWAITING_PART]: "bg-purple-100 text-purple-800",
        [WorkOrderStatus.CLOSED]: "bg-gray-100 text-gray-800",
        // Additional statuses
        [WorkOrderStatus.FAILURE]: "bg-red-100 text-red-800",
        [WorkOrderStatus.MAINTENANCE_REQUEST]: "bg-orange-100 text-orange-800",
        [WorkOrderStatus.EQUIPMENT_DEPARTURE]: "bg-indigo-100 text-indigo-800",
        [WorkOrderStatus.ON_LOAN]: "bg-purple-100 text-purple-800",
        [WorkOrderStatus.RETURNED_TO_SOURCE]: "bg-blue-100 text-blue-800",
        [WorkOrderStatus.FOR_DIAGNOSIS]: "bg-yellow-100 text-yellow-800",
        [WorkOrderStatus.EXTERNAL_PREVENTIVE]: "bg-teal-100 text-teal-800",
        [WorkOrderStatus.EXTERNAL_CORRECTIVE]: "bg-pink-100 text-pink-800",
        [WorkOrderStatus.OTHER_DEPARTURE]: "bg-gray-100 text-gray-800",
    };
    return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};

const CalibrationModal: React.FC<{
    workOrder: WorkOrder;
    onClose: () => void;
    updateWorkOrder: (wo: WorkOrder) => void;
    updateEquipment: (eq: Equipment) => void;
}> = ({ workOrder, onClose, updateWorkOrder, updateEquipment }) => {
    const { user, equipment: allEquipment, addLogEntry } = useApp();
    const equipment = allEquipment.find(e => e.id === workOrder.equipmentId);

    const [status, setStatus] = useState(workOrder.status);
    const [newHistoryAction, setNewHistoryAction] = useState('');
    const [certificateFile, setCertificateFile] = useState<File | null>(null);
    const [removeCertificate, setRemoveCertificate] = useState(false);

    const getUserName = (id: string) => MOCK_USERS.find(u => u.id === id)?.name || 'Desconocido';

    const handleUpdate = () => {
        if (!user || !equipment) return;

        let updatedWorkOrder = { ...workOrder, status };
        const updatedHistory = [...(workOrder.history || [])];
        const logDetails: string[] = [];

        if (workOrder.status !== status) {
            logDetails.push(`Estado de OT cambiado de '${workOrder.status}' a '${status}'.`);
        }

        if (newHistoryAction.trim()) {
            updatedHistory.push({ timestamp: new Date().toISOString(), userId: user.id, action: newHistoryAction.trim() });
        }

        if (removeCertificate) {
            updatedWorkOrder.calibrationCertificateUrl = undefined;
            updatedHistory.push({ timestamp: new Date().toISOString(), userId: user.id, action: `Certificado de calibración eliminado.` });
            logDetails.push('Certificado eliminado.');
        } else if (certificateFile) {
            updatedWorkOrder.calibrationCertificateUrl = `/docs/certs/${certificateFile.name}`;
            updatedHistory.push({ timestamp: new Date().toISOString(), userId: user.id, action: `Certificado de calibración '${certificateFile.name}' adjuntado.` });
            logDetails.push(`Certificado '${certificateFile.name}' adjuntado.`);
        }

        if (status === WorkOrderStatus.CLOSED && workOrder.status !== WorkOrderStatus.CLOSED) {
            const today = new Date();
            const nextYear = new Date(new Date().setFullYear(today.getFullYear() + 1));

            const updatedEquipment = {
                ...equipment,
                lastCalibrationDate: today.toISOString().split('T')[0],
                nextCalibrationDate: nextYear.toISOString().split('T')[0],
            };

            updatedHistory.push({ timestamp: new Date().toISOString(), userId: user.id, action: `Calibración completada. Próxima calibración programada para: ${updatedEquipment.nextCalibrationDate}.` });
            updateEquipment(updatedEquipment);
            logDetails.push(`Próxima calibración: ${updatedEquipment.nextCalibrationDate}.`);
        }

        updatedWorkOrder.history = updatedHistory;
        updateWorkOrder(updatedWorkOrder);

        if (logDetails.length > 0) {
            addLogEntry('Actualizó Orden de Calibración', `OT: ${workOrder.id}. ${logDetails.join(' ')}`);
        }

        onClose();
    };

    const handleExportToCSV = () => {
        if (!workOrder || !equipment) return;
        addLogEntry('Exportó Detalles de Calibración (CSV)', `OT: ${workOrder.id}`);
        let csvContent = "";
        csvContent += `Orden de Calibración,${workOrder.id}\n`;
        csvContent += `Equipo,${equipment.name} (N/S: ${equipment.serialNumber})\n\n`;

        const details = [
            ["ID de Orden", workOrder.id], ["Tipo", workOrder.type], ["Estado", workOrder.status],
            ["Fecha de Creación", new Date(workOrder.createdAt).toLocaleString()],
            ["Asignado a", workOrder.assignedTo ? getUserName(workOrder.assignedTo) : 'No asignado'],
            ["Descripción", `"${workOrder.description.replace(/"/g, '""')}"`],
            ["Certificado", workOrder.calibrationCertificateUrl || 'No adjuntado']
        ];
        csvContent += details.map(row => `"${row[0]}","${row[1]}"`).join('\n');
        csvContent += '\n\n';

        csvContent += "Historial de la Orden\n";
        csvContent += "Fecha,Usuario,Acción\n";
        if (workOrder.history) {
            [...workOrder.history].reverse().forEach(entry => {
                const row = [new Date(entry.timestamp).toLocaleString(), getUserName(entry.userId), `"${entry.action.replace(/"/g, '""')}"`];
                csvContent += row.join(',') + '\n';
            });
        }

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `Calibracion_${workOrder.id}_${equipment.name.replace(/\s+/g, '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-full overflow-y-auto">
                <div className="flex justify-between items-start">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Gestionar Calibración - {workOrder.id}</h2>
                    <div className="flex items-center space-x-2">
                        <button onClick={handleExportToCSV} className="p-2 rounded-full text-gray-500 hover:bg-gray-100" title="Exportar a CSV">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        </button>
                        <button onClick={onClose} className="text-2xl font-bold text-gray-500 hover:text-gray-800">&times;</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-gray-900">
                    <div><p><strong>Equipo:</strong> {equipment?.name}</p></div>
                    <div><p><strong>N/S:</strong> {equipment?.serialNumber}</p></div>
                    <div><p><strong>Estado Actual:</strong> <WorkOrderStatusBadge status={workOrder.status} /></p></div>
                    <div><p><strong>Asignado a:</strong> {getUserName(workOrder.assignedTo || '')}</p></div>
                    <div className="md:col-span-2"><p><strong>Descripción:</strong> {workOrder.description}</p></div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                    <h3 className="font-semibold text-lg text-gray-800">Actualizar Tarea</h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Cambiar Estado</label>
                        <select value={status} onChange={e => setStatus(e.target.value as WorkOrderStatus)} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md">
                            {[WorkOrderStatus.OPEN, WorkOrderStatus.IN_PROGRESS, WorkOrderStatus.CLOSED].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Certificado de Calibración (PDF)</label>
                        <input type="file" onChange={e => { setCertificateFile(e.target.files ? e.target.files[0] : null); setRemoveCertificate(false); }} accept=".pdf" className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-brand-blue hover:file:bg-blue-100" />
                        {workOrder.calibrationCertificateUrl && (
                            <div className="mt-2">
                                <p className="text-xs text-gray-500">
                                    Certificado actual: <a href={workOrder.calibrationCertificateUrl} target="_blank" rel="noopener noreferrer" className="text-brand-blue underline">{workOrder.calibrationCertificateUrl.split('/').pop()}</a>
                                </p>
                                <div className="flex items-center mt-1">
                                    <input id="remove-cert" type="checkbox" checked={removeCertificate} onChange={e => { setRemoveCertificate(e.target.checked); if (e.target.checked) setCertificateFile(null); }} className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500" />
                                    <label htmlFor="remove-cert" className="ml-2 block text-sm text-red-600 font-medium">Quitar certificado actual</label>
                                </div>
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Agregar Nota al Historial</label>
                        <textarea value={newHistoryAction} onChange={e => setNewHistoryAction(e.target.value)} rows={3} className="w-full mt-1 p-2 border border-gray-300 rounded-md" placeholder="Ej: Se utilizaron patrones de prueba X y Y."></textarea>
                    </div>
                    <div className="text-right">
                        <button onClick={handleUpdate} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">Guardar Actualización</button>
                    </div>
                </div>

                <div className="mt-6">
                    <h3 className="font-semibold text-lg mb-3 text-gray-800">Historial</h3>
                    <div className="border rounded-lg max-h-48 overflow-y-auto">
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


const CalibrationPage: React.FC = () => {
    const { equipment, workOrders, updateEquipment, updateWorkOrder } = useApp();
    const [statusFilter, setStatusFilter] = useState<WorkOrderStatus | 'ALL'>('ALL');
    const [selectedWO, setSelectedWO] = useState<WorkOrder | null>(null);

    const calibrationWorkOrders = useMemo(() => {
        let filtered = workOrders.filter(wo => wo.type === WorkOrderType.CALIBRATION);
        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(wo => wo.status === statusFilter);
        }
        return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [statusFilter, workOrders]);

    const pastCalibrationsByEquipment = useMemo(() => {
        const closedCalibrations = workOrders.filter(
            wo => wo.type === WorkOrderType.CALIBRATION && wo.status === WorkOrderStatus.CLOSED
        );

        return closedCalibrations.reduce((acc, wo) => {
            const eqId = wo.equipmentId;
            if (!acc[eqId]) acc[eqId] = [];
            acc[eqId].push(wo);
            return acc;
        }, {} as Record<string, WorkOrder[]>);
    }, [workOrders]);

    const getEquipment = (id: string): Equipment | undefined => equipment.find(e => e.id === id);
    const getUserName = (id?: string) => id ? MOCK_USERS.find(u => u.id === id)?.name : 'N/A';

    return (
        <div>
            {selectedWO && <CalibrationModal workOrder={selectedWO} onClose={() => setSelectedWO(null)} updateWorkOrder={updateWorkOrder} updateEquipment={updateEquipment} />}

            <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestión de Calibración</h1>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3">
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-blue focus:border-brand-blue dark:bg-slate-700 dark:border-gray-600" value={statusFilter} onChange={e => setStatusFilter(e.target.value as WorkOrderStatus | 'ALL')} >
                        <option value="ALL">Todos los Estados</option>
                        {Object.values(WorkOrderStatus).map(status => (<option key={status} value={status}>{status}</option>))}
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full whitespace-nowrap">
                    <thead>
                        <tr className="text-left font-bold bg-gray-50 dark:bg-slate-700 border-b dark:border-gray-600 text-gray-800 dark:text-gray-300">
                            <th className="px-6 py-3">Equipo</th>
                            <th className="px-6 py-3">N/S</th>
                            <th className="px-6 py-3">Próx. Calibración</th>
                            <th className="px-6 py-3">Estado de Tarea</th>
                            <th className="px-6 py-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-900 dark:text-gray-200">
                        {calibrationWorkOrders.map(wo => {
                            const equipmentItem = getEquipment(wo.equipmentId);
                            const nextDate = equipmentItem?.nextCalibrationDate ? new Date(equipmentItem.nextCalibrationDate) : null;
                            const isOverdue = nextDate && nextDate < new Date();
                            return (
                                <tr key={wo.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                    <td className="px-6 py-4 font-medium">{equipmentItem?.name || 'Desconocido'}</td>
                                    <td className="px-6 py-4">{equipmentItem?.serialNumber}</td>
                                    <td className={`px-6 py-4 font-semibold ${isOverdue ? 'text-red-600' : ''}`}>{nextDate ? nextDate.toLocaleDateString() : 'N/A'}</td>
                                    <td className="px-6 py-4"><WorkOrderStatusBadge status={wo.status} /></td>
                                    <td className="px-6 py-4"><button onClick={() => setSelectedWO(wo)} className="text-brand-blue hover:underline">Ver / Gestionar</button></td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                {calibrationWorkOrders.length === 0 && (<p className="text-center py-8 text-gray-500 dark:text-gray-400">No se encontraron tareas de calibración con los filtros seleccionados.</p>)}
            </div>

            <div className="mt-12">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Historial de Calibraciones Anteriores</h2>
                <div className="space-y-6">
                    {Object.keys(pastCalibrationsByEquipment).length > 0 ? (
                        Object.entries(pastCalibrationsByEquipment).map(([equipmentId, calibrations]) => {
                            const equipmentItem = getEquipment(equipmentId);
                            if (!equipmentItem) return null;
                            return (
                                <div key={equipmentId} className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4">
                                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{equipmentItem.name} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">(N/S: {equipmentItem.serialNumber})</span></h3>
                                    <div className="mt-4 overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="text-left bg-gray-50 dark:bg-slate-700">
                                                <tr>
                                                    <th className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300">Fecha</th>
                                                    <th className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300">Técnico</th>
                                                    <th className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300">Certificado</th>
                                                    <th className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300">Orden ID</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {/* FIX: Cast 'calibrations' to WorkOrder[] to resolve TypeScript error from Object.entries. */}
                                                {(calibrations as WorkOrder[]).map(wo => (
                                                    <tr key={wo.id}>
                                                        <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{new Date(wo.createdAt).toLocaleDateString()}</td>
                                                        <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{getUserName(wo.assignedTo)}</td>
                                                        <td className="px-4 py-2">
                                                            {wo.calibrationCertificateUrl ? (<a href={wo.calibrationCertificateUrl} target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline">Ver Certificado</a>) : (<span className="text-gray-400">N/A</span>)}
                                                        </td>
                                                        <td className="px-4 py-2 text-gray-500 dark:text-gray-400 font-mono">{wo.id}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 text-center">
                            <p className="text-gray-500 dark:text-gray-400">No hay registros de calibraciones completadas.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CalibrationPage;