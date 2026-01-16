import React, { useState, useEffect } from 'react';
import { HOSPITAL_LOGO } from '../assets/hospital_logo';


import { Equipment, User, WorkOrder, WorkOrderType, WorkOrderStatus, Role } from './layout/types';
import { useApp } from '../context/AppContext';

interface MaintenanceRequestFormProps {
    equipment: Equipment;
    mode: 'create' | 'view' | 'edit';
    initialData?: WorkOrder;
    onSubmit?: (data: Partial<WorkOrder>) => void;
    onCancel: () => void;
    currentUser?: User | null;
}

const MaintenanceRequestForm: React.FC<MaintenanceRequestFormProps> = ({
    equipment,
    mode,
    initialData,
    onSubmit,
    onCancel,
    currentUser
}) => {
    const { addLogEntry } = useApp();

    // Form State
    const [requesterName, setRequesterName] = useState(initialData?.requesterName || currentUser?.name || '');
    const [requesterPosition, setRequesterPosition] = useState(currentUser?.role || '');
    const [requestingArea, setRequestingArea] = useState(initialData?.requestingArea || currentUser?.area || equipment.location);
    const [requestDate, setRequestDate] = useState(initialData?.createdAt ? new Date(initialData.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    const [requestTime, setRequestTime] = useState(initialData?.requestTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    const [failureType, setFailureType] = useState<'mechanical' | 'electrical' | 'other' | ''>(initialData?.failureType || '');
    const [failureTypeOther, setFailureTypeOther] = useState(initialData?.failureTypeOther || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [observations, setObservations] = useState(initialData?.conditionsLeft || ''); // Using conditionsLeft as generic observations for now or added field? Using specific logic.
    // For F-IBM-04 "Observaciones" is a bottom section. "conditionsLeft" in WO is "Condiciones en que se deja". 
    // We can map Observaciones to `description` text appended or a new field. 
    // Let's use `description` for "Descripción de la falla o servicio solicitado"
    // And `failureFound` or `conditionsLeft` for "Observaciones"? 
    // In Plan, I said "Observations". Let's map it to `failureFound` field (technically distinct but fits schema) or add to `history`.
    // Actually, "Observaciones" in F-IBM-04 is usually filled by the Requester? Or the Engineer? 
    // The form image shows "Observaciones" at the bottom.

    const isViewMode = mode === 'view';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSubmit) {
            onSubmit({
                requesterName,
                requestingArea,
                createdAt: requestDate,
                requestTime,
                failureType: failureType as any,
                failureTypeOther,
                description,
                // Assign observations to a field, e.g., failureFound for now or append to description?
                // Providing it as failureFound for storage, though semantically different, it stores additional notes.
                failureFound: observations
            });
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700 font-sans text-gray-800 dark:text-gray-200 relative">
            {/* Header / Logos (Replicating F-IBM-04 Header) */}
            <div className="flex border-b-2 border-slate-800 dark:border-slate-400">
                <div className="w-1/4 p-2 border-r border-slate-300 flex items-center justify-center">
                    <img
                        src={HOSPITAL_LOGO}
                        alt="Hospitales Polanco"
                        className="h-10 object-contain filter drop-shadow-md dark:invert"
                    />
                </div>
                <div className="w-1/2 p-2 text-center bg-slate-800 text-white flex flex-col justify-center">
                    <h1 className="text-xl font-bold uppercase">Solicitud de Mantenimiento</h1>
                </div>
                <div className="w-1/4 text-xs border-l border-slate-300 flex flex-col">
                    <div className="bg-slate-100 dark:bg-slate-700 px-1 font-bold text-center border-b border-white">F-IBM-04</div>
                    <div className="px-1 flex justify-between"><span>Emisión:</span> <span>Dic 2025</span></div>
                    <div className="px-1 flex justify-between"><span>Revisión:</span> <span>Dic 2027</span></div>
                    <div className="px-1 flex justify-between"><span>Versión:</span> <span>1</span></div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* No. Solicitud (Auto or Empty) */}
                <div className="flex justify-start items-center mb-2">
                    <span className="font-bold mr-2">No. de solicitud:</span>
                    <span className="border-b border-gray-400 w-32 px-2 text-center text-brand-blue font-mono">
                        {initialData?.folio || 'AUTO'}
                    </span>
                </div>

                {/* Section: Datos del Solicitante */}
                <div className="border border-gray-400">
                    <div className="bg-slate-700 text-white text-center font-bold text-sm py-1">Datos del solicitante</div>
                    <div className="grid grid-cols-12 gap-0 text-sm">
                        <div className="col-span-4 border-r border-b border-gray-400 p-1 font-bold bg-slate-100 dark:bg-slate-700 text-center">Nombre</div>
                        <div className="col-span-3 border-r border-b border-gray-400 p-1 font-bold bg-slate-100 dark:bg-slate-700 text-center">Puesto</div>
                        <div className="col-span-3 border-r border-b border-gray-400 p-1 font-bold bg-slate-100 dark:bg-slate-700 text-center">Área solicitante</div>
                        <div className="col-span-2 border-b border-gray-400 p-1 font-bold bg-slate-100 dark:bg-slate-700 text-center">Tipo Mto.</div>

                        {/* Values Row 1 */}
                        <div className="col-span-4 border-r border-gray-400 p-1">
                            <input
                                type="text"
                                value={requesterName}
                                onChange={e => setRequesterName(e.target.value)}
                                readOnly={isViewMode}
                                className="w-full bg-transparent outline-none"
                                placeholder="Nombre completo"
                            />
                        </div>
                        <div className="col-span-3 border-r border-gray-400 p-1">
                            <input
                                type="text"
                                value={requesterPosition}
                                onChange={e => setRequesterPosition(e.target.value)}
                                readOnly={isViewMode}
                                className="w-full bg-transparent outline-none"
                                placeholder="Puesto"
                            />
                        </div>
                        <div className="col-span-3 border-r border-gray-400 p-1">
                            <input
                                type="text"
                                value={requestingArea}
                                onChange={e => setRequestingArea(e.target.value)}
                                readOnly={isViewMode}
                                className="w-full bg-transparent outline-none"
                                placeholder="Área"
                            />
                        </div>
                        <div className="col-span-2 p-1 text-center text-xs">
                            {/* Defaulting based on context or user choice? Usually check options. */}
                            <span>Correctivo / Preventivo</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-12 gap-0 text-sm border-t border-gray-400">
                        {/* Date Time Row */}
                        <div className="col-span-8 border-r border-gray-400 bg-slate-50 dark:bg-slate-800"></div>
                        <div className="col-span-2 border-r border-gray-400 p-1 font-bold bg-slate-100 dark:bg-slate-700 text-center">Fecha</div>
                        <div className="col-span-2 p-1 font-bold bg-slate-100 dark:bg-slate-700 text-center">Hora</div>
                    </div>
                    <div className="grid grid-cols-12 gap-0 text-sm border-t border-gray-400">
                        <div className="col-span-8 border-r border-gray-400 bg-slate-50 dark:bg-slate-800"></div>
                        <div className="col-span-2 border-r border-gray-400 p-1">
                            <input type="date" value={requestDate} onChange={e => setRequestDate(e.target.value)} readOnly={isViewMode} className="w-full bg-transparent text-center" />
                        </div>
                        <div className="col-span-2 p-1">
                            <input type="time" value={requestTime} onChange={e => setRequestTime(e.target.value)} readOnly={isViewMode} className="w-full bg-transparent text-center" />
                        </div>
                    </div>
                </div>

                {/* Section: Datos del Equipo */}
                <div className="border border-gray-400 mt-4">
                    <div className="bg-slate-700 text-white text-center font-bold text-sm py-1">Datos del equipo</div>
                    <div className="grid grid-cols-5 text-sm font-bold bg-slate-100 dark:bg-slate-700 text-center border-b border-gray-400">
                        <div className="p-1 border-r border-gray-400">Nombre del equipo</div>
                        <div className="p-1 border-r border-gray-400">Marca</div>
                        <div className="p-1 border-r border-gray-400">Modelo</div>
                        <div className="p-1 border-r border-gray-400">No. de serie</div>
                        <div className="p-1">Ubicación</div>
                    </div>
                    <div className="grid grid-cols-5 text-sm text-center">
                        <div className="p-2 border-r border-gray-400">{equipment.name}</div>
                        <div className="p-2 border-r border-gray-400">{equipment.brand}</div>
                        <div className="p-2 border-r border-gray-400">{equipment.model}</div>
                        <div className="p-2 border-r border-gray-400">{equipment.serialNumber}</div>
                        <div className="p-2">{equipment.location}</div>
                    </div>
                    <div className="border-t border-gray-400 flex text-sm">
                        <div className="p-1 font-bold bg-slate-100 dark:bg-slate-700 w-48 border-r border-gray-400">Fecha del último servicio</div>
                        <div className="p-1 flex-grow pl-2">{equipment.lastMaintenanceDate || 'Sin registro'}</div>
                    </div>
                </div>

                {/* Section: Datos de la Falla */}
                <div className="border border-gray-400 mt-4">
                    <div className="bg-slate-700 text-white text-center font-bold text-sm py-1">Datos de la falla</div>
                    <div className="p-2 flex items-center space-x-6 text-sm">
                        <span className="font-bold">Tipo de falla:</span>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={failureType === 'mechanical'}
                                onChange={() => !isViewMode && setFailureType('mechanical')}
                                disabled={isViewMode}
                            />
                            <span>Mecánico</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={failureType === 'electrical'}
                                onChange={() => !isViewMode && setFailureType('electrical')}
                                disabled={isViewMode}
                            />
                            <span>Eléctrico/electrónico</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={failureType === 'other'}
                                onChange={() => !isViewMode && setFailureType('other')}
                                disabled={isViewMode}
                            />
                            <span>Otro. Especificar:</span>
                            <input
                                type="text"
                                value={failureTypeOther}
                                onChange={e => setFailureTypeOther(e.target.value)}
                                disabled={isViewMode || failureType !== 'other'}
                                className="border-b border-gray-400 outline-none px-1 w-40"
                            />
                        </label>
                    </div>
                    <div className="bg-slate-500 text-white text-center font-bold text-xs py-1">Descripción de la falla o servicio solicitado</div>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        readOnly={isViewMode}
                        rows={6}
                        className="w-full p-2 outline-none resize-none bg-white dark:bg-slate-800"
                        placeholder="Describa detalladamente el problema..."
                    />
                </div>

                {/* Section: Observaciones */}
                <div className="border border-gray-400 mt-4">
                    <div className="bg-slate-500 text-white text-center font-bold text-xs py-1">Observaciones</div>
                    <textarea
                        value={observations}
                        onChange={e => setObservations(e.target.value)}
                        readOnly={isViewMode}
                        rows={4}
                        className="w-full p-2 outline-none resize-none bg-white dark:bg-slate-800"
                        placeholder="Observaciones adicionales..."
                    />
                </div>

                {/* Footer Signatures */}
                <div className="flex justify-between mt-8 pt-8 px-12">
                    <div className="text-center w-64 border-t border-black dark:border-white pt-2">
                        <p className="font-bold text-sm">Ingeniería Biomédica</p>
                    </div>
                    <div className="text-center w-64 border-t border-black dark:border-white pt-2">
                        <p className="font-bold text-sm">Dirección Médica</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-4 mt-6 print:hidden">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                    >
                        {isViewMode ? 'Cerrar' : 'Cancelar'}
                    </button>
                    {!isViewMode && (
                        <button
                            type="submit"
                            className="px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-blue-700 font-bold"
                        >
                            Generar Solicitud
                        </button>
                    )}
                    {isViewMode && (
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-bold flex items-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                            Imprimir / Descargar PDF
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default MaintenanceRequestForm;
