import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MOCK_PROCEDURES } from '../constants';
import { ProcedureManual, Role } from '../components/layout/types';

const AdminUploadPanel: React.FC<{ onAddManual: (manual: ProcedureManual) => void }> = ({ onAddManual }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !description || !category || !file) {
            setMessage('Por favor, complete todos los campos y seleccione un archivo.');
            return;
        }
        setMessage('Subiendo manual... (simulación)');
        setTimeout(() => {
            const newManual: ProcedureManual = {
                id: `proc-${Date.now()}`,
                name,
                description,
                category,
                fileUrl: '#', // Placeholder URL
            };
            onAddManual(newManual);
            setMessage('¡Manual subido con éxito!');
            setName('');
            setDescription('');
            setCategory('');
            setFile(null);
            (e.target as HTMLFormElement).reset();
        }, 1500);
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
                         <label className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-brand-blue hover:file:bg-blue-100">
                             <input type="file" onChange={e => setFile(e.target.files ? e.target.files[0] : null)} required accept=".pdf" className="sr-only" />
                             <span>{file ? file.name : 'Seleccionar archivo PDF...'}</span>
                         </label>
                    </div>
                </div>
                <div className="mt-4 flex justify-end items-center">
                    {message && <p className="text-sm text-gray-600 mr-4">{message}</p>}
                    <button type="submit" className="bg-brand-blue text-white px-4 py-2 rounded-md hover:bg-brand-blue-dark">Subir Manual</button>
                </div>
            </form>
        </div>
    );
};

const ProceduresPage: React.FC = () => {
    // FIX: Replaced useAuth with useApp to resolve module errors.
    const { user, addLogEntry } = useApp();
    const [manuals, setManuals] = useState<ProcedureManual[]>(MOCK_PROCEDURES);

    const handleAddManual = (manual: ProcedureManual) => {
        setManuals(prev => [manual, ...prev]);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Manual de Procedimientos</h1>
            
            {user?.role === Role.SUPER_ADMIN && <AdminUploadPanel onAddManual={handleAddManual} />}

            <div className="space-y-4">
                {manuals.map(manual => (
                    <div key={manual.id} className="bg-white p-5 rounded-lg shadow-md flex justify-between items-center">
                        <div>
                            <p className="text-sm font-semibold text-brand-blue">{manual.category}</p>
                            <h3 className="text-lg font-bold text-gray-800">{manual.name}</h3>
                            <p className="text-gray-600 text-sm mt-1">{manual.description}</p>
                        </div>
                        <a 
                            href={manual.fileUrl} 
                            download 
                            onClick={() => addLogEntry('Descargó Manual de Procedimiento', `Manual: ${manual.name}`)}
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center whitespace-nowrap"
                        >
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Descargar
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProceduresPage;