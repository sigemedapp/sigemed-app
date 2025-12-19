import React, { useState, useMemo } from 'react';
import { Equipment, WorkOrder, WorkOrderType, WorkOrderStatus, Role } from '../components/layout/types';
import { useApp } from '../context/AppContext';
import { MOCK_USERS } from '../constants';

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const getMaintenanceSchedule = (equipment: Equipment, year: number): { month: number, type: 'MP1' | 'MP2' }[] => {
    const schedule = [];
    if (!equipment.nextMaintenanceDate || !equipment.lastMaintenanceDate) return [];

    const nextMaintDate = new Date(equipment.nextMaintenanceDate);
    const lastMaintDate = new Date(equipment.lastMaintenanceDate);

    if (isNaN(nextMaintDate.getTime()) || isNaN(lastMaintDate.getTime())) return [];

    const diffMonths = (nextMaintDate.getFullYear() - lastMaintDate.getFullYear()) * 12 + (nextMaintDate.getMonth() - lastMaintDate.getMonth());

    const isSemiAnnual = diffMonths <= 7;

    if (isSemiAnnual) {
        let firstMaintMonth = lastMaintDate.getMonth();
        let secondMaintMonth = nextMaintDate.getMonth();

        if (new Date(year, firstMaintMonth) < lastMaintDate) {
            firstMaintMonth = (firstMaintMonth + 6) % 12;
        }
        if (new Date(year, secondMaintMonth) < lastMaintDate) {
            secondMaintMonth = (secondMaintMonth + 6) % 12;
        }

        if (firstMaintMonth === secondMaintMonth) secondMaintMonth = (firstMaintMonth + 6) % 12;

        const sortedMonths = [firstMaintMonth, secondMaintMonth].sort((a, b) => a - b);

        schedule.push({ month: sortedMonths[0], type: 'MP1' });
        schedule.push({ month: sortedMonths[1], type: 'MP2' });
    } else { // Annual
        schedule.push({ month: nextMaintDate.getMonth(), type: 'MP1' });
    }

    return schedule;
};

const StatusBadge: React.FC<{ status: { text: string; color: string } }> = ({ status }) => {
    const colorClasses: Record<string, string> = {
        red: 'bg-red-100 text-red-800',
        green: 'bg-green-100 text-green-800',
        blue: 'bg-blue-100 text-blue-800',
        default: 'bg-gray-100 text-gray-800'
    };
    return (
        <span className={`px-2 py-1 text-xs font-semibold leading-5 rounded-full ${colorClasses[status.color]}`}>
            {status.text}
        </span>
    );
};

interface MaintenanceStatusInfo {
    text: string;
    color: 'green' | 'red' | 'blue' | 'default';
}


