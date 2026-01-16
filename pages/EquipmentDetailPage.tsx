// FIX: Implemented the EquipmentDetailPage component to resolve module errors.
import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MOCK_USERS } from '../constants';
import { Equipment, EquipmentStatus, WorkOrderType, WorkOrderStatus, EquipmentDocument, DocumentType, Role, WorkOrder } from '../components/layout/types';
import { useApp } from '../context/AppContext';
import DecommissionModal, { DecommissionFormData } from '../components/DecommissionModal';
import { DecommissionData, regenerateSinglePDF } from '../utils/pdfGenerator';
import { SIGEMED_FULL_LOGO } from '../assets/sigemed_full_logo';
import ServiceOrderForm from '../components/ServiceOrderForm';
import MaintenanceRequestForm from '../components/MaintenanceRequestForm';
import EquipmentDepartureForm from '../components/EquipmentDepartureForm'; // F-IBM-05

const EquipmentStatusBadge: React.FC<{ status: EquipmentStatus }> = ({ status }) => {
    const baseClasses = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full";
    const statusClasses: Record<EquipmentStatus, string> = {
        [EquipmentStatus.OPERATIONAL]: "bg-green-100 text-green-800",
        [EquipmentStatus.IN_MAINTENANCE]: "bg-yellow-100 text-yellow-800",
        [EquipmentStatus.OUT_OF_SERVICE]: "bg-red-100 text-red-800",
        [EquipmentStatus.FAILURE_REPORTED]: "bg-orange-100 text-orange-800",
        // F-IBM-05 Statuses
        [EquipmentStatus.LOAN]: "bg-purple-100 text-purple-800",
        [EquipmentStatus.RETURN]: "bg-blue-100 text-blue-800", // Fixed color name if needed (indigo vs blue)
        [EquipmentStatus.DIAGNOSIS]: "bg-indigo-100 text-indigo-800",
        [EquipmentStatus.PREVENTIVE]: "bg-teal-100 text-teal-800",
        [EquipmentStatus.CORRECTIVE]: "bg-pink-100 text-pink-800",
        [EquipmentStatus.OTHER]: "bg-gray-100 text-gray-800",
    };
    return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="mt-1 text-md text-gray-900">{value}</p>
    </div>
);

