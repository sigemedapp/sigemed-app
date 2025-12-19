// FIX: Implemented the EquipmentDetailPage component to resolve module errors.
import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MOCK_USERS } from '../constants';
import { Equipment, EquipmentStatus, WorkOrderType, WorkOrderStatus, EquipmentDocument, DocumentType, Role } from '../components/layout/types';
import { useApp } from '../context/AppContext';

const EquipmentStatusBadge: React.FC<{ status: EquipmentStatus }> = ({ status }) => {
    const baseClasses = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full";
    const statusClasses: Record<EquipmentStatus, string> = {
        [EquipmentStatus.OPERATIONAL]: "bg-green-100 text-green-800",
        [EquipmentStatus.IN_MAINTENANCE]: "bg-yellow-100 text-yellow-800",
        [EquipmentStatus.OUT_OF_SERVICE]: "bg-red-100 text-red-800",
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

const ReportFailureModal: React.FC<{ equipmentName: string, onSubmit: (description: string) => void, onCancel: () => void }> = ({ equipmentName, onSubmit, onCancel }) => {
    const [description, setDescription] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (description.trim()) {
            onSubmit(description);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-4">Reportar Falla para {equipmentName}</h2>
                <form onSubmit={handleSubmit}>
                    <p className="text-gray-600 mb-4">Por favor, describa el problema que está experimentando con el equipo de la manera más detallada posible.</p>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        rows={5}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        placeholder="Ej: El equipo no enciende, muestra un código de error E-05, hace un ruido extraño..."
                    />
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Cancelar</button>
                        <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">Enviar Reporte</button>
                    </div>
                </form>
            </div>
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
    const { user, equipment: allEquipment, workOrders, updateEquipment, addWorkOrder, addLogEntry, isLoading } = useApp();

    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [reportSuccess, setReportSuccess] = useState(false);
    const [isAddDocModalOpen, setIsAddDocModalOpen] = useState(false);
    const [deletingDocument, setDeletingDocument] = useState<EquipmentDocument | null>(null);

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

    const handleReportSubmit = (description: string) => {
        if (!user || !equipment) return;

        const newWorkOrder = {
            id: `wo-${Date.now()}`,
            equipmentId: equipment.id,
            type: WorkOrderType.FAILURE,
            description,
            reportedBy: user.id,
            assignedTo: undefined,
            status: WorkOrderStatus.REPORTED,
            createdAt: new Date().toISOString().split('T')[0],
            history: [
                { timestamp: new Date().toISOString(), userId: user.id, action: 'Reporte de falla creado.' },
            ]
        };

        addWorkOrder(newWorkOrder);
        updateEquipment({ ...equipment, status: EquipmentStatus.OUT_OF_SERVICE });

        addLogEntry('Reportó Falla de Equipo', `Equipo: ${equipment.name} (N/S: ${equipment.serialNumber}). OT Creada: ${newWorkOrder.id}`);

        setIsReportModalOpen(false);
        setReportSuccess(true);
        setTimeout(() => setReportSuccess(false), 4000);
    };

    const handleUpdate = async (updatedEquipment: Equipment) => {
        const success = await updateEquipment(updatedEquipment); // Calls API
        if (success) {
            addLogEntry('Actualizó Información de Equipo', `Equipo: ${updatedEquipment.name} (ID: ${updatedEquipment.id})`);
            setIsEditModalOpen(false);
        } else {
            alert('Error al actualizar el equipo');
        }
    };

    const handleAddDocument = (name: string, type: DocumentType, file: File) => {
        if (!equipment) return;
        const newDocument: EquipmentDocument = {
            id: `doc-${Date.now()}`,
            name: name || file.name,
            type,
            fileUrl: '#', // In a real app, this would be a URL from a storage service
            uploadedAt: new Date().toISOString(),
        };
        const updatedDocuments = [...(equipment.documents || []), newDocument];
        updateEquipment({ ...equipment, documents: updatedDocuments });
        addLogEntry('Agregó Documento a Equipo', `Equipo: ${equipment.name}. Documento: ${newDocument.name}`);
        setIsAddDocModalOpen(false);
    };

    const handleDeleteDocument = () => {
        if (!equipment || !deletingDocument) return;
        const updatedDocuments = (equipment.documents || []).filter(doc => doc.id !== deletingDocument.id);
        updateEquipment({ ...equipment, documents: updatedDocuments });
        addLogEntry('Eliminó Documento de Equipo', `Equipo: ${equipment.name}. Documento: ${deletingDocument.name}`);
        setDeletingDocument(null);
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
            {isReportModalOpen && <ReportFailureModal equipmentName={equipment.name} onSubmit={handleReportSubmit} onCancel={() => setIsReportModalOpen(false)} />}
            {isEditModalOpen && <EditEquipmentModal equipment={equipment} onClose={() => setIsEditModalOpen(false)} onSave={handleUpdate} />}
            {reportSuccess && (
                <div className="fixed top-5 right-5 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg z-50 animate-fade-in-out">
                    ¡Reporte enviado con éxito!
                </div>
            )}
            {isAddDocModalOpen && <AddDocumentModal onClose={() => setIsAddDocModalOpen(false)} onSave={handleAddDocument} />}
            {deletingDocument && <DeleteConfirmationModal itemName={deletingDocument.name} onClose={() => setDeletingDocument(null)} onConfirm={handleDeleteDocument} />}

            <button onClick={() => navigate(-1)} className="mb-6 text-sm text-gray-600 hover:text-gray-900 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                Volver
            </button>

            {/* DEBUG BANNER - TO BE REMOVED */}
            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-2 mb-4 text-xs font-mono">
                DEBUG INFO: User Role = "{user?.role}" | ID = "{user?.id}" | Check = {String([Role.SUPER_ADMIN, Role.SYSTEM_ADMIN].includes(user?.role as Role))}
            </div>

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
                                        <button onClick={() => setIsEditModalOpen(true)} className="text-gray-400 hover:text-blue-500 transition-colors" title="Editar Equipo">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                        </button>
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
                                <button onClick={() => setIsReportModalOpen(true)} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    Reportar Falla
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

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