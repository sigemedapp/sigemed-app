import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ProcedureManual, Role } from '../components/layout/types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const AdminUploadPanel: React.FC<{ onAddManual: (manual: ProcedureManual) => void }> = ({ onAddManual }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !description || !category || !file) {
            setMessage('Por favor, complete todos los campos y seleccione un archivo.');
            return;
        }

        setIsSubmitting(true);
        setMessage('Subiendo manual...');

        const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });

        try {
            const fileData = await toBase64(file);
            const newManualPayload = {
                id: `proc-${Date.now()}`,
                name,
                description,
                category,
                fileName: file.name,
                fileData // Send base64 data
            };

            const response = await fetch(`${BASE_URL}/api/resources/procedures`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newManualPayload)
            });

            if (response.ok) {
                const result = await response.json();
                // Construct the object for local state immediately, but better to re-fetch or use returned url
                const savedManual: ProcedureManual = {
                    ...newManualPayload,
                    fileUrl: result.fileUrl // Backend returns the relative path
                };
                onAddManual(savedManual);
                setMessage('¡Manual subido con éxito!');
                setName('');
                setDescription('');
                setCategory('');
                setFile(null);
                (e.target as HTMLFormElement).reset();
            } else {
                setMessage('Error al subir el manual.');
            }
        } catch (error) {
            console.error('Error adding manual:', error);
            setMessage('Error de conexión.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Subir Nuevo Manual de Procedimiento</h2>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input type="text" placeholder="Nombre del Manual" value={name} onChange={e => setName(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    <input type="text" placeholder="Categoría" value={category} onChange={e => setCategory(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    <textarea placeholder="Descripción" value={description} onChange={e => setDescription(e.target.value)} required rows={3} className="md:col-span-2 w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
                    <div className="md:col-span-2">
                        <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-blue transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            <span>{file ? file.name : 'Seleccionar archivo PDF...'}</span>
                            <input type="file" onChange={e => setFile(e.target.files ? e.target.files[0] : null)} required accept=".pdf" className="sr-only" />
                        </label>
                        {file && (
                            <button
                                type="button"
                                onClick={() => setFile(null)}
                                className="ml-2 text-sm text-red-500 hover:text-red-700"
                                title="Quitar archivo"
                            >
                                (Quitar)
                            </button>
                        )}
                    </div>
                </div>
                <div className="mt-4 flex justify-end items-center">
                    {message && <p className={`text-sm mr-4 ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>}
                    <button type="submit" disabled={isSubmitting} className={`bg-brand-blue text-white px-4 py-2 rounded-md hover:bg-brand-blue-dark ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        {isSubmitting ? 'Subiendo...' : 'Subir Manual'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const ProceduresPage: React.FC = () => {
    const { user, addLogEntry } = useApp();
    const [manuals, setManuals] = useState<ProcedureManual[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchManuals = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/resources/procedures`);
            if (response.ok) {
                const data = await response.json();
                setManuals(data);
            }
        } catch (error) {
            console.error("Failed to fetch manuals", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchManuals();
    }, []);

    const handleAddManual = (manual: ProcedureManual) => {
        setManuals(prev => [manual, ...prev]);
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`¿Estás seguro de que quieres eliminar el manual "${name}"?`)) return;

        try {
            const response = await fetch(`${BASE_URL}/api/resources/procedures/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setManuals(prev => prev.filter(m => m.id !== id));
                addLogEntry('Eliminó Manual de Procedimiento', `Manual: ${name}`);
            } else {
                alert('Error al eliminar el manual');
            }
        } catch (error) {
            console.error('Error deleting manual:', error);
            alert('Error al conectar con el servidor');
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Manual de Procedimientos</h1>

            {user && [Role.SUPER_ADMIN, Role.SYSTEM_ADMIN].includes(user.role) && <AdminUploadPanel onAddManual={handleAddManual} />}

            {loading ? (
                <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
                </div>
            ) : (
                <div className="space-y-4">
                    {manuals.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No hay manuales disponibles.</p>
                    ) : (
                        manuals.map(manual => (
                            <div key={manual.id} className="bg-white p-5 rounded-lg shadow-md flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-semibold text-brand-blue">{manual.category}</p>
                                    <h3 className="text-lg font-bold text-gray-800">{manual.name}</h3>
                                    <p className="text-gray-600 text-sm mt-1">{manual.description}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <a
                                        href={manual.fileUrl.startsWith('http') ? manual.fileUrl : `${BASE_URL}${manual.fileUrl}`}
                                        download
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => addLogEntry('Descargó Manual de Procedimiento', `Manual: ${manual.name}`)}
                                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center whitespace-nowrap"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                        Descargar
                                    </a>
                                    {user && [Role.SUPER_ADMIN, Role.SYSTEM_ADMIN].includes(user.role) && (
                                        <button
                                            onClick={() => handleDelete(manual.id, manual.name)}
                                            className="bg-red-100 text-red-600 px-3 py-2 rounded-md hover:bg-red-200"
                                            title="Eliminar Manual"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default ProceduresPage;