const EditEquipmentModal: React.FC<{
    equipment: Equipment;
    onClose: () => void;
    onSave: (updated: Equipment) => void;
}> = ({ equipment, onClose, onSave }) => {
    const [formData, setFormData] = useState(equipment);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">Editar Equipo</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full mt-1 px-3 py-2 border rounded-md" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Marca</label>
                            <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="w-full mt-1 px-3 py-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Modelo</label>
                            <input type="text" name="model" value={formData.model} onChange={handleChange} className="w-full mt-1 px-3 py-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">N/S</label>
                            <input type="text" name="serialNumber" value={formData.serialNumber} onChange={handleChange} className="w-full mt-1 px-3 py-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Ubicación</label>
                            <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full mt-1 px-3 py-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Estado</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="w-full mt-1 px-3 py-2 border rounded-md">
                                {Object.values(EquipmentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Último Mantenimiento</label>
                            <input type="date" name="lastMaintenanceDate" value={formData.lastMaintenanceDate || ''} onChange={handleChange} className="w-full mt-1 px-3 py-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Próximo Mantenimiento</label>
                            <input type="date" name="nextMaintenanceDate" value={formData.nextMaintenanceDate || ''} onChange={handleChange} className="w-full mt-1 px-3 py-2 border rounded-md" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">URL de Imagen</label>
                            <input type="text" name="imageUrl" value={formData.imageUrl || ''} onChange={handleChange} className="w-full mt-1 px-3 py-2 border rounded-md" placeholder="https://ejemplo.com/imagen.jpg" />
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Cancelar</button>
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Guardar Cambios</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ReportFailureModal replaced by ServiceOrderForm
const ReportFailureModalWrapper: React.FC<{ equipment: Equipment, onSubmit: (data: Partial<WorkOrder>) => void, onCancel: () => void }> = ({ equipment, onSubmit, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 overflow-y-auto">
            <ServiceOrderForm
                equipment={equipment}
                mode="create"
                onSubmit={onSubmit}
                onCancel={onCancel}
            />
        </div>
    );
};

const AddDocumentModal: React.FC<{
    onClose: () => void;
    onSave: (name: string, type: DocumentType, file: File) => void;
}> = ({ onClose, onSave }) => {
    const [docType, setDocType] = useState<DocumentType>(DocumentType.USER_MANUAL);
    const [file, setFile] = useState<File | null>(null);
    const [customName, setCustomName] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setError('Por favor, seleccione un archivo.');
            return;
        }
        onSave(customName || file.name, docType, file);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-4">Agregar Documento</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tipo de Documento</label>
                        <select
                            value={docType}
                            onChange={e => setDocType(e.target.value as DocumentType)}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                        >
                            {Object.values(DocumentType).map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Archivo</label>
                        <input
                            type="file"
                            onChange={e => {
                                setFile(e.target.files ? e.target.files[0] : null);
                                setError('');
                            }}
                            required
                            className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-brand-blue hover:file:bg-blue-100"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre del Documento (Opcional)</label>
                        <input
                            type="text"
                            value={customName}
                            onChange={e => setCustomName(e.target.value)}
                            placeholder={file?.name || "Dejar en blanco para usar el nombre del archivo"}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Cancelar</button>
                        <button type="submit" className="bg-brand-blue text-white px-4 py-2 rounded-md hover:bg-brand-blue-dark">Guardar Documento</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const DeleteConfirmationModal: React.FC<{
    itemName: string;
    onClose: () => void;
    onConfirm: () => void;
}> = ({ itemName, onClose, onConfirm }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Confirmar Eliminación</h2>
            <p className="text-gray-600">¿Está seguro de que desea eliminar <strong>{itemName}</strong>? Esta acción no se puede deshacer.</p>
            <div className="mt-6 flex justify-end space-x-3">
                <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Cancelar</button>
                <button type="button" onClick={onConfirm} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">Eliminar</button>
            </div>
        </div>
    </div>
);

const EquipmentDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    // FIX: Replaced useAuth, useInventory, and useAuditLog with useApp to resolve module errors.
    const { user, equipment: allEquipment, workOrders, updateEquipment, addWorkOrder, addLogEntry, deleteEquipment, isLoading, sendEmail, addNotification } = useApp();

    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [reportSuccess, setReportSuccess] = useState(false);
    const [isAddDocModalOpen, setIsAddDocModalOpen] = useState(false);
    const [deletingDocument, setDeletingDocument] = useState<EquipmentDocument | null>(null);
    const [isDeleteEquipmentModalOpen, setIsDeleteEquipmentModalOpen] = useState(false);
    const [deleteMessage, setDeleteMessage] = useState('');
    const [isDecommissionModalOpen, setIsDecommissionModalOpen] = useState(false);
    const [decommissionData, setDecommissionData] = useState<DecommissionFormData | null>(null);

    const equipment = useMemo(() => allEquipment.find(e => String(e.id) === id), [allEquipment, id]);

    const getDynamicStatus = (equipmentItem: Equipment | undefined): EquipmentStatus => {
        if (!equipmentItem) return EquipmentStatus.OUT_OF_SERVICE;

        const hasActiveWorkOrder = workOrders.some(
            wo => wo.equipmentId === equipmentItem.id && wo.status !== WorkOrderStatus.CLOSED
        );

        if (hasActiveWorkOrder) {
            return equipmentItem.status;
        }

        if (equipmentItem.status === EquipmentStatus.OUT_OF_SERVICE) {
            return EquipmentStatus.OUT_OF_SERVICE;
        }

        return EquipmentStatus.OPERATIONAL;
    };

    const equipmentStatus = useMemo(() => getDynamicStatus(equipment), [equipment, workOrders]);

    const relatedWorkOrders = useMemo(() => workOrders.filter(wo => wo.equipmentId === id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [workOrders, id]);
    const activeWorkOrder = useMemo(() => workOrders.find(wo => wo.equipmentId === id && wo.status !== WorkOrderStatus.CLOSED), [workOrders, id]);

    const [isMaintenanceRequestOpen, setIsMaintenanceRequestOpen] = useState(false);
    const [isDepartureModalOpen, setIsDepartureModalOpen] = useState(false);

    const handleReportSubmit = async (data: Partial<WorkOrder>) => {
        if (!equipment) return;
        const success = await addWorkOrder({
            equipmentId: equipment.id,
            // Use data.type if provided (e.g. from MaintenanceRequestForm), else default to CORRECTIVE/REPORTED
            type: data.type || WorkOrderType.CORRECTIVE,
            description: data.description || 'Reporte de Falla',
            assignedTo: 'pending',
            estimatedRepairDate: undefined,
            partsNeeded: '',
            status: (data.type === WorkOrderType.EQUIPMENT_DEPARTURE && data.departureReason)
                ? (() => {
                    switch (data.departureReason) {
                        case 'Comodato': return WorkOrderStatus.ON_LOAN;
                        case 'Devolución': return WorkOrderStatus.RETURNED_TO_SOURCE;
                        case 'Revisión / diagnóstico': return WorkOrderStatus.FOR_DIAGNOSIS;
                        case 'Mantenimiento preventivo': return WorkOrderStatus.EXTERNAL_PREVENTIVE;
                        case 'Mantenimiento correctivo': return WorkOrderStatus.EXTERNAL_CORRECTIVE;
                        case 'Otro': return WorkOrderStatus.OTHER_DEPARTURE;
                        default: return WorkOrderStatus.EQUIPMENT_DEPARTURE;
                    }
                })()
                : WorkOrderStatus.REPORTED,
            requesterName: data.requesterName,
            requestingArea: data.requestingArea,
            folio: data.folio,
            // Include all other data fields (covers F-IBM-04 and F-IBM-05 specific fields)
            ...data,
        });

        if (success) {
            setReportSuccess(true);
            setTimeout(() => setReportSuccess(false), 3000);
            const actionText = data.type === WorkOrderType.MAINTENANCE_REQUEST ? 'Solicitud de Mantenimiento' : 'Reporte de Falla';
            addLogEntry(actionText, `Equipo: ${equipment.name} (Folio: ${data.folio}) - ${data.description}`);

            // Send Notifications for Maintenance Request
            if (data.type === WorkOrderType.MAINTENANCE_REQUEST) {
                const recipients = MOCK_USERS.filter(u => [Role.SUPER_ADMIN, Role.SYSTEM_ADMIN, Role.BIOMEDICAL_ENGINEER].includes(u.role));
                recipients.forEach(recipient => {
                    // Send Email
                    sendEmail({
                        to: recipient.id,
                        from: user?.name || 'Sistema',
                        subject: `Nueva Solicitud de Mantenimiento: ${equipment.name}`,
                        body: `
                            <p>Hola ${recipient.name},</p>
                            <p>Se ha generado una nueva Solicitud de Mantenimiento (F-IBM-04) para el equipo: <strong>${equipment.name}</strong>.</p>
                            <p><strong>Solicitado por:</strong> ${data.requesterName}</p>
                            <p><strong>Ubicación:</strong> ${equipment.location}</p>
                            <p><strong>Descripción:</strong> ${data.description}</p>
                            <p>Por favor, ingrese al módulo de Mantenimiento para gestionar la solicitud.</p>
                        `
                    });

                    // Add In-App Notification (this will work for current user if they are recipient, but standard context doesn't push to others in local state)
                    // For demo/mock purposes, we might only see it if we are the recipient?
                    // Actually addNotification updates GLOBAL notifications state in THIS session.
                    // Ideally we should push to a notification service. 
                    // Since it's local state, other users won't see it unless they're on this machine/session.
                    // But for the "User Flow" where I change roles or log out, it persists? No.
                    // HOWEVER, if I stay logged in (as Admin), I should see it.
                    // The request says "notificación tambien debe de aparecer".

                    // We'll add it generally.
                    /* 
                       Note: In a real app this would be a backend push. 
                       Here, we can simulate it for the current user if they match, 
                       or just add it to the 'notifications' array which is shared in context?
                       Wait, Context IS PER USER SESSION. 
                       If I log out, context clears? 
                       AppContext uses `useState` for notifications. 
                       So upon logout, it clears? 
                       Yes.
                       So to see notification I must BE logged in as the recipient AT THE TIME of creation?
                       Or `addNotification` adds to `notifications` which persists?
                       Actually, `notifications` is NOT persisted to localStorage in AppContext (only logEntries).
                    */
                });

                // For the purpose of the demo, let's add a notification for the CURRENT USER (if authorized)
                // so they see "Successful Request" or similar?
                // The requirement is "aparecerá una notificación a estos tres usuarios".
                // Since we can't push to other sessions, we rely on the implementation being "correct for a real system". 
                // But for the user to SEE it, they likely test in the same session.

                // Let's just add one notification to the system for visibility.
                addNotification({
                    message: `Nueva Solicitud Mantenimiento: ${equipment.name}`,
                    type: 'info',
                    linkTo: '/maintenance'
                });
            }

            // F-IBM-05: Update Equipment Status on Departure
            if (data.type === WorkOrderType.EQUIPMENT_DEPARTURE && data.departureReason) {
                let newStatus = EquipmentStatus.OUT_OF_SERVICE; // Default fallback
                switch (data.departureReason) {
                    case 'Comodato': newStatus = EquipmentStatus.LOAN; break;
                    case 'Devolución': newStatus = EquipmentStatus.RETURN; break;
                    case 'Revisión / diagnóstico': newStatus = EquipmentStatus.DIAGNOSIS; break;
                    case 'Mantenimiento preventivo': newStatus = EquipmentStatus.PREVENTIVE; break;
                    case 'Mantenimiento correctivo': newStatus = EquipmentStatus.CORRECTIVE; break;
                    case 'Otro': newStatus = EquipmentStatus.OTHER; break;
                }
                updateEquipment({ ...equipment, status: newStatus });
                addLogEntry('Salida de Equipo', `Equipo: ${equipment.name} - Estado actualizado a: ${newStatus}`);
            }
        }
        setIsReportModalOpen(false);
        setIsMaintenanceRequestOpen(false);
        setIsDepartureModalOpen(false);
    };

    const handleUpdate = async (updatedEquipment: Equipment) => {
        const success = await updateEquipment(updatedEquipment); // Calls API
        if (success) {
            addLogEntry('Actualizó Información de Equipo', `Equipo: ${updatedEquipment.name}(ID: ${updatedEquipment.id})`);
            setIsEditModalOpen(false);
        } else {
            alert('Error al actualizar el equipo');
        }
    };

    const handleAddDocument = (name: string, type: DocumentType, file: File) => {
        if (!equipment) return;
        const newDocument: EquipmentDocument = {
            id: `doc - ${Date.now()}`,
            name: name || file.name,
            type,
            fileUrl: '#', // In a real app, this would be a URL from a storage service
            uploadedAt: new Date().toISOString(),
        };
        const updatedDocuments = [...(equipment.documents || []), newDocument];
        updateEquipment({ ...equipment, documents: updatedDocuments });
        addLogEntry('Agregó Documento a Equipo', `Equipo: ${equipment.name}.Documento: ${newDocument.name}`);
        setIsAddDocModalOpen(false);
    };

    const handleDeleteDocument = () => {
        if (!equipment || !deletingDocument) return;
        const updatedDocuments = (equipment.documents || []).filter(doc => doc.id !== deletingDocument.id);
        updateEquipment({ ...equipment, documents: updatedDocuments });
        addLogEntry('Eliminó Documento de Equipo', `Equipo: ${equipment.name}.Documento: ${deletingDocument.name}`);
        setDeletingDocument(null);
    };

    // Handle marking equipment as decommissioned (Fuera de Servicio) - called from DecommissionModal
    const handleDecommissionConfirm = async (formData: DecommissionFormData) => {
        if (!equipment) return;
        // Store the form data for potential re-generation of PDFs
        setDecommissionData(formData);

        const success = await updateEquipment({ ...equipment, status: EquipmentStatus.OUT_OF_SERVICE });
        if (success) {
            addLogEntry('Dio de Baja Equipo con PDFs', `Equipo: ${equipment.name}(N / S: ${equipment.serialNumber}) - Se generaron formatos de baja.Justificación: ${formData.justificacion}`);
            setDeleteMessage('¡PDFs generados y descargados! Equipo marcado como Fuera de Servicio.');
            setTimeout(() => setDeleteMessage(''), 5000);
        }
        setIsDecommissionModalOpen(false);
    };

    // Handle permanent deletion of equipment
    const handleDeleteEquipment = async () => {
        if (!equipment) return;
        const result = await deleteEquipment(equipment.id);
        if (result.success) {
            addLogEntry('Eliminó Equipo Permanentemente', `Equipo: ${equipment.name}(N / S: ${equipment.serialNumber})`);
            navigate('/inventory');
        } else {
            setDeleteMessage(`Error: ${result.message}`);
            setTimeout(() => setDeleteMessage(''), 5000);
        }
        setIsDeleteEquipmentModalOpen(false);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
            </div>
        );
    }

    if (!equipment) {
        return (
            <div className="text-center">
                <h2 className="text-2xl font-bold">Equipo no encontrado</h2>
                <Link to="/inventory" className="text-brand-blue hover:underline mt-4 inline-block">Volver al inventario</Link>
            </div>
        );
    }

    return (
        <div>
            {isReportModalOpen && equipment && <ReportFailureModalWrapper equipment={equipment} onSubmit={handleReportSubmit} onCancel={() => setIsReportModalOpen(false)} />}
            {isEditModalOpen && <EditEquipmentModal equipment={equipment} onClose={() => setIsEditModalOpen(false)} onSave={handleUpdate} />}
            {reportSuccess && (
                <div className="fixed top-5 right-5 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg z-50 animate-fade-in-out">
                    ¡Reporte enviado con éxito!
                </div>
            )}
            {deleteMessage && (
                <div className={`fixed top - 5 right - 5 py - 2 px - 4 rounded - lg shadow - lg z - 50 ${deleteMessage.includes('Error') ? 'bg-red-500' : 'bg-green-500'} text - white`}>
                    {deleteMessage}
                </div>
            )}
            {isAddDocModalOpen && <AddDocumentModal onClose={() => setIsAddDocModalOpen(false)} onSave={handleAddDocument} />}
            {deletingDocument && <DeleteConfirmationModal itemName={deletingDocument.name} onClose={() => setDeletingDocument(null)} onConfirm={handleDeleteDocument} />}

            {/* Delete Equipment Confirmation Modal */}
            {isDeleteEquipmentModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                        <div className="flex items-center mb-4">
                            <svg className="h-8 w-8 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Eliminar Equipo Permanentemente</h2>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 mb-2">
                            ¿Está seguro de que desea eliminar permanentemente este equipo?
                        </p>
                        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md p-3 mb-4">
                            <p className="font-semibold text-red-800 dark:text-red-200">{equipment.name}</p>
                            <p className="text-sm text-red-600 dark:text-red-300">N/S: {equipment.serialNumber}</p>
                        </div>
                        <p className="text-red-600 dark:text-red-400 text-sm font-medium mb-6">
                            ⚠️ Esta acción no se puede deshacer. Se perderá todo el historial del equipo.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsDeleteEquipmentModalOpen(false)}
                                className="bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeleteEquipment}
                                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                            >
                                Sí, eliminar permanentemente
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Decommission Modal with PDF generation */}
            {isDecommissionModalOpen && equipment && (
                <DecommissionModal
                    equipment={equipment}
                    onClose={() => setIsDecommissionModalOpen(false)}
                    onConfirm={handleDecommissionConfirm}
                />
            )}

            <button onClick={() => navigate(-1)} className="mb-6 text-sm text-gray-600 hover:text-gray-900 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                Volver
            </button>



            {activeWorkOrder && (
                <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-800 p-4 rounded-lg mb-6 shadow-md" role="alert">
                    <div className="flex items-center">
                        <div className="py-1"><svg className="fill-current h-6 w-6 text-orange-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM9 5v6h2V5H9zm0 8v2h2v-2H9z" /></svg></div>
                        <div>
                            <p className="font-bold">Este equipo tiene un reporte de falla activo.</p>
                        </div>
                    </div>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm pl-10">
                        <p><strong>Estado:</strong> {activeWorkOrder.status}</p>
                        {activeWorkOrder.assignedTo && <p><strong>Asignado a:</strong> {MOCK_USERS.find(u => u.id === activeWorkOrder.assignedTo)?.name || 'No Asignado'}</p>}
                        {activeWorkOrder.estimatedRepairDate && <p><strong>Fecha Estimada de Reparación:</strong> {new Date(activeWorkOrder.estimatedRepairDate).toLocaleDateString()}</p>}
                        {activeWorkOrder.partsNeeded && <p className="sm:col-span-2"><strong>Refacciones Necesarias:</strong> {activeWorkOrder.partsNeeded}</p>}
                    </div>
                </div>
            )}

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="md:flex">
                    <div className="md:flex-shrink-0">
                        <img className="h-64 w-full object-cover md:w-64" src={equipment.imageUrl} alt={equipment.name} />
                    </div>
                    <div className="p-8 flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="uppercase tracking-wide text-sm text-brand-blue font-semibold">{equipment.brand}</div>
                                <h1 className="block mt-1 text-3xl leading-tight font-bold text-black flex items-center gap-2">
                                    {equipment.name}
                                    {user && [Role.SUPER_ADMIN, Role.SYSTEM_ADMIN].includes(user.role) && (
                                        <div className="flex items-center gap-2 ml-3">
                                            <button onClick={() => setIsEditModalOpen(true)} className="text-sm flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full" title="Editar Equipo">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                Editar
                                            </button>
                                            {equipment.status !== EquipmentStatus.OUT_OF_SERVICE && (
                                                <button onClick={() => setIsDecommissionModalOpen(true)} className="text-sm flex items-center gap-1 text-orange-600 hover:text-orange-800 transition-colors bg-orange-50 hover:bg-orange-100 px-3 py-1 rounded-full" title="Dar de Baja">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                                    Dar de Baja
                                                </button>
                                            )}
                                            <button onClick={() => setIsDeleteEquipmentModalOpen(true)} className="text-sm flex items-center gap-1 text-red-600 hover:text-red-800 transition-colors bg-red-50 hover:bg-red-100 px-3 py-1 rounded-full" title="Eliminar Permanentemente">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                Eliminar
                                            </button>
                                        </div>
                                    )}
                                </h1>
                                <p className="mt-2 text-gray-500">{equipment.model} / NS: {equipment.serialNumber}</p>
                            </div>
                            <EquipmentStatusBadge status={equipmentStatus} />
                        </div>

                        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-6">
                            <DetailItem label="Ubicación" value={equipment.location} />
                            <DetailItem label="Último Mantenimiento" value={new Date(equipment.lastMaintenanceDate).toLocaleDateString()} />
                            <DetailItem label="Próximo Mantenimiento" value={new Date(equipment.nextMaintenanceDate).toLocaleDateString()} />
                            {equipment.lastCalibrationDate && <DetailItem label="Última Calibración" value={new Date(equipment.lastCalibrationDate).toLocaleDateString()} />}
                            {equipment.nextCalibrationDate && <DetailItem label="Próxima Calibración" value={new Date(equipment.nextCalibrationDate).toLocaleDateString()} />}
                        </div>
                        <div className="mt-6 flex items-center space-x-6">
                            {activeWorkOrder ? (
                                <div className="flex flex-col items-start">
                                    <button
                                        disabled
                                        className="bg-gray-400 text-white px-4 py-2 rounded-md cursor-not-allowed flex items-center"
                                        title="No se puede reportar un equipo que ya tiene un reporte activo."
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                        Reportar Falla
                                    </button>
                                    <p className="text-xs text-gray-500 mt-1 italic">Este equipo ya ha sido reportado previamente.</p>
                                </div>
                            ) : (
                                <div className="flex space-x-4">
                                    <button onClick={() => setIsReportModalOpen(true)} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 flex items-center transition-colors shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                        Reportar Falla
                                    </button>

                                    {/* Maintenance Request Button - Restricted to Technical Roles */}
                                    {user && [Role.SUPER_ADMIN, Role.SYSTEM_ADMIN, Role.BIOMEDICAL_ENGINEER].includes(user.role) && (
                                        <>
                                            <button
                                                onClick={() => setIsMaintenanceRequestOpen(true)}
                                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center transition-colors shadow-sm"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                Solicitud Mantenimiento
                                            </button>

                                            {/* Equipment Departure Button (F-IBM-05) */}
                                            <button
                                                onClick={() => setIsDepartureModalOpen(true)}
                                                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center transition-colors shadow-sm ml-4"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                Salida de Equipo
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Maintenance Request Modal */}
            {isMaintenanceRequestOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <MaintenanceRequestForm
                        equipment={equipment}
                        mode="create"
                        onSubmit={(data) => handleReportSubmit({ ...data, type: WorkOrderType.MAINTENANCE_REQUEST })}
                        onCancel={() => setIsMaintenanceRequestOpen(false)}
                        currentUser={user}
                    />
                </div>
            )}

            {/* Equipment Departure Modal (F-IBM-05) */}
            {isDepartureModalOpen && (
                <div className="fixed inset-0 z-50 flex justify-center p-4 bg-black bg-opacity-50 overflow-y-auto items-start pt-10">
                    <EquipmentDepartureForm
                        equipment={equipment}
                        mode="create"
                        onSubmit={(data) => handleReportSubmit({ ...data, type: WorkOrderType.EQUIPMENT_DEPARTURE })}
                        onCancel={() => setIsDepartureModalOpen(false)}
                        currentUser={user}
                    />
                </div>
            )}

            {/* Decommission Documents Section - Only show for decommissioned equipment */}
            {equipment.status === EquipmentStatus.OUT_OF_SERVICE && (
                <div className="mt-8 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 shadow-md rounded-lg p-6">
                    <div className="flex items-center mb-4">
                        <svg className="h-6 w-6 text-orange-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h2 className="text-xl font-semibold text-orange-800 dark:text-orange-200">Formatos de Baja</h2>
                    </div>
                    <p className="text-sm text-orange-700 dark:text-orange-300 mb-4">
                        Este equipo ha sido dado de baja. Puede volver a descargar los formatos oficiales haciendo clic en los botones a continuación.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => {
                                const pdfData: DecommissionData = {
                                    nombreDescripcion: `${equipment.name} - ${equipment.model}`,
                                    marca: equipment.brand,
                                    modelo: equipment.model,
                                    noSerie: equipment.serialNumber,
                                    ubicacion: equipment.location,
                                    noInventario: decommissionData?.noInventario || '',
                                    accesorios: decommissionData?.accesorios || '',
                                    fechaAlta: decommissionData?.fechaAlta || '',
                                    fechaBaja: decommissionData?.fechaBaja || new Date().toISOString().split('T')[0],
                                    justificacion: decommissionData?.justificacion || 'Equipo dado de baja del sistema'
                                };
                                regenerateSinglePDF(pdfData, 'cedula');
                            }}
                            className="flex items-center gap-2 bg-white dark:bg-slate-700 border border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300 px-4 py-2 rounded-md hover:bg-orange-100 dark:hover:bg-orange-900/40"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Cédula de Baja
                        </button>
                        <button
                            onClick={() => {
                                const pdfData: DecommissionData = {
                                    nombreDescripcion: `${equipment.name} - ${equipment.model}`,
                                    marca: equipment.brand,
                                    modelo: equipment.model,
                                    noSerie: equipment.serialNumber,
                                    ubicacion: equipment.location,
                                    noInventario: decommissionData?.noInventario || '',
                                    accesorios: decommissionData?.accesorios || '',
                                    fechaAlta: decommissionData?.fechaAlta || '',
                                    fechaBaja: decommissionData?.fechaBaja || new Date().toISOString().split('T')[0],
                                    justificacion: decommissionData?.justificacion || 'Equipo dado de baja del sistema',
                                    localidad: decommissionData?.localidad || 'Ciudad de México',
                                    delegacionMunicipio: decommissionData?.delegacionMunicipio || '',
                                    encargadoDepto: decommissionData?.encargadoDepto || '',
                                    unidad: decommissionData?.unidad || ''
                                };
                                regenerateSinglePDF(pdfData, 'acta');
                            }}
                            className="flex items-center gap-2 bg-white dark:bg-slate-700 border border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300 px-4 py-2 rounded-md hover:bg-orange-100 dark:hover:bg-orange-900/40"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Acta Administrativa
                        </button>
                        {decommissionData?.includeRadiation && (
                            <button
                                onClick={() => {
                                    const pdfData: DecommissionData = {
                                        nombreDescripcion: `${equipment.name} - ${equipment.model}`,
                                        marca: equipment.brand,
                                        modelo: equipment.model,
                                        noSerie: equipment.serialNumber,
                                        ubicacion: equipment.location,
                                        noInventario: decommissionData?.noInventario || '',
                                        accesorios: decommissionData?.accesorios || '',
                                        fechaAlta: decommissionData?.fechaAlta || '',
                                        fechaBaja: decommissionData?.fechaBaja || new Date().toISOString().split('T')[0],
                                        justificacion: decommissionData?.justificacion || '',
                                        numeroLicencia: decommissionData?.numeroLicencia,
                                        fechaLicencia: decommissionData?.fechaLicencia,
                                        responsableSeguridad: decommissionData?.responsableSeguridad,
                                        destinoFinal: decommissionData?.destinoFinal,
                                        contenedorTraslado: decommissionData?.contenedorTraslado
                                    };
                                    regenerateSinglePDF(pdfData, 'radiacion');
                                }}
                                className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/40 border border-yellow-400 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300 px-4 py-2 rounded-md hover:bg-yellow-200 dark:hover:bg-yellow-900/60"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Cédula Radiación Ionizante
                            </button>
                        )}
                    </div>
                </div>
            )}

            <div className="mt-8 bg-white shadow-md rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-700">Documentos y Archivos Adjuntos</h2>
                    <button onClick={() => setIsAddDocModalOpen(true)} className="bg-brand-blue text-white px-4 py-2 rounded-md hover:bg-brand-blue-dark flex items-center text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        Agregar Documento
                    </button>
                </div>
                {(equipment.documents && equipment.documents.length > 0) ? (
                    <ul className="divide-y divide-gray-200">
                        {equipment.documents.map(doc => (
                            <li key={doc.id} className="py-3 flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-gray-800">{doc.name}</p>
                                    <p className="text-sm text-gray-500">{doc.type} - Agregado el {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                                </div>
                                <div className="space-x-2">
                                    <a href={doc.fileUrl}
                                        download
                                        onClick={() => addLogEntry('Descargó Documento de Equipo', `Equipo: ${equipment.name}, Documento: ${doc.name}`)}
                                        className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full hover:bg-green-200">
                                        Descargar
                                    </a>
                                    <button onClick={() => setDeletingDocument(doc)} className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded-full hover:bg-red-200">Eliminar</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 text-center py-4">No hay documentos adjuntos para este equipo.</p>
                )}
            </div>

            <div className="mt-8 bg-white shadow-md rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Historial de Mantenimiento</h2>
                {relatedWorkOrders.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                        {relatedWorkOrders.map(wo => (
                            <li key={wo.id} className="py-4">
                                <p><strong>ID Orden:</strong> {wo.id} | <strong>Fecha:</strong> {new Date(wo.createdAt).toLocaleDateString()}</p>
                                <p><strong>Tipo:</strong> {wo.type} | <strong>Estado:</strong> {wo.status}</p>
                                <p className="text-sm text-gray-600 mt-1">{wo.description}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500">No hay órdenes de trabajo para este equipo.</p>
                )}
            </div>
        </div>
    );
};

export default EquipmentDetailPage;