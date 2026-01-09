
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
    const baseUrl = process.env.VITE_API_BASE_URL || '';

    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');

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

    const handleUpload = async () => {
        if (!file) {
            setMessage('Por favor, seleccione un archivo CSV.');
            return;
        }

        // Validate backend URL is configured
        if (!baseUrl) {
            setMessage('Error: URL del backend no configurada. (VITE_API_BASE_URL)');
            console.error('VITE_API_BASE_URL is not configured. Please set it in .env.local file.');
            return;
        }

        setUploading(true);
        setMessage('Procesando archivo...');

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

            // Use the configured baseUrl
            const uploadUrl = `${baseUrl}/api/inventory/bulk-upload`;
            console.log('Uploading to:', uploadUrl, 'Items:', items.length);

            // Debug check
            if (uploadUrl.includes('undefined')) {
                throw new Error(`La URL del backend no es válida. (Actual: ${uploadUrl})`);
            }

            try {
                const response = await fetch(uploadUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ items })
                });

                const data = await response.json();
                if (response.ok) {
                    setMessage(`¡Éxito! ${data.message}`);
                    addLogEntry('Carga Masiva de Inventario', `Archivo: ${file.name}`);
                    await refreshInventory();
                    setFile(null);
                } else {
                    setMessage(`Error del servidor: ${data.message || 'Error desconocido'}`);
                    console.error('Server error:', response.status, data);
                }
            } catch (error) {
                console.error('Upload error:', error);
                setMessage(`Error al conectar con el servidor: ${error instanceof Error ? error.message : 'Error de red'}`);
            } finally {
                setUploading(false);
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
            {isEditModalOpen && editingEquipment && (
                <EditEquipmentModal equipment={editingEquipment} onClose={() => setIsEditModalOpen(false)} onSave={async (updated) => {
                    updateEquipment(updated);
                    setIsEditModalOpen(false);
                }} />
            )}

            {isAddModalOpen && (
                <AddEquipmentModal onClose={() => setIsAddModalOpen(false)} onSave={async (newEq) => {
                    const success = await addEquipment(newEq);
                    if (success) {
                        addLogEntry('Creación Manual de Equipo', `Equipo: ${newEq.name}`);
                        setIsAddModalOpen(false);
                        setMessage('Equipo agregado correctamente.'); // Reusing message state for simplicity feedback
                        setTimeout(() => setMessage(''), 3000);
                    } else {
                        alert('Error al agregar el equipo');
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
                {message && <p className={`mt-4 text-center text-sm ${message.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>{message}</p>}
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