const LogMaintenanceModal: React.FC<{
    equipment: Equipment;
    year: number;
    schedule: { month: number, type: 'MP1' | 'MP2' }[];
    completedWOs: WorkOrder[];
    onClose: () => void;
    onSave: (data: {
        maintenanceType: 'MP1' | 'MP2',
        completionDate: string,
        technicianId: string,
        summary: string,
        evidenceFile?: File
    }) => void;
}> = ({ equipment, year, schedule, completedWOs, onClose, onSave }) => {
    const { user } = useApp();

    const getInitialMaintType = () => {
        const isMP1Done = completedWOs.length >= 1;
        if (isMP1Done && schedule.length > 1) return 'MP2';
        return 'MP1';
    };

    const [maintenanceType, setMaintenanceType] = useState<'MP1' | 'MP2'>(getInitialMaintType());
    const [completionDate, setCompletionDate] = useState(new Date().toISOString().split('T')[0]);
    const [technicianId, setTechnicianId] = useState(user?.id || '');
    const [summary, setSummary] = useState('');
    const [evidenceFile, setEvidenceFile] = useState<File | undefined>();

    const technicians = MOCK_USERS.filter(u => [Role.BIOMEDICAL_ENGINEER, Role.SYSTEM_ADMIN, Role.SUPER_ADMIN].includes(u.role));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!summary.trim() || !technicianId) {
            alert('Por favor, complete el resumen de actividades y seleccione un técnico.');
            return;
        }
        onSave({ maintenanceType, completionDate, technicianId, summary, evidenceFile });
    };

    const isMP1Done = completedWOs.length >= 1;
    const isMP2Done = completedWOs.length >= 2;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Registrar Mantenimiento Realizado</h2>
                <p className="mb-4 text-gray-600">Equipo: <span className="font-semibold">{equipment.name} (N/S: {equipment.serialNumber})</span></p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tipo de Mantenimiento</label>
                        <select
                            value={maintenanceType}
                            onChange={e => setMaintenanceType(e.target.value as 'MP1' | 'MP2')}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                        >
                            <option value="MP1" disabled={isMP1Done}>Primer Mantenimiento</option>
                            {schedule.length > 1 && <option value="MP2" disabled={isMP2Done}>Segundo Mantenimiento</option>}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Fecha de Realización</label>
                        <input type="date" value={completionDate} onChange={e => setCompletionDate(e.target.value)} required className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Realizado por</label>
                        <select value={technicianId} onChange={e => setTechnicianId(e.target.value)} required className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md">
                            <option value="" disabled>Seleccione un técnico...</option>
                            {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Resumen de Actividades</label>
                        <textarea value={summary} onChange={e => setSummary(e.target.value)} required rows={4} className="w-full mt-1 p-2 border border-gray-300 rounded-md" placeholder="Ej: Se realizó limpieza, cambio de filtros y calibración de sensores..."></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Cargar Evidencia (Opcional)</label>
                        <input type="file" onChange={e => setEvidenceFile(e.target.files?.[0])} accept=".pdf,.jpg,.png" className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-brand-blue hover:file:bg-blue-100" />
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Cancelar</button>
                        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">Guardar Registro</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const AnnualReportPage: React.FC = () => {
    const { user, equipment, workOrders, addWorkOrder, updateEquipment, addLogEntry, isLoading } = useApp();
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [isExporting, setIsExporting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
    const [notification, setNotification] = useState('');

    const initialFilters = {
        lastMaintFrom: '',
        lastMaintTo: '',
        nextMaintFrom: '',
        nextMaintTo: '',
    };
    const [filters, setFilters] = useState(initialFilters);

    // ... (handlers)

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
            </div>
        );
    }

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        setFilters(initialFilters);
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedYear(parseInt(e.target.value, 10));
    };

    const handleOpenModal = (equipment: Equipment) => {
        setSelectedEquipment(equipment);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedEquipment(null);
        setIsModalOpen(false);
    };

    const handleSaveMaintenance = (data: {
        maintenanceType: 'MP1' | 'MP2',
        completionDate: string,
        technicianId: string,
        summary: string,
        evidenceFile?: File
    }) => {
        if (!selectedEquipment || !user) return;

        const newWorkOrder: WorkOrder = {
            id: `wo-${Date.now()}`,
            equipmentId: selectedEquipment.id,
            type: WorkOrderType.PREVENTIVE,
            description: `[${data.maintenanceType}] ${data.summary}`,
            assignedTo: data.technicianId,
            status: WorkOrderStatus.CLOSED,
            createdAt: data.completionDate,
            history: [
                {
                    timestamp: new Date().toISOString(),
                    userId: user.id,
                    action: `Mantenimiento preventivo registrado y cerrado por ${user.name}.`
                },
                {
                    timestamp: new Date(data.completionDate).toISOString(),
                    userId: data.technicianId,
                    action: data.summary,
                }
            ],
        };
        if (data.evidenceFile) {
            newWorkOrder.history.push({
                timestamp: new Date().toISOString(),
                userId: user.id,
                action: `Archivo de evidencia '${data.evidenceFile.name}' adjuntado.`
            });
        }
        addWorkOrder(newWorkOrder);

        const lastMaintDate = new Date(selectedEquipment.lastMaintenanceDate);
        const diffMonths = (new Date(selectedEquipment.nextMaintenanceDate).getFullYear() - lastMaintDate.getFullYear()) * 12 + (new Date(selectedEquipment.nextMaintenanceDate).getMonth() - lastMaintDate.getMonth());
        const isSemiAnnual = diffMonths <= 7;
        const monthsToAdd = isSemiAnnual ? 6 : 12;

        const nextMaintDate = new Date(data.completionDate);
        nextMaintDate.setMonth(nextMaintDate.getMonth() + monthsToAdd);

        const updatedEquipment: Equipment = {
            ...selectedEquipment,
            lastMaintenanceDate: data.completionDate,
            nextMaintenanceDate: nextMaintDate.toISOString().split('T')[0],
        };
        updateEquipment(updatedEquipment);

        handleCloseModal();
        setNotification(`Mantenimiento para ${selectedEquipment.name} registrado con éxito.`);
        setTimeout(() => setNotification(''), 4000);
    };

    const handleExportPDF = async () => {
        setIsExporting(true);
        addLogEntry('Exportó Calendario Anual de Mantenimiento (PDF)', `Año: ${selectedYear}`);
        try {
            const { jsPDF } = (window as any).jspdf;
            const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text(`Calendario Anual de Mantenimiento Preventivo - ${selectedYear}`, 14, 20);

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Fecha de Exportación: ${new Date().toLocaleString('es-MX')}`, 283, 25, { align: 'right' });

            const head = [[
                'Inv.', 'Área', 'Equipo', 'Marca', 'Modelo', 'N. Serie',
                ...MONTHS,
                'Primer Mantenimiento', 'Segundo Mantenimiento', 'Status'
            ]];

            const body = reportData.map(row => [
                row.inventoryNumber,
                row.area,
                row.equipmentName,
                row.brand,
                row.model,
                row.serialNumber,
                ...row.monthlyData,
                row.firstMaintenance.text,
                row.secondMaintenance.text,
                row.status.text,
            ]);

            (doc as any).autoTable({
                head: head,
                body: body,
                startY: 35,
                theme: 'grid',
                styles: {
                    fontSize: 6.5,
                    cellPadding: 1.5,
                    valign: 'middle',
                },
                headStyles: {
                    fillColor: '#0369A1',
                    textColor: 255,
                    fontSize: 7,
                    halign: 'center',
                },
                columnStyles: {
                    0: { cellWidth: 10, halign: 'center' },
                    2: { cellWidth: 35 },
                    5: { cellWidth: 20 },
                    18: { cellWidth: 20, halign: 'center' },
                    19: { cellWidth: 20, halign: 'center' },
                    20: { cellWidth: 18, halign: 'center' },
                },
                didDrawCell: (data: any) => {
                    const text = data.cell.text[0];
                    const isMonthColumn = data.column.index >= 6 && data.column.index <= 17;

                    const isFirstMaintCol = data.column.index === 18;
                    const isSecondMaintCol = data.column.index === 19;
                    const isStatusColumn = data.column.index === 20;

                    const currentRowData = reportData[data.row.index];

                    if (isMonthColumn) {
                        let fillColor;
                        if (text === 'MP1') fillColor = [220, 53, 69];
                        if (text === 'MP2') fillColor = [0, 123, 255];

                        if (fillColor) {
                            doc.setFillColor(...fillColor);
                            doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
                            doc.setTextColor(255);
                            doc.text(text, data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2, { halign: 'center', valign: 'middle' });
                        }
                    }

                    if (currentRowData) {
                        if (isFirstMaintCol && currentRowData.firstMaintenance.color !== 'default') {
                            const color = currentRowData.firstMaintenance.color;
                            if (color === 'green') doc.setTextColor('#28a745');
                            if (color === 'red') doc.setTextColor('#dc3545');
                            if (color === 'blue') doc.setTextColor('#007bff');
                        }
                        if (isSecondMaintCol && currentRowData.secondMaintenance.color !== 'default') {
                            const color = currentRowData.secondMaintenance.color;
                            if (color === 'green') doc.setTextColor('#28a745');
                            if (color === 'red') doc.setTextColor('#dc3545');
                            if (color === 'blue') doc.setTextColor('#007bff');
                        }
                        if (isStatusColumn) {
                            if (currentRowData.status.color === 'green') doc.setTextColor('#28a745');
                            if (currentRowData.status.color === 'red') doc.setTextColor('#dc3545');
                            if (currentRowData.status.color === 'blue') doc.setTextColor('#007bff');
                        }
                    }
                },
                didDrawPage: (data: any) => {
                    const pageCount = doc.internal.getNumberOfPages();
                    doc.setFontSize(8);
                    doc.setTextColor(150);
                    doc.text(`Página ${data.pageNumber} de ${pageCount}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
                }
            });

            doc.save(`Calendario_Mantenimiento_${selectedYear}.pdf`);
        } catch (error) {
            console.error("Failed to generate PDF:", error);
        } finally {
            setIsExporting(false);
        }
    };

    const canSeeMaintenanceFilters = user && [Role.SUPER_ADMIN, Role.SYSTEM_ADMIN, Role.BIOMEDICAL_ENGINEER].includes(user.role);
    const canRegisterMaintenance = user && [Role.SUPER_ADMIN, Role.SYSTEM_ADMIN].includes(user.role);

    const reportData = useMemo(() => {
        let equipmentList = equipment;

        if (canSeeMaintenanceFilters) {
            if (filters.lastMaintFrom) equipmentList = equipmentList.filter(e => e.lastMaintenanceDate >= filters.lastMaintFrom);
            if (filters.lastMaintTo) equipmentList = equipmentList.filter(e => e.lastMaintenanceDate <= filters.lastMaintTo);
            if (filters.nextMaintFrom) equipmentList = equipmentList.filter(e => e.nextMaintenanceDate >= filters.nextMaintFrom);
            if (filters.nextMaintTo) equipmentList = equipmentList.filter(e => e.nextMaintenanceDate <= filters.nextMaintTo);
        }

        return equipmentList.map(equipmentItem => {
            const schedule = getMaintenanceSchedule(equipmentItem, selectedYear);
            const closedPreventiveWOs = workOrders.filter(wo =>
                wo.equipmentId === equipmentItem.id &&
                wo.type === WorkOrderType.PREVENTIVE &&
                wo.status === WorkOrderStatus.CLOSED &&
                new Date(wo.history?.[wo.history.length - 1]?.timestamp || wo.createdAt).getFullYear() === selectedYear
            ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

            const getMaintenanceStatus = (): { text: string; color: string } => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                let overdueCount = 0;
                const doneCount = closedPreventiveWOs.length;

                if (schedule.length === 0) {
                    return { text: 'N/A', color: 'default' };
                }

                schedule.forEach((maint, index) => {
                    const dueDate = new Date(selectedYear, maint.month + 1, 0); // Last day of month
                    dueDate.setHours(23, 59, 59, 999);
                    const isDone = doneCount > index;

                    if (!isDone && dueDate < today) {
                        overdueCount++;
                    }
                });

                if (overdueCount > 0) {
                    return { text: overdueCount > 1 ? 'Vencidos' : 'Vencido', color: 'red' };
                }

                if (doneCount === schedule.length) {
                    return { text: 'OK', color: 'green' };
                }

                if (doneCount > 0) {
                    return { text: 'En tiempo', color: 'default' };
                }

                return { text: 'Pendiente', color: 'blue' };
            };

            const monthlyData = Array(12).fill(null);
            schedule.forEach(s => { monthlyData[s.month] = s.type; });

            const processMaintenance = (
                maintSchedule: { month: number; type: 'MP1' | 'MP2' } | undefined,
                correspondingWO: WorkOrder | undefined
            ): MaintenanceStatusInfo => {
                if (!maintSchedule) return { text: '', color: 'default' };

                if (correspondingWO) {
                    return { text: 'Hecho', color: 'green' };
                }

                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const dueDate = new Date(selectedYear, maintSchedule.month + 1, 0); // Last day of month
                dueDate.setHours(23, 59, 59, 999);

                if (dueDate < today) {
                    return { text: 'Vencido', color: 'red' };
                }

                return { text: 'Por Hacer', color: 'blue' };
            };

            const firstMaintenanceResult = processMaintenance(schedule[0], closedPreventiveWOs[0]);
            const secondMaintenanceResult = processMaintenance(schedule[1], closedPreventiveWOs[1]);

            return {
                equipment: equipmentItem,
                schedule,
                closedPreventiveWOs,
                inventoryNumber: String(equipmentItem.id).length > 2 ? String(equipmentItem.id).substring(2) : String(equipmentItem.id),
                area: (equipmentItem.location || '').split(' - ')[0] || 'Sin Área',
                equipmentName: equipmentItem.name,
                brand: equipmentItem.brand,
                model: equipmentItem.model,
                serialNumber: equipmentItem.serialNumber,
                monthlyData,
                firstMaintenance: firstMaintenanceResult,
                secondMaintenance: secondMaintenanceResult,
                status: getMaintenanceStatus(),
            };
        }).sort((a, b) => a.area.localeCompare(b.area) || parseInt(a.inventoryNumber) - parseInt(b.inventoryNumber));
    }, [selectedYear, filters, canSeeMaintenanceFilters, equipment, workOrders]);

    return (
        <div className="bg-brand-gray-light dark:bg-gray-800 p-0 md:p-6 font-sans">
            {isModalOpen && selectedEquipment && (
                <LogMaintenanceModal
                    equipment={selectedEquipment}
                    year={selectedYear}
                    schedule={reportData.find(d => d.equipment.id === selectedEquipment.id)?.schedule || []}
                    completedWOs={reportData.find(d => d.equipment.id === selectedEquipment.id)?.closedPreventiveWOs || []}
                    onClose={handleCloseModal}
                    onSave={handleSaveMaintenance}
                />
            )}
            {notification && (
                <div className="fixed top-5 right-5 bg-green-500 text-white py-3 px-5 rounded-lg shadow-lg z-50 animate-fade-in-out">
                    {notification}
                </div>
            )}
            <div className="print:hidden flex flex-col space-y-4 mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div className='mb-4 md:mb-0'>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">Calendario Anual de Mantenimiento</h1>
                        <p className="text-gray-600 dark:text-gray-400">Vista general del programa para el año seleccionado.</p>
                    </div>
                    <div className="flex items-center space-x-2 md:space-x-4">
                        <select value={selectedYear} onChange={handleYearChange} className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-slate-700 dark:border-gray-600 dark:text-gray-200">
                            {[currentYear + 1, currentYear, currentYear - 1, currentYear - 2].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                        <button onClick={handleExportPDF} disabled={isExporting} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center whitespace-nowrap disabled:bg-gray-400 disabled:cursor-not-allowed">
                            {isExporting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Generando...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                    <span className='hidden sm:inline'>Exportar a PDF</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {canSeeMaintenanceFilters && (
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border dark:border-gray-700 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Filtros Avanzados</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div>
                                <label htmlFor="lastMaintFrom" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Último Mant. Desde</label>
                                <input type="date" name="lastMaintFrom" id="lastMaintFrom" value={filters.lastMaintFrom} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-blue focus:border-brand-blue dark:bg-slate-700 dark:border-gray-600 dark:text-gray-200" />
                            </div>
                            <div>
                                <label htmlFor="lastMaintTo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Último Mant. Hasta</label>
                                <input type="date" name="lastMaintTo" id="lastMaintTo" value={filters.lastMaintTo} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-blue focus:border-brand-blue dark:bg-slate-700 dark:border-gray-600 dark:text-gray-200" />
                            </div>
                            <div>
                                <label htmlFor="nextMaintFrom" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Próximo Mant. Desde</label>
                                <input type="date" name="nextMaintFrom" id="nextMaintFrom" value={filters.nextMaintFrom} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-blue focus:border-brand-blue dark:bg-slate-700 dark:border-gray-600 dark:text-gray-200" />
                            </div>
                            <div>
                                <label htmlFor="nextMaintTo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Próximo Mant. Hasta</label>
                                <input type="date" name="nextMaintTo" id="nextMaintTo" value={filters.nextMaintTo} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-blue focus:border-brand-blue dark:bg-slate-700 dark:border-gray-600 dark:text-gray-200" />
                            </div>
                            <div className="flex items-end">
                                <button onClick={clearFilters} className="w-full bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Limpiar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100 dark:bg-slate-700">
                        <tr className="text-gray-600 dark:text-gray-300 font-semibold text-left whitespace-nowrap">
                            <th className="sticky left-0 bg-gray-100 dark:bg-slate-700 p-3 z-10">Inventario</th>
                            <th className="sticky left-[70px] bg-gray-100 dark:bg-slate-700 p-3 z-10">Área</th>
                            <th className="sticky left-[150px] bg-gray-100 dark:bg-slate-700 p-3 z-10">Equipo</th>
                            <th className="p-3">Marca</th>
                            <th className="p-3">Modelo</th>
                            <th className="p-3">N. Serie</th>
                            {MONTHS.map(m => <th key={m} className="p-3 text-center">{m}</th>)}
                            <th className="p-3">Primer Mantenimiento</th>
                            <th className="p-3">Segundo Mantenimiento</th>
                            <th className="p-3">Status</th>
                            {canRegisterMaintenance && <th className="p-3">Acciones</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {reportData.map((row, index) => (
                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 whitespace-nowrap">
                                <td className="sticky left-0 bg-white dark:bg-slate-800 p-3 text-gray-900 dark:text-gray-200 z-10">{row.inventoryNumber}</td>
                                <td className="sticky left-[70px] bg-white dark:bg-slate-800 p-3 text-gray-900 dark:text-gray-200 z-10">{row.area}</td>
                                <td className="sticky left-[150px] bg-white dark:bg-slate-800 p-3 font-medium text-gray-800 dark:text-gray-100 z-10">{row.equipmentName}</td>
                                <td className="p-3 text-gray-900 dark:text-gray-200">{row.brand}</td>
                                <td className="p-3 text-gray-900 dark:text-gray-200">{row.model}</td>
                                <td className="p-3 text-gray-900 dark:text-gray-200">{row.serialNumber}</td>
                                {row.monthlyData.map((maint, i) => (
                                    <td key={i} className="p-3 text-center">
                                        {maint && (
                                            <span className={`px-2 py-0.5 text-xs font-bold text-white rounded-md ${maint === 'MP1' ? 'bg-red-500' : 'bg-blue-500'}`}>
                                                {maint}
                                            </span>
                                        )}
                                    </td>
                                ))}
                                <td className={`p-3 font-semibold ${row.firstMaintenance.color === 'green' ? 'text-green-600' : row.firstMaintenance.color === 'red' ? 'text-red-600' : row.firstMaintenance.color === 'blue' ? 'text-blue-600' : 'text-gray-900 dark:text-gray-200'}`}>{row.firstMaintenance.text}</td>
                                <td className={`p-3 font-semibold ${row.secondMaintenance.color === 'green' ? 'text-green-600' : row.secondMaintenance.color === 'red' ? 'text-red-600' : row.secondMaintenance.color === 'blue' ? 'text-blue-600' : 'text-gray-900 dark:text-gray-200'}`}>{row.secondMaintenance.text}</td>
                                <td className="p-3"><StatusBadge status={row.status} /></td>
                                {canRegisterMaintenance && (
                                    <td className="p-3">
                                        <button
                                            onClick={() => handleOpenModal(row.equipment)}
                                            disabled={row.status.text === 'OK'}
                                            className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full hover:bg-green-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                                        >
                                            Registrar
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                        {reportData.length === 0 && (
                            <tr>
                                <td colSpan={canRegisterMaintenance ? 22 : 21} className="text-center p-8 text-gray-500 dark:text-gray-400">No se encontraron equipos con los filtros seleccionados.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AnnualReportPage;