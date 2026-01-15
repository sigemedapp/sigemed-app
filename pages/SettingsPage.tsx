
import React, { useState, useMemo } from 'react';
import { Equipment, EquipmentStatus, Role } from '../components/layout/types';
import { useApp } from '../context/AppContext';

const SelectOrAddComponent: React.FC<{
    label: string,
    name: keyof Omit<Equipment, 'id' | 'imageUrl' | 'documents'>,
    value: string,
    options: string[],
    onFormChange: (e: React.ChangeEvent<HTMLSelectElement>) => void,
    onAddNew: (field: keyof Omit<Equipment, 'id' | 'imageUrl' | 'documents'>, newValue: string) => void,
    required?: boolean
}> = ({ label, name, value, options, onFormChange, onAddNew, required = false }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newValue, setNewValue] = useState('');

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (e.target.value === 'ADD_NEW') {
            setIsAdding(true);
            onFormChange({ target: { name, value: '' } } as any);
        } else {
            setIsAdding(false);
            onFormChange(e);
        }
    };

    const handleSaveNew = () => {
        if (newValue.trim()) {
            onAddNew(name, newValue.trim());
            setNewValue('');
            setIsAdding(false);
        }
    };

    const handleCancelAdd = () => {
        setNewValue('');
        setIsAdding(false);
    };

    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
            <div className="flex items-center space-x-2 mt-1">
                <select
                    id={name}
                    name={name}
                    value={isAdding ? 'ADD_NEW' : value}
                    onChange={handleSelectChange}
                    required={required && !isAdding && !value}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue dark:bg-slate-700 dark:border-gray-600 dark:text-gray-200"
                >
                    <option value="" disabled>Seleccione una opción</option>
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    <option value="ADD_NEW" className="font-bold text-brand-blue">--- Agregar Nuevo ---</option>
                </select>
            </div>
            {isAdding && (
                <div className="flex items-center space-x-2 mt-2">
                    <input
                        type="text"
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        placeholder={`Nuevo valor`}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue dark:bg-slate-700 dark:border-gray-600 dark:text-gray-200"
                        autoFocus
                    />
                    <button type="button" onClick={handleSaveNew} className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm">OK</button>
                    <button type="button" onClick={handleCancelAdd} className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm">X</button>
                </div>
            )}
        </div>
    );
};

