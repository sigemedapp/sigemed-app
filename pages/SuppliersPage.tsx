import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Supplier } from '../components/layout/types';

const SupplierModal: React.FC<{
    supplier: Partial<Supplier> | null;
    onClose: () => void;
    onSave: (supplier: Supplier) => void;
}> = ({ supplier, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<Supplier>>(
        supplier || {
            name: '',
            contactPerson: '',
            phone: '',
            email: '',
            address: '',
            specialty: '',
            catalogUrl: ''
        }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalSupplier: Supplier = {
            id: formData.id || `sup-${Date.now()}`,
            name: formData.name || '',
            contactPerson: formData.contactPerson || '',
            phone: formData.phone || '',
            email: formData.email || '',
            address: formData.address || '',
            specialty: formData.specialty || '',
            catalogUrl: formData.catalogUrl || ''
        };
        onSave(finalSupplier);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">{supplier?.id ? 'Editar Proveedor' : 'Agregar Proveedor'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="name" value={formData.name} onChange={handleChange} placeholder="Nombre del Proveedor" required className="w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-gray-600 dark:text-gray-200" />
                        <input name="contactPerson" value={formData.contactPerson} onChange={handleChange} placeholder="Persona de Contacto" required className="w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-gray-600 dark:text-gray-200" />
                        <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Teléfono" required className="w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-gray-600 dark:text-gray-200" />
                        <input name="email" value={formData.email} onChange={handleChange} placeholder="Correo Electrónico" type="email" required className="w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-gray-600 dark:text-gray-200" />
                        <textarea name="address" value={formData.address} onChange={handleChange} placeholder="Dirección" rows={2} className="md:col-span-2 w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-gray-600 dark:text-gray-200"></textarea>
                        <input name="specialty" value={formData.specialty} onChange={handleChange} placeholder="Especialidad (Ej: Refacciones, Calibración)" required className="w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-gray-600 dark:text-gray-200" />
                        <input name="catalogUrl" value={formData.catalogUrl} onChange={handleChange} placeholder="URL del Catálogo (Opcional)" className="w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-gray-600 dark:text-gray-200" />
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">Cancelar</button>
                        <button type="submit" className="bg-brand-blue text-white px-4 py-2 rounded-md hover:bg-brand-blue-dark">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const DeleteModal: React.FC<{ supplier: Supplier, onClose: () => void, onConfirm: () => void }> = ({ supplier, onClose, onConfirm }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Confirmar Eliminación</h2>
            <p className="text-gray-600 dark:text-gray-300">¿Está seguro de que desea eliminar al proveedor <strong>{supplier.name}</strong>? Esta acción no se puede deshacer.</p>
            <div className="mt-6 flex justify-end space-x-3">
                <button onClick={onClose} className="bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">Cancelar</button>
                <button onClick={onConfirm} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">Eliminar</button>
            </div>
        </div>
    </div>
);


const SuppliersPage: React.FC = () => {
    // FIX: Replaced useInventory and useAuditLog with useApp to resolve module errors.
    const { suppliers, addSupplier, updateSupplier, deleteSupplier, addLogEntry } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);

    const filteredSuppliers = useMemo(() => {
        const lowerSearch = searchTerm.toLowerCase();
        if (!lowerSearch) return suppliers;
        return suppliers.filter(s =>
            s.name.toLowerCase().includes(lowerSearch) ||
            s.contactPerson.toLowerCase().includes(lowerSearch) ||
            s.specialty.toLowerCase().includes(lowerSearch)
        );
    }, [searchTerm, suppliers]);

    const handleOpenModal = (supplier: Supplier | null = null) => {
        setEditingSupplier(supplier);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSupplier(null);
    };

    const handleSave = (supplier: Supplier) => {
        if (editingSupplier) {
            updateSupplier(supplier);
            addLogEntry('Actualizó Proveedor', `Nombre: ${supplier.name}`);
        } else {
            addSupplier(supplier);
            addLogEntry('Agregó Proveedor', `Nombre: ${supplier.name}`);
        }
        handleCloseModal();
    };

    const handleOpenDeleteModal = (supplier: Supplier) => {
        setDeletingSupplier(supplier);
    };
    
    const handleConfirmDelete = () => {
        if (deletingSupplier) {
            deleteSupplier(deletingSupplier.id);
            addLogEntry('Eliminó Proveedor', `Nombre: ${deletingSupplier.name}`);
            setDeletingSupplier(null);
        }
    };

    return (
        <div>
            {isModalOpen && <SupplierModal supplier={editingSupplier} onClose={handleCloseModal} onSave={handleSave} />}
            {deletingSupplier && <DeleteModal supplier={deletingSupplier} onClose={() => setDeletingSupplier(null)} onConfirm={handleConfirmDelete} />}

            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4 md:mb-0">Directorio de Proveedores</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-brand-blue text-white px-4 py-2 rounded-md hover:bg-brand-blue-dark self-start md:self-auto flex items-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    Agregar Proveedor
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md mb-6">
                <input
                    type="text"
                    placeholder="Buscar por nombre, contacto o especialidad..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-blue focus:border-brand-blue dark:bg-slate-700 dark:border-gray-600 dark:text-gray-200"
                />
            </div>
            
             {/* Desktop Table */}
            <div className="hidden md:block bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full whitespace-nowrap">
                    <thead className="text-left font-bold bg-gray-50 dark:bg-slate-700 border-b dark:border-gray-700 text-gray-800 dark:text-gray-300">
                        <tr>
                            <th className="px-6 py-3">Proveedor</th>
                            <th className="px-6 py-3">Contacto</th>
                            <th className="px-6 py-3">Especialidad</th>
                            <th className="px-6 py-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-700 text-gray-900 dark:text-gray-200">
                        {filteredSuppliers.map(s => (
                            <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                <td className="px-6 py-4">
                                    <div className="font-semibold">{s.name}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{s.address}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div>{s.contactPerson}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{s.email} | {s.phone}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 text-xs font-medium leading-5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                                        {s.specialty}
                                    </span>
                                </td>
                                <td className="px-6 py-4 space-x-2 whitespace-nowrap">
                                    <button onClick={() => handleOpenModal(s)} className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200">Editar</button>
                                    <button onClick={() => handleOpenDeleteModal(s)} className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded-full hover:bg-red-200">Eliminar</button>
                                    {s.catalogUrl && s.catalogUrl !== '#' && (
                                        <a href={s.catalogUrl} target="_blank" rel="noopener noreferrer" className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full hover:bg-green-200">
                                            Catálogo
                                        </a>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {filteredSuppliers.map(s => (
                    <div key={s.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 space-y-3">
                        <div className="flex justify-between items-start">
                             <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{s.name}</h3>
                             <span className="px-2 py-1 text-xs font-medium leading-5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                                {s.specialty}
                             </span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300 border-t dark:border-gray-700 pt-3 mt-2">
                             <p><strong>Contacto:</strong> {s.contactPerson}</p>
                             <p><strong>Tel:</strong> {s.phone}</p>
                             <p><strong>Email:</strong> {s.email}</p>
                             <p><strong>Dirección:</strong> {s.address}</p>
                        </div>
                        <div className="border-t dark:border-gray-700 pt-3 flex flex-wrap gap-2">
                             <button onClick={() => handleOpenModal(s)} className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200">Editar</button>
                            <button onClick={() => handleOpenDeleteModal(s)} className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded-full hover:bg-red-200">Eliminar</button>
                            {s.catalogUrl && s.catalogUrl !== '#' && (
                                <a href={s.catalogUrl} target="_blank" rel="noopener noreferrer" className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full hover:bg-green-200">
                                    Catálogo
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {filteredSuppliers.length === 0 && (
                <p className="text-center py-8 text-gray-500 dark:text-gray-400">No se encontraron proveedores.</p>
            )}

        </div>
    );
};

export default SuppliersPage;
