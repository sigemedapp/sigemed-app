import React, { useState, useEffect } from 'react';
import { HOSPITAL_LOGO } from '../assets/hospital_logo';
import { Equipment, User, WorkOrder, WorkOrderType, DocumentType } from './layout/types';
import { MOCK_USERS } from '../constants'; // Import mock users for signatures
import { generateDeparturePDF, DepartureData } from '../utils/pdfGenerator';

interface EquipmentDepartureFormProps {
    equipment: Equipment;
    mode: 'create' | 'view' | 'edit';
    initialData?: Partial<WorkOrder>;
    onSubmit?: (data: any) => void;
    onCancel: () => void;
    currentUser: User | null;
}

const EquipmentDepartureForm: React.FC<EquipmentDepartureFormProps> = ({
    equipment,
    mode,
    initialData,
    onSubmit,
    onCancel,
    currentUser
}) => {
    const defaultFolio = `F-IBM-05-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

    // Form State
    const [folio, setFolio] = useState(initialData?.folio || defaultFolio);
    const [accessories, setAccessories] = useState(initialData?.accessories || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [departureReason, setDepartureReason] = useState(initialData?.departureReason || '');
    const [departureReasonOther, setDepartureReasonOther] = useState(initialData?.departureReasonOther || '');
    const [authorizedBy, setAuthorizedBy] = useState(initialData?.authorizedBy || ''); // Dirección Médica
    const [receivedByOutside, setReceivedByOutside] = useState(initialData?.receivedByOutside || ''); // Proveedor
    const [sender, setSender] = useState(initialData?.sender || currentUser?.name || ''); // Ing. Biomédica
    const [documentDate, setDocumentDate] = useState(initialData?.createdAt ? new Date(initialData.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    const [documents, setDocuments] = useState<any[]>(initialData?.documents || []);

    const isReadOnly = mode === 'view';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSubmit) {
            onSubmit({
                folio,
                accessories,
                description,
                departureReason: departureReason === 'Otro' ? 'Otro' : departureReason,
                departureReasonOther: departureReason === 'Otro' ? departureReasonOther : undefined,
                authorizedBy,
                receivedByOutside,
                sender,
                type: WorkOrderType.EQUIPMENT_DEPARTURE,
                createdAt: documentDate,
                documents,
            });
        }
    };

    // Auto-resize textarea
    const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
    };

    return (
        <div className="bg-white p-8 max-w-4xl mx-auto shadow-2xl rounded-lg text-gray-900 border border-gray-300 print:shadow-none print:border-none print:w-full">
            {/* Header */}
            <div className="flex border-b-2 border-gray-800 mb-6">
                <div className="w-1/4 p-2 flex items-center justify-center border-r border-gray-300">
                    {/* Placeholder for Logo */}
                    <img
                        src={HOSPITAL_LOGO}
                        alt="Hospitales Polanco"
                        className="h-12 object-contain filter drop-shadow-md dark:invert"
                    />
                </div>
                <div className="w-1/2 bg-gray-800 text-white flex flex-col items-center justify-center p-2">
                    <h2 className="text-xl font-bold uppercase tracking-wider">SALIDA DE EQUIPO</h2>
                    <h3 className="text-lg font-semibold uppercase tracking-wider">PROVEEDOR</h3>
                </div>
                <div className="w-1/4 text-xs">
                    <div className="flex justify-between p-1 border-b border-gray-300 font-bold bg-gray-100">
                        <span>F-IBM-05</span>
                    </div>
                    <div className="flex justify-between p-1 border-b border-gray-300">
                        <span>Fecha de emisión:</span>
                        <span>Diciembre 2025</span>
                    </div>
                    <div className="flex justify-between p-1 border-b border-gray-300">
                        <span>Fecha de revisión:</span>
                        <span>Diciembre 2027</span>
                    </div>
                    <div className="flex justify-between p-1 border-b border-gray-300">
                        <span>Versión</span>
                        <span>1</span>
                    </div>
                    <div className="flex justify-end p-1">
                        <span>1 de 1</span>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Date & Folio Row */}
                <div className="flex justify-between mb-4 px-2">
                    <div className="flex items-center gap-2">
                        <label className="font-bold">Fecha:</label>
                        <input
                            type="date"
                            value={documentDate}
                            disabled
                            className="border-b border-gray-400 focus:outline-none bg-transparent"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="font-bold">Folio:</label>
                        <input
                            type="text"
                            value={folio}
                            onChange={(e) => setFolio(e.target.value)}
                            disabled={isReadOnly}
                            className="border-b border-gray-400 focus:outline-none bg-transparent w-48 font-mono"
                        />
                    </div>
                </div>

                {/* Equipment Data Grid */}
                <div className="grid grid-cols-2 border border-gray-400 mb-4 bg-white">
                    {/* Headers */}
                    <div className="bg-gray-500 text-white font-bold text-center py-1 border-r border-b border-gray-400">Ubicación del equipo</div>
                    <div className="bg-gray-500 text-white font-bold text-center py-1 border-b border-gray-400">Equipo</div>

                    {/* Values */}
                    <div className="p-2 border-r border-b border-gray-400 text-center">{equipment.location}</div>
                    <div className="p-2 border-b border-gray-400 text-center">{equipment.name}</div>

                    {/* Headers */}
                    <div className="bg-gray-500 text-white font-bold text-center py-1 border-r border-b border-gray-400">Marca</div>
                    <div className="bg-gray-500 text-white font-bold text-center py-1 border-b border-gray-400">Modelo</div>

                    {/* Values */}
                    <div className="p-2 border-r border-b border-gray-400 text-center">{equipment.brand}</div>
                    <div className="p-2 border-b border-gray-400 text-center">{equipment.model}</div>

                    {/* Headers */}
                    <div className="bg-gray-500 text-white font-bold text-center py-1 border-r border-b border-gray-400">No. de serie</div>
                    <div className="bg-gray-500 text-white font-bold text-center py-1 border-b border-gray-400">No. de inventario</div>

                    {/* Values */}
                    <div className="p-2 border-r border-gray-400 text-center">{equipment.serialNumber}</div>
                    <div className="p-2 text-center">N/A</div> {/* Mock Inventory No if existing */}
                </div>

                {/* Parts / Accessories */}
                <div className="mb-4 border border-gray-400">
                    <div className="bg-gray-500 text-white font-bold text-center py-1">Partes y/o accesorios</div>
                    <textarea
                        value={accessories}
                        onChange={(e) => { setAccessories(e.target.value); autoResize(e); }}
                        disabled={isReadOnly}
                        className="w-full p-2 min-h-[80px] focus:outline-none resize-none"
                        placeholder={!isReadOnly ? "Describa las partes y accesorios que acompañan al equipo..." : ""}
                    />
                </div>

                {/* Description & Evidence */}
                <div className="mb-4 border border-gray-400">
                    <div className="bg-gray-500 text-white font-bold text-center py-1">Descripción y evidencia fotográfica</div>
                    <textarea
                        value={description}
                        onChange={(e) => { setDescription(e.target.value); autoResize(e); }}
                        disabled={isReadOnly}
                        className="w-full p-2 min-h-[120px] focus:outline-none resize-none"
                        placeholder={!isReadOnly ? "Describa el estado del equipo y la evidencia fotográfica..." : ""}
                    />

                    {/* File Upload Section */}
                    <div className="p-2 border-t border-gray-300">
                        {!isReadOnly && (
                            <div className="mb-2">
                                <label className="block text-sm font-bold text-gray-700 mb-1">Evidencia Fotográfica / Documentos</label>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*,.pdf"
                                    onChange={(e) => {
                                        if (e.target.files) {
                                            const newDocs = Array.from(e.target.files).map((file: File) => ({
                                                id: `doc-${Date.now()}-${Math.random()}`,
                                                name: file.name,
                                                type: file.type.startsWith('image/') ? DocumentType.PHOTO : DocumentType.OTHER,
                                                fileUrl: URL.createObjectURL(file),
                                                uploadedAt: new Date().toISOString()
                                            }));
                                            setDocuments(prev => [...prev, ...newDocs]);
                                        }
                                    }}
                                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-brand-blue hover:file:bg-blue-100"
                                />
                            </div>
                        )}

                        {/* Document List */}
                        {(documents.length > 0) && (
                            <div className="flex flex-wrap gap-4 mt-2">
                                {documents.map((doc, idx) => (
                                    <div key={idx} className="relative group border rounded p-2 flex flex-col items-center w-24">
                                        {doc.type === 'Foto' || (doc.name && /\.(jpg|jpeg|png|gif)$/i.test(doc.name)) ? (
                                            <img src={doc.fileUrl} alt={doc.name} className="h-16 w-16 object-cover rounded mb-1" />
                                        ) : (
                                            <svg className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                        )}
                                        <div className="text-xs text-center truncate w-full" title={doc.name}>{doc.name}</div>

                                        {!isReadOnly ? (
                                            <button
                                                type="button"
                                                onClick={() => setDocuments(documents.filter(d => d.id !== doc.id))}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        ) : (
                                            <a
                                                href={doc.fileUrl}
                                                download={doc.name}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded"
                                            >
                                                <svg className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0L8 8m4-4v12" />
                                                </svg>
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Reason for Departure */}
                <div className="mb-4 border border-gray-400">
                    <div className="bg-gray-500 text-white font-bold text-center py-1">Motivo de salida</div>
                    <div className="grid grid-cols-2 text-sm">
                        <label className="flex items-center p-2 border-b border-gray-300 border-r hover:bg-gray-50 cursor-pointer">
                            <input type="radio" name="reason" checked={departureReason === 'Comodato'} onChange={() => setDepartureReason('Comodato')} disabled={isReadOnly} className="mr-2" />
                            Comodato
                        </label>
                        <label className="flex items-center p-2 border-b border-gray-300 hover:bg-gray-50 cursor-pointer">
                            <input type="radio" name="reason" checked={departureReason === 'Mantenimiento preventivo'} onChange={() => setDepartureReason('Mantenimiento preventivo')} disabled={isReadOnly} className="mr-2" />
                            Mantenimiento preventivo
                        </label>

                        <label className="flex items-center p-2 border-b border-gray-300 border-r hover:bg-gray-50 cursor-pointer">
                            <input type="radio" name="reason" checked={departureReason === 'Devolución'} onChange={() => setDepartureReason('Devolución')} disabled={isReadOnly} className="mr-2" />
                            Devolución
                        </label>
                        <label className="flex items-center p-2 border-b border-gray-300 hover:bg-gray-50 cursor-pointer">
                            <input type="radio" name="reason" checked={departureReason === 'Mantenimiento correctivo'} onChange={() => setDepartureReason('Mantenimiento correctivo')} disabled={isReadOnly} className="mr-2" />
                            Mantenimiento correctivo
                        </label>

                        <label className="flex items-center p-2 border-r border-gray-300 hover:bg-gray-50 cursor-pointer">
                            <input type="radio" name="reason" checked={departureReason === 'Revisión / diagnóstico'} onChange={() => setDepartureReason('Revisión / diagnóstico')} disabled={isReadOnly} className="mr-2" />
                            Revisión / diagnóstico
                        </label>
                        <label className="flex items-center p-2 hover:bg-gray-50 cursor-pointer gap-2">
                            <input type="radio" name="reason" checked={['Comodato', 'Mantenimiento preventivo', 'Devolución', 'Mantenimiento correctivo', 'Revisión / diagnóstico'].indexOf(departureReason) === -1 && departureReason.length > 0} onChange={() => setDepartureReason('Otro')} disabled={isReadOnly} className="mr-2" />
                            <span className="whitespace-nowrap">Otro. Especificar:</span>
                            <input
                                type="text"
                                value={departureReasonOther}
                                onChange={(e) => { setDepartureReason('Otro'); setDepartureReasonOther(e.target.value); }}
                                disabled={isReadOnly}
                                className="border-b border-gray-400 w-full focus:outline-none text-sm"
                            />
                        </label>
                    </div>
                </div>

                {/* Observations (reusing Description area if needed, or separate. The image has Observations at bottom) */}
                <div className="mb-6 border border-gray-400">
                    <div className="bg-gray-500 text-white font-bold text-center py-1">Observaciones</div>
                    <textarea
                        disabled={isReadOnly}
                        className="w-full p-2 min-h-[60px] focus:outline-none resize-none"
                    />
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-3 gap-8 text-center mt-12 mb-8">
                    <div>
                        <div className="border-t border-black pt-2 font-bold">Autorización</div>
                        <input
                            type="text"
                            value={authorizedBy}
                            onChange={(e) => setAuthorizedBy(e.target.value)}
                            disabled={isReadOnly}
                            placeholder="Nombre Dirección Médica"
                            className="w-full text-center focus:outline-none"
                        />
                        <div className="text-sm font-bold">Dirección Médica</div>
                    </div>
                    <div>
                        <div className="border-t border-black pt-2 font-bold">Entrega</div>
                        <input
                            type="text"
                            value={sender}
                            readOnly // Usually current user
                            className="w-full text-center bg-transparent focus:outline-none"
                        />
                        <div className="text-sm font-bold">Ingeniería Biomédica</div>
                    </div>
                    <div>
                        <div className="border-t border-black pt-2 font-bold">Recibe</div>
                        <input
                            type="text"
                            value={receivedByOutside}
                            onChange={(e) => setReceivedByOutside(e.target.value)}
                            disabled={isReadOnly}
                            placeholder="Nombre Proveedor"
                            className="w-full text-center focus:outline-none"
                        />
                        <div className="text-sm font-bold">Proveedor</div>
                    </div>
                </div>

                {/* Footer Disclaimer */}
                <div className="text-center text-xs text-gray-500 mt-8 border-t pt-4">
                    DOCUMENTO CONTROLADO | PROHIBIDA SU REPRODUCCIÓN NO AUTORIZADA
                </div>
                <div className="text-right text-xs text-gray-400 mt-2">
                    hospitalespolanco.mx
                </div>

                {/* Action Buttons (Hidden in print/view mode if PDF gen is separate) */}
                {/* Action Buttons */}
                <div className="mt-8 flex justify-between gap-4 print:hidden">
                    <div>
                        <button
                            type="button"
                            onClick={() => {
                                const pdfData: DepartureData = {
                                    folio,
                                    fecha: documentDate,
                                    ubicacion: equipment.location,
                                    equipo: equipment.name,
                                    marca: equipment.brand,
                                    modelo: equipment.model,
                                    noSerie: equipment.serialNumber,
                                    noInventario: 'N/A',
                                    accesorios: accessories,
                                    descripcion: description,
                                    motivo: departureReason,
                                    motivoOtro: departureReasonOther,
                                    observaciones: '',
                                    autoriza: authorizedBy,
                                    entrega: sender,
                                    recibe: receivedByOutside
                                };
                                generateDeparturePDF(pdfData);
                            }}
                            className="px-6 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            Descargar PDF
                        </button>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            {mode === 'view' ? 'Cerrar' : 'Cancelar'}
                        </button>
                        {!isReadOnly && (
                            <button
                                type="submit"
                                className="px-6 py-2 bg-brand-blue text-white rounded-md hover:bg-blue-700 font-medium"
                            >
                                Generar Salida
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EquipmentDepartureForm;