const EditEquipmentModal: React.FC<{
    equipment: Equipment;
    onClose: () => void;
    onSave: (updatedEquipment: Equipment) => void;
}> = ({ equipment, onClose, onSave }) => {
    const [formData, setFormData] = useState<Equipment>(equipment);

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
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-full overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Editar Equipo</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-gray-600 dark:text-gray-200" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Marca</label>
                            <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-gray-600 dark:text-gray-200" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Modelo</label>
                            <input type="text" name="model" value={formData.model} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-gray-600 dark:text-gray-200" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">N/S</label>
                            <input type="text" name="serialNumber" value={formData.serialNumber} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-gray-600 dark:text-gray-200" />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="bg-gray-200 px-4 py-2 rounded-md">Cancelar</button>
                        <button type="submit" className="bg-brand-blue text-white px-4 py-2 rounded-md">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AddEquipmentModal: React.FC<{
    onClose: () => void;
    onSave: (newEquipment: Omit<Equipment, 'id'>) => void;
}> = ({ onClose, onSave }) => {
    const initialEquipmentState = { name: '', brand: '', model: '', serialNumber: '', location: '', status: EquipmentStatus.OPERATIONAL, lastMaintenanceDate: '', nextMaintenanceDate: '', imageUrl: '' };
    const [formData, setFormData] = useState<Omit<Equipment, 'id'>>(initialEquipmentState);

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
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-full overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Agregar Nuevo Equipo</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre *</label>
                            <input type="text" name="name" required value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-gray-600 dark:text-gray-200" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Marca</label>
                            <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-gray-600 dark:text-gray-200" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Modelo</label>
                            <input type="text" name="model" value={formData.model} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-gray-600 dark:text-gray-200" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">N/S</label>
                            <input type="text" name="serialNumber" value={formData.serialNumber} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-gray-600 dark:text-gray-200" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ubicación</label>
                            <input type="text" name="location" value={formData.location} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-gray-600 dark:text-gray-200" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-gray-600 dark:text-gray-200">
                                {Object.values(EquipmentStatus).map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Último Mantenimiento</label>
                            <input type="date" name="lastMaintenanceDate" value={formData.lastMaintenanceDate} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-gray-600 dark:text-gray-200" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Próximo Mantenimiento</label>
                            <input type="date" name="nextMaintenanceDate" value={formData.nextMaintenanceDate} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-gray-600 dark:text-gray-200" />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300">Cancelar</button>
                        <button type="submit" className="bg-brand-blue text-white px-4 py-2 rounded-md hover:bg-brand-blue-dark">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const SettingsPage: React.FC = () => {
    const { equipment, updateEquipment, addLogEntry, refreshInventory, addEquipment } = useApp();
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '';

    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');

    // Duplicate detection state
    const [showDuplicateModal, setShowDuplicateModal] = useState(false);
    const [duplicatesFound, setDuplicatesFound] = useState<{ serialNumber: string, name: string, brand: string, model: string }[]>([]);
    const [pendingItems, setPendingItems] = useState<any[]>([]);
    const [duplicateSerialNumbers, setDuplicateSerialNumbers] = useState<string[]>([]);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
    const [editFilters, setEditFilters] = useState({ name: 'ALL', brand: 'ALL', location: 'ALL', serialNumber: '' });
    const [editMessage, setEditMessage] = useState('');

    const initialEquipmentState = { name: '', brand: '', model: '', serialNumber: '', location: '', status: EquipmentStatus.OPERATIONAL, lastMaintenanceDate: '', nextMaintenanceDate: '' };
    const [newEquipment, setNewEquipment] = useState(initialEquipmentState);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [manualAddMessage, setManualAddMessage] = useState('');

    const uniqueValues = (key: 'name' | 'brand' | 'model' | 'location') => [...new Set(equipment.map(item => item[key]))].sort();
    const [brands, setBrands] = useState<string[]>(() => uniqueValues('brand'));
    const [locations, setLocations] = useState<string[]>(() => uniqueValues('location'));
    const [equipmentNames, setEquipmentNames] = useState<string[]>(() => uniqueValues('name'));
    const [models, setModels] = useState<string[]>(() => uniqueValues('model'));

    const handleAddNewOption = (field: any, newValue: string) => {
        if (field === 'brand') setBrands(prev => [...new Set([...prev, newValue])].sort());
        if (field === 'location') setLocations(prev => [...new Set([...prev, newValue])].sort());
        if (field === 'name') setEquipmentNames(prev => [...new Set([...prev, newValue])].sort());
        if (field === 'model') setModels(prev => [...new Set([...prev, newValue])].sort());
        setNewEquipment(prev => ({ ...prev, [field]: newValue }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
            setMessage('');
        }
    };

    // Process the actual upload with the given mode
    const processUpload = async (items: any[], mode: 'all' | 'new-only', skipSerialNumbers: string[] = []) => {
        const uploadUrl = `${baseUrl}/api/inventory/bulk-upload`;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000);

            const response = await fetch(uploadUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items, mode, skipSerialNumbers }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('text/html')) {
                setMessage(`Error del servidor: El servidor devolvió una página de error (${response.status}).`);
                return;
            }

            let data;
            try {
                data = await response.json();
            } catch {
                setMessage('Error: El servidor no devolvió una respuesta válida.');
                return;
            }

            if (response.ok && data.success) {
                setMessage(`¡Éxito! ${data.message}`);
                addLogEntry('Carga Masiva de Inventario', `Archivo: ${file?.name || 'CSV'}, Modo: ${mode === 'all' ? 'Todo' : 'Solo nuevos'}`);
                await refreshInventory();
                setFile(null);
                setPendingItems([]);
                setDuplicatesFound([]);
                setDuplicateSerialNumbers([]);

                const fileInput = document.getElementById('bulk-file') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
            } else {
                setMessage(`Error: ${data.message || 'Error desconocido'}`);
            }
        } catch (error) {
            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    setMessage('Error: La operación tardó demasiado tiempo.');
                } else {
                    setMessage(`Error: ${error.message}`);
                }
            } else {
                setMessage('Error desconocido al conectar con el servidor.');
            }
        } finally {
            setUploading(false);
        }
    };

    // Handle user's choice from duplicate modal
    const handleDuplicateChoice = async (choice: 'update-all' | 'new-only' | 'cancel') => {
        setShowDuplicateModal(false);

        if (choice === 'cancel') {
            setMessage('Carga cancelada.');
            setPendingItems([]);
            setDuplicatesFound([]);
            setDuplicateSerialNumbers([]);
            return;
        }

        setUploading(true);
        setMessage('Procesando...');

        if (choice === 'update-all') {
            await processUpload(pendingItems, 'all');
        } else {
            await processUpload(pendingItems, 'new-only', duplicateSerialNumbers);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setMessage('Por favor, seleccione un archivo CSV.');
            return;
        }

        if (!baseUrl) {
            setMessage('Error: URL del backend no configurada.');
            return;
        }

        setUploading(true);
        setMessage('Verificando duplicados...');

        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target?.result as string;
            const rows = text.split('\n').filter(row => row.trim());
            const headers = rows[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

            const items = rows.slice(1).map(row => {
                const values = row.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
                const obj: any = {};
                headers.forEach((header, i) => {
                    obj[header] = values[i];
                });
                return obj;
            });

            // Extract serial numbers for duplicate check
            const serialNumbers = items.map(item => item.serialNumber).filter(sn => sn);

            try {
                // Check for duplicates first
                const checkUrl = `${baseUrl}/api/inventory/check-duplicates`;
                const checkResponse = await fetch(checkUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ serialNumbers })
                });

                const contentType = checkResponse.headers.get('content-type');
                if (contentType && contentType.includes('text/html')) {
                    // Fallback: proceed without duplicate check
                    console.warn('Duplicate check endpoint not available, proceeding with upload');
                    await processUpload(items, 'all');
                    return;
                }

                const checkData = await checkResponse.json();

                if (checkData.success && checkData.duplicates && checkData.duplicates.length > 0) {
                    // Duplicates found - show modal
                    setDuplicatesFound(checkData.existingEquipment || []);
                    setDuplicateSerialNumbers(checkData.duplicates);
                    setPendingItems(items);
                    setShowDuplicateModal(true);
                    setUploading(false);
                    setMessage('');
                } else {
                    // No duplicates - proceed with upload
                    await processUpload(items, 'all');
                }
            } catch (error) {
                console.error('Error checking duplicates:', error);
                // If check fails, proceed with regular upload
                await processUpload(items, 'all');
            }
        };
        reader.readAsText(file);
    };


    const handleDownload = () => {
        const headers = ["name", "brand", "model", "serialNumber", "location", "status", "lastMaintenanceDate", "nextMaintenanceDate"];
        const csvRows = [headers.join(','), ...equipment.map(row => headers.map(f => `"${String(row[f as keyof typeof row] || '').replace(/"/g, '""')}"`).join(','))];
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'inventario_sigemed.csv';
        link.click();
    };

    const filteredInventoryForEditing = useMemo(() => {
        return equipment.filter(eq => {
            const { name, brand, location, serialNumber } = editFilters;
            if (name !== 'ALL' && eq.name !== name) return false;
            if (brand !== 'ALL' && eq.brand !== brand) return false;
            if (location !== 'ALL' && eq.location !== location) return false;
            if (serialNumber && !eq.serialNumber.toLowerCase().includes(serialNumber.toLowerCase())) return false;
            return true;
        });
    }, [equipment, editFilters]);

    return (
        <div className="pb-10">
            {/* Duplicate Confirmation Modal */}
            {showDuplicateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center mb-4">
                            <svg className="h-8 w-8 text-yellow-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                                Se encontraron equipos duplicados
                            </h2>
                        </div>

                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            Los siguientes <strong>{duplicatesFound.length}</strong> número(s) de serie ya existen en el inventario:
                        </p>

                        <div className="bg-gray-50 dark:bg-slate-700 rounded-md p-3 mb-4 max-h-40 overflow-y-auto">
                            <ul className="space-y-1 text-sm">
                                {duplicatesFound.slice(0, 10).map((eq, idx) => (
                                    <li key={idx} className="flex items-center text-gray-700 dark:text-gray-300">
                                        <span className="font-mono bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-2 py-0.5 rounded mr-2">
                                            {eq.serialNumber}
                                        </span>
                                        <span className="truncate">{eq.name} - {eq.brand}</span>
                                    </li>
                                ))}
                                {duplicatesFound.length > 10 && (
                                    <li className="text-gray-500 dark:text-gray-400 italic">
                                        ... y {duplicatesFound.length - 10} más
                                    </li>
                                )}
                            </ul>
                        </div>

                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            ¿Qué desea hacer?
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => handleDuplicateChoice('update-all')}
                                className="flex-1 bg-brand-blue text-white px-4 py-3 rounded-md hover:bg-brand-blue-dark font-medium"
                            >
                                Actualizar todo
                                <span className="block text-xs font-normal opacity-80">
                                    Nuevos + Actualizar existentes
                                </span>
                            </button>
                            <button
                                onClick={() => handleDuplicateChoice('new-only')}
                                className="flex-1 bg-green-600 text-white px-4 py-3 rounded-md hover:bg-green-700 font-medium"
                            >
                                Solo agregar nuevos
                                <span className="block text-xs font-normal opacity-80">
                                    Omitir {duplicatesFound.length} duplicado(s)
                                </span>
                            </button>
                        </div>

                        <button
                            onClick={() => handleDuplicateChoice('cancel')}
                            className="w-full mt-3 bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {isEditModalOpen && editingEquipment && (
                <EditEquipmentModal equipment={editingEquipment} onClose={() => setIsEditModalOpen(false)} onSave={async (updated) => {
                    updateEquipment(updated);
                    setIsEditModalOpen(false);
                }} />
            )}

            {isAddModalOpen && (
                <AddEquipmentModal onClose={() => setIsAddModalOpen(false)} onSave={async (newEq) => {
                    const result = await addEquipment(newEq);
                    if (result.success) {
                        addLogEntry('Creación Manual de Equipo', `Equipo: ${newEq.name}`);
                        setIsAddModalOpen(false);
                        setMessage(result.message);
                        setTimeout(() => setMessage(''), 3000);
                    } else {
                        alert(result.message); // Show the specific error message from the server
                    }
                }} />
            )}

            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Configuración e Inventario</h1>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md mb-8">
                <div className="flex justify-between items-center mb-4 border-b dark:border-gray-700 pb-2">
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-100">Carga Masiva de Inventario (CSV)</h2>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-brand-blue text-white px-4 py-2 rounded-md hover:bg-brand-blue-dark text-sm"
                    >
                        + Agregar Equipo Individual
                    </button>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 p-4 rounded-md mb-4">
                    <h3 className="font-bold mb-2">Instrucciones del CSV</h3>
                    <p className="text-sm">El archivo debe tener las columnas exactas: <strong>name, brand, model, serialNumber, location, status, lastMaintenanceDate, nextMaintenanceDate</strong>.</p>
                </div>

                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                    <input type="file" id="bulk-file" className="hidden" accept=".csv" onChange={handleFileChange} disabled={uploading} />
                    <label htmlFor="bulk-file" className="cursor-pointer inline-flex items-center px-4 py-2 bg-white dark:bg-slate-700 text-brand-blue rounded-md border border-brand-blue hover:bg-blue-50">
                        Seleccionar Archivo
                    </label>
                    {file && <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{file.name}</p>}
                </div>

                <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="w-full mt-4 bg-brand-blue text-white py-2 rounded-md hover:bg-brand-blue-dark disabled:bg-gray-400"
                >
                    {uploading ? 'Procesando...' : 'Cargar Inventario a Base de Datos'}
                </button>
                {message && <p className={`mt-4 text-center text-sm whitespace-pre-line ${message.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>{message}</p>}
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-100 mb-4">Exportar y Respaldo</h2>
                <button onClick={handleDownload} className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700">
                    Descargar Inventario Actual (CSV)
                </button>
            </div>
        </div>
    );
};

export default SettingsPage;
