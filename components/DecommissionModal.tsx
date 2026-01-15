import React, { useState } from 'react';
import { Equipment } from './layout/types';
import { DecommissionData, generateAllDecommissionPDFs } from '../utils/pdfGenerator';

export interface DecommissionFormData {
    noInventario: string;
    accesorios: string;
    fechaAlta: string;
    fechaBaja: string;
    justificacion: string;
    includeRadiation: boolean;
    numeroLicencia?: string;
    fechaLicencia?: string;
    responsableSeguridad?: string;
    destinoFinal?: string;
    contenedorTraslado?: string;
    localidad?: string;
    delegacionMunicipio?: string;
    encargadoDepto?: string;
}

interface DecommissionModalProps {
    equipment: Equipment;
    onClose: () => void;
    onConfirm: (formData: DecommissionFormData) => void;
}

const DecommissionModal: React.FC<DecommissionModalProps> = ({ equipment, onClose, onConfirm }) => {
    const today = new Date().toISOString().split('T')[0];

    const [formData, setFormData] = useState({
        noInventario: '',
        accesorios: '',
        fechaAlta: '',
        justificacion: '',
        includeRadiation: false,
        // Radiation fields
        numeroLicencia: '',
        fechaLicencia: '',
        responsableSeguridad: '',
        destinoFinal: '',
        contenedorTraslado: '',
        // Administrative fields
        localidad: 'Ciudad de México',
        delegacionMunicipio: 'Cuauhtémoc',
        encargadoDepto: ''
    });

    const [isGenerating, setIsGenerating] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.justificacion.trim()) {
            alert('Por favor, ingrese la justificación de la baja');
            return;
        }

        setIsGenerating(true);

        try {
            const pdfData: DecommissionData = {
                nombreDescripcion: `${equipment.name} - ${equipment.model}`,
                marca: equipment.brand,
                modelo: equipment.model,
                noSerie: equipment.serialNumber,
                ubicacion: equipment.location,
                noInventario: formData.noInventario,
                accesorios: formData.accesorios,
                fechaAlta: formData.fechaAlta,
                fechaBaja: today,
                justificacion: formData.justificacion,
                // Radiation fields
                numeroLicencia: formData.numeroLicencia,
                fechaLicencia: formData.fechaLicencia,
                responsableSeguridad: formData.responsableSeguridad,
                destinoFinal: formData.destinoFinal,
                contenedorTraslado: formData.contenedorTraslado,
                // Administrative fields
                localidad: formData.localidad,
                delegacionMunicipio: formData.delegacionMunicipio,
                encargadoDepto: formData.encargadoDepto
            };

            // Generate PDFs with staggered downloads
            await generateAllDecommissionPDFs(pdfData, formData.includeRadiation);

            // Confirm decommission with form data (for storage/regeneration)
            onConfirm({
                ...formData,
                fechaBaja: today
            });
        } catch (error) {
            console.error('Error generating PDFs:', error);
            alert('Error al generar los PDFs');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                        Dar de Baja Equipo
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Equipment Info (read-only) */}
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">Datos del Equipo</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <p><span className="font-medium">Nombre:</span> {equipment.name}</p>
                        <p><span className="font-medium">Marca:</span> {equipment.brand}</p>
                        <p><span className="font-medium">Modelo:</span> {equipment.model}</p>
                        <p><span className="font-medium">N/S:</span> {equipment.serialNumber}</p>
                        <p className="col-span-2"><span className="font-medium">Ubicación:</span> {equipment.location}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Required Fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">No. Inventario</label>
                            <input
                                type="text"
                                name="noInventario"
                                value={formData.noInventario}
                                onChange={handleChange}
                                className="w-full mt-1 px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                placeholder="Ej: INV-2024-001"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de Alta</label>
                            <input
                                type="date"
                                name="fechaAlta"
                                value={formData.fechaAlta}
                                onChange={handleChange}
                                className="w-full mt-1 px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Accesorios</label>
                        <input
                            type="text"
                            name="accesorios"
                            value={formData.accesorios}
                            onChange={handleChange}
                            className="w-full mt-1 px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            placeholder="Ej: Cable de poder, sensor, manual"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Justificación de la Baja <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="justificacion"
                            value={formData.justificacion}
                            onChange={handleChange}
                            rows={3}
                            required
                            className="w-full mt-1 px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            placeholder="Describa el motivo de la baja: obsolescencia, daño irreparable, etc."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Encargado del Departamento</label>
                        <input
                            type="text"
                            name="encargadoDepto"
                            value={formData.encargadoDepto}
                            onChange={handleChange}
                            className="w-full mt-1 px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            placeholder="Nombre del encargado"
                        />
                    </div>

                    {/* Radiation Equipment Checkbox */}
                    <div className="border-t pt-4 mt-4">
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                name="includeRadiation"
                                checked={formData.includeRadiation}
                                onChange={handleChange}
                                className="w-5 h-5 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Este equipo usa radiación ionizante
                            </span>
                        </label>
                    </div>

                    {/* Radiation Fields (conditional) */}
                    {formData.includeRadiation && (
                        <div className="border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 space-y-4">
                            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Datos para Equipo con Radiación</h4>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">No. de Licencia</label>
                                    <input
                                        type="text"
                                        name="numeroLicencia"
                                        value={formData.numeroLicencia}
                                        onChange={handleChange}
                                        className="w-full mt-1 px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de Licencia</label>
                                    <input
                                        type="date"
                                        name="fechaLicencia"
                                        value={formData.fechaLicencia}
                                        onChange={handleChange}
                                        className="w-full mt-1 px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Responsable de Seguridad Radiológica
                                </label>
                                <input
                                    type="text"
                                    name="responsableSeguridad"
                                    value={formData.responsableSeguridad}
                                    onChange={handleChange}
                                    className="w-full mt-1 px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Destino Final Propuesto</label>
                                <input
                                    type="text"
                                    name="destinoFinal"
                                    value={formData.destinoFinal}
                                    onChange={handleChange}
                                    className="w-full mt-1 px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    placeholder="Ej: Disposición según normativa CNSNS"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Tipo/Marca/Modelo del Contenedor para Traslado
                                </label>
                                <input
                                    type="text"
                                    name="contenedorTraslado"
                                    value={formData.contenedorTraslado}
                                    onChange={handleChange}
                                    className="w-full mt-1 px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                />
                            </div>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isGenerating}
                            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isGenerating ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Generando PDFs...
                                </>
                            ) : (
                                <>
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Generar PDFs y Dar de Baja
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DecommissionModal;
