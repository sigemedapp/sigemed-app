import React, { useState, useEffect } from 'react';
import { Equipment, WorkOrderType, WorkOrder } from './layout/types';
import { SIGEMED_FULL_LOGO } from '../assets/sigemed_full_logo';

interface ServiceOrderFormProps {
    equipment: Equipment;
    initialData?: Partial<WorkOrder>;
    mode: 'create' | 'view' | 'edit'; // 'create' = user reporting, 'view' = read only, 'edit' = engineer updating?
    onSubmit?: (data: Partial<WorkOrder>) => void;
    onCancel: () => void;
    assigneeName?: string;
    assigneeRole?: string;
    assignedDate?: string;
}

const ServiceOrderForm: React.FC<ServiceOrderFormProps> = ({
    equipment,
    initialData,
    mode,
    onSubmit,
    onCancel,
    assigneeName,
    assigneeRole,
    assignedDate
}) => {
    const isReadOnly = mode === 'view';
    const isCreation = mode === 'create';

    const [serviceType, setServiceType] = useState<WorkOrderType>(initialData?.type || WorkOrderType.CORRECTIVE);
    const [requesterName, setRequesterName] = useState(initialData?.requesterName || '');
    const [requestingArea, setRequestingArea] = useState(initialData?.requestingArea || '');
    const [description, setDescription] = useState(initialData?.description || '');
    // For future: failureFound, etc.
    const [failureFound, setFailureFound] = useState('');

    // Auto-generated fields for display
    const today = new Date();
    const emissionDate = 'Diciembre 2025';
    const revisionDate = 'Diciembre 2027';
    // Use initialData date if available, else today
    const dateToUse = initialData?.createdAt ? new Date(initialData.createdAt) : today;
    const formattedDate = dateToUse.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
    const formattedTime = dateToUse.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

    // Folio: use existing or generate placeholder if creating
    const folio = initialData?.folio || `OS-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    useEffect(() => {
        if (initialData) {
            if (initialData.type) setServiceType(initialData.type);
            if (initialData.requesterName) setRequesterName(initialData.requesterName);
            if (initialData.requestingArea) setRequestingArea(initialData.requestingArea);
            if (initialData.description) setDescription(initialData.description);
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSubmit) {
            onSubmit({
                type: serviceType,
                description,
                requesterName,
                requestingArea,
                folio,
                createdAt: isCreation ? today.toISOString() : initialData?.createdAt,
            });
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto font-sans text-sm relative">
            <div className="absolute top-2 right-2">
                <button onClick={onCancel} className="text-gray-500 hover:text-gray-800 font-bold text-xl px-2">&times;</button>
            </div>
            <div className="p-8">
                {/* Header Table Structure */}
                <div className="border-2 border-slate-800 mb-6 flex">
                    <div className="w-1/4 border-r-2 border-slate-800 p-2 flex items-center justify-center">
                        <img src={SIGEMED_FULL_LOGO} alt="Hospitales Polanco" className="h-12 object-contain" />
                    </div>
                    <div className="w-1/2 border-r-2 border-slate-800 bg-slate-800 text-white flex flex-col items-center justify-center font-bold text-xl uppercase tracking-wider">
                        <div>ORDEN DE</div>
                        <div>SERVICIO</div>
                    </div>
                    <div className="w-1/4 flex flex-col">
                        <div className="border-b border-slate-800 p-1 text-right font-bold pr-2 bg-slate-100">F-IBM-03</div>
                        <div className="border-b border-slate-800 p-1 text-xs flex justify-between px-2"><span>Fecha de emisión:</span> <span>{emissionDate}</span></div>
                        <div className="border-b border-slate-800 p-1 text-xs flex justify-between px-2"><span>Fecha de revisión:</span> <span>{revisionDate}</span></div>
                        <div className="border-b border-slate-800 p-1 text-xs text-right pr-2">Versión 1</div>
                        <div className="p-1 text-xs text-right pr-2">1 de 1</div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Folio & Date */}
                    <div className="flex justify-between mb-4 font-bold text-lg">
                        <div>Folio: <span className="text-slate-600 font-mono">{folio}</span></div>
                        <div>Fecha: <span className="text-slate-600">{formattedDate} {formattedTime}</span></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Equipment Info */}
                        <div className="border border-slate-400 rounded-sm overflow-hidden">
                            <div className="bg-slate-600 text-white font-bold text-center py-1">Información del equipo</div>
                            <div className="grid grid-cols-2 text-sm">
                                <div className="border-b border-r border-slate-300 p-2 font-semibold bg-slate-50">Equipo</div>
                                <div className="border-b border-slate-300 p-2">{equipment.name}</div>

                                <div className="border-b border-r border-slate-300 p-2 font-semibold bg-slate-50">Ubicación</div>
                                <div className="border-b border-slate-300 p-2">{equipment.location}</div>

                                <div className="border-b border-r border-slate-300 p-2 font-semibold bg-slate-50">Modelo</div>
                                <div className="border-b border-slate-300 p-2">{equipment.model}</div>

                                <div className="border-b border-r border-slate-300 p-2 font-semibold bg-slate-50">Marca</div>
                                <div className="border-b border-slate-300 p-2">{equipment.brand}</div>

                                <div className="border-r border-slate-300 p-2 font-semibold bg-slate-50">No. de serie</div>
                                <div className="p-2">{equipment.serialNumber}</div>
                            </div>
                        </div>

                        {/* Service Type */}
                        <div className="border border-slate-400 rounded-sm overflow-hidden">
                            <div className="bg-slate-600 text-white font-bold text-center py-1">Tipo de servicio</div>
                            <div className="p-3 grid grid-cols-2 gap-y-2 gap-x-4">
                                {[
                                    WorkOrderType.PREVENTIVE,
                                    WorkOrderType.CORRECTIVE,
                                    WorkOrderType.INSTALLATION,
                                    WorkOrderType.TRAINING,
                                    WorkOrderType.CHECK,
                                    WorkOrderType.OTHER
                                ].map((type) => (
                                    <label key={type} className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="serviceType"
                                            value={type}
                                            checked={serviceType === type}
                                            onChange={() => !isReadOnly && setServiceType(type)}
                                            className="form-radio h-4 w-4 text-slate-800 border-slate-400 focus:ring-slate-800"
                                            disabled={isReadOnly}
                                        />
                                        <span className="text-sm">{type}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* User Inputs Section */}
                    <div className="border border-slate-400 rounded-sm mb-6 overflow-hidden">
                        <div className="grid grid-cols-[150px_1fr] border-b border-slate-300">
                            <div className="bg-slate-600 text-white font-bold p-2 flex items-center">Persona que solicita</div>
                            <div className="p-0">
                                <input
                                    type="text"
                                    value={requesterName}
                                    onChange={e => setRequesterName(e.target.value)}
                                    className="w-full h-full p-2 focus:outline-none focus:bg-slate-50 font-medium disabled:bg-gray-50"
                                    placeholder="Nombre completo"
                                    required={isCreation}
                                    disabled={isReadOnly}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-[150px_1fr] border-b border-slate-300">
                            <div className="bg-slate-600 text-white font-bold p-2 flex items-center">Área que solicita</div>
                            <div className="p-0">
                                <input
                                    type="text"
                                    value={requestingArea}
                                    onChange={e => setRequestingArea(e.target.value)}
                                    className="w-full h-full p-2 focus:outline-none focus:bg-slate-50 disabled:bg-gray-50"
                                    placeholder="Área / Departamento"
                                    required={isCreation}
                                    disabled={isReadOnly}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-[150px_1fr] border-b border-slate-300">
                            <div className="bg-slate-600 text-white font-bold p-2 flex items-center">Falla reportada</div>
                            <div className="p-0 text-left">
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className="w-full h-24 p-2 focus:outline-none focus:bg-slate-50 resize-none disabled:bg-gray-50"
                                    placeholder="Descripción breve de la falla"
                                    required={isCreation}
                                    disabled={isReadOnly}
                                />
                            </div>
                        </div>
                        {/* Falla encontrada (To be filled by engineer - potentially editable in 'edit' mode if I implement it fully, for now read only placeholder or empty) */}
                        <div className="grid grid-cols-[150px_1fr] border-b border-slate-300">
                            <div className="bg-slate-600 text-white font-bold p-2 flex items-center border-r border-slate-300">Falla encontrada</div>
                            <div className="p-0">
                                <textarea
                                    value={failureFound} // We could bind this if we add it to props/WorkOrder
                                    readOnly={true} // For now
                                    className="w-full h-24 p-2 bg-gray-50 italic text-gray-500 resize-none"
                                    placeholder="(A llenar por ingeniería biomédica)"
                                />
                            </div>
                        </div>
                    </div>

                    {/* "Realiza el servicio" Section */}
                    <div className="border border-slate-400 rounded-sm mb-6 overflow-hidden">
                        <div className="bg-slate-600 text-white font-bold text-center py-1">Realiza el servicio</div>
                        <div className="grid grid-cols-3 text-sm">
                            <div className="border-r border-slate-300 p-2">
                                <span className="block font-bold text-xs text-gray-500 uppercase mb-1">Nombre</span>
                                <div className="font-medium text-slate-800 min-h-[1.5em]">
                                    {assigneeName || <span className="text-gray-400 italic">--</span>}
                                </div>
                            </div>
                            <div className="border-r border-slate-300 p-2">
                                <span className="block font-bold text-xs text-gray-500 uppercase mb-1">Puesto</span>
                                <div className="font-medium text-slate-800 min-h-[1.5em]">
                                    {assigneeRole || <span className="text-gray-400 italic">--</span>}
                                </div>
                            </div>
                            <div className="p-2">
                                <span className="block font-bold text-xs text-gray-500 uppercase mb-1">Fecha de Asignación</span>
                                <div className="font-medium text-slate-800 min-h-[1.5em]">
                                    {assignedDate ? new Date(assignedDate).toLocaleDateString() : <span className="text-gray-400 italic">--</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="mt-8 flex justify-end space-x-4 print:hidden">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 font-medium"
                        >
                            {isReadOnly ? 'Cerrar' : 'Cancelar'}
                        </button>
                        {!isReadOnly && (
                            <button
                                type="submit"
                                className="px-6 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-900 font-bold shadow-md transition-colors"
                            >
                                Generar Orden de Servicio
                            </button>
                        )}
                    </div>
                    <p className="text-center text-xs text-gray-400 mt-4 print:hidden">DOCUMENTO CONTROLADO | PROHIBIDA SU REPRODUCCIÓN NO AUTORIZADA</p>
                </form>
            </div>
        </div>
    );
};

export default ServiceOrderForm;
