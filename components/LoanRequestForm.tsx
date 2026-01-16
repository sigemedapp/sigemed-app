import React, { useState, useEffect } from 'react';
import { HOSPITAL_LOGO } from '../assets/hospital_logo';
import { Equipment, User, Role, EquipmentStatus } from './layout/types';
import { useApp } from '../context/AppContext';
import { generateLoanRequestPDF, LoanRequestData } from '../utils/pdfGenerator';

interface LoanRequestFormProps {
    onCancel: () => void;
    currentUser: User | null;
    onSuccess: () => void;
}

interface LoanItem {
    name: string;
    brand: string;
    model: string;
    accessories: string;
    quantity: number;
}

const LoanRequestForm: React.FC<LoanRequestFormProps> = ({ onCancel, currentUser, onSuccess }) => {
    const { addEquipment, addLogEntry } = useApp();
    const [folio, setFolio] = useState(`F-IBM-06-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`);

    // Solicitante
    const [requesterName, setRequesterName] = useState(currentUser?.name || '');
    const [requesterPosition, setRequesterPosition] = useState(currentUser?.role || '');
    const [requestingArea, setRequestingArea] = useState(currentUser?.area || '');
    const [requestDate, setRequestDate] = useState(new Date().toISOString().split('T')[0]);

    // Request
    const [reason, setReason] = useState('');
    const [duration, setDuration] = useState('');

    // Items
    const [items, setItems] = useState<LoanItem[]>([{ name: '', brand: '', model: '', accessories: '', quantity: 1 }]);

    // Provider
    const [providerCompany, setProviderCompany] = useState('');
    const [providerAddress, setProviderAddress] = useState('');
    const [providerContacts, setProviderContacts] = useState('');

    const handleItemChange = (index: number, field: keyof LoanItem, value: string | number) => {
        const newItems = [...items];
        (newItems[index] as any)[field] = value;
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { name: '', brand: '', model: '', accessories: '', quantity: 1 }]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Generate Data
        const formData: LoanRequestData = {
            folio,
            requesterName,
            requesterPosition,
            requestingArea,
            requestDate,
            reason,
            duration,
            items,
            providerCompany,
            providerAddress,
            providerContacts,
            authorizedBy: 'Dirección Médica' // Placeholder or input
        };

        // 2. Generate PDF
        generateLoanRequestPDF(formData);

        // 3. Add to Inventory (Automatic as per requirement)
        let addedCount = 0;
        let errors = 0;

        for (const item of items) {
            for (let i = 0; i < item.quantity; i++) {
                const tempSN = `LOAN-${item.name.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}-${i}`;

                const success = await addEquipment({
                    name: item.name,
                    brand: item.brand,
                    model: item.model,
                    serialNumber: tempSN,
                    location: requestingArea || 'Comodato (Por asignar)',
                    status: EquipmentStatus.LOAN,
                    lastMaintenanceDate: requestDate, // Asumimos fecha de solicitud como inicio
                    nextMaintenanceDate: '',
                    imageUrl: ''
                });

                if (success) {
                    addedCount++;
                } else {
                    errors++;
                }
            }
        }

        if (errors > 0) {
            alert(`Se generó la solicitud pero hubo problemas al registrar ${errors} equipos en el inventario.`);
        } else if (addedCount > 0) {
            // Optional: Notify success quietly or via log
            addLogEntry('Creó Solicitud de Comodato', `Folio: ${folio}, Equipos agregados: ${addedCount}`);
        }


        onSuccess();
    };

    return (
        <div className="bg-white p-8 max-w-4xl mx-auto shadow-2xl rounded-lg text-gray-900 border border-gray-300 relative h-[90vh] overflow-y-auto">
            <button onClick={onCancel} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 font-bold text-xl">&times;</button>

            {/* Header */}
            <div className="flex border-b-2 border-gray-800 mb-6">
                <div className="w-1/4 p-2 flex items-center justify-center border-r border-gray-300">
                    <img
                        src={HOSPITAL_LOGO}
                        alt="Hospitales Polanco"
                        className="h-12 object-contain filter drop-shadow-md dark:invert"
                    />
                </div>
                <div className="w-1/2 bg-gray-800 text-white flex flex-col items-center justify-center p-2 text-center">
                    <h2 className="text-xl font-bold uppercase tracking-wider">SOLICITUD DE</h2>
                    <h2 className="text-xl font-bold uppercase tracking-wider">EQUIPO EN COMODATO</h2>
                </div>
                <div className="w-1/4 text-xs">
                    <div className="flex justify-between p-1 border-b border-gray-300 font-bold bg-gray-100">
                        <span>F-IBM-06</span>
                    </div>
                    <div className="flex justify-between p-1 border-b border-gray-300">
                        <span>Emisión:</span><span>Dic 2025</span>
                    </div>
                    <div className="flex justify-between p-1 border-b border-gray-300">
                        <span>Revisión:</span><span>Dic 2027</span>
                    </div>
                    <div className="flex justify-between p-1 border-b border-gray-300">
                        <span>Versión</span><span>1</span>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Datos del Solicitante */}
                <div className="border border-gray-300">
                    <div className="bg-gray-600 text-white font-bold px-2 py-1 text-sm text-center">Datos del solicitante</div>
                    <div className="grid grid-cols-4 gap-4 p-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700">Nombre</label>
                            <input type="text" value={requesterName} onChange={e => setRequesterName(e.target.value)} className="w-full border-b border-gray-300 focus:outline-none focus:border-blue-500 text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700">Puesto</label>
                            <input type="text" value={requesterPosition} onChange={e => setRequesterPosition(e.target.value)} className="w-full border-b border-gray-300 focus:outline-none focus:border-blue-500 text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700">Área solicitante</label>
                            <input type="text" value={requestingArea} onChange={e => setRequestingArea(e.target.value)} className="w-full border-b border-gray-300 focus:outline-none focus:border-blue-500 text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700">Fecha</label>
                            <input type="date" value={requestDate} onChange={e => setRequestDate(e.target.value)} className="w-full border-b border-gray-300 focus:outline-none focus:border-blue-500 text-sm" />
                        </div>
                    </div>
                </div>

                {/* Motivo y Tiempo */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="border border-gray-300">
                        <div className="bg-gray-600 text-white font-bold px-2 py-1 text-sm text-center">Motivo de solicitud</div>
                        <div className="p-2">
                            <textarea value={reason} onChange={e => setReason(e.target.value)} className="w-full h-20 border-none resize-none focus:ring-0 text-sm" placeholder="Describa el motivo..."></textarea>
                        </div>
                    </div>
                    <div className="border border-gray-300">
                        <div className="bg-gray-600 text-white font-bold px-2 py-1 text-sm text-center">Tiempo en comodato</div>
                        <div className="p-2">
                            <input type="text" value={duration} onChange={e => setDuration(e.target.value)} className="w-full border-b border-gray-300 focus:outline-none focus:border-blue-500 text-sm mt-4" placeholder="Ej. 1 mes, Indefinido..." />
                        </div>
                    </div>
                </div>

                {/* Datos del Equipo (Table) */}
                <div className="border border-gray-300">
                    <div className="bg-gray-600 text-white font-bold px-2 py-1 text-sm text-center">Datos del equipo</div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                <tr>
                                    <th className="px-2 py-2 border-r">Nombre del equipo</th>
                                    <th className="px-2 py-2 border-r">Marca</th>
                                    <th className="px-2 py-2 border-r">Modelo</th>
                                    <th className="px-2 py-2 border-r">Accesorios / Insumos</th>
                                    <th className="px-2 py-2 border-r w-20">Cant.</th>
                                    <th className="px-2 py-2 w-10"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => (
                                    <tr key={index} className="border-b">
                                        <td className="px-2 py-1 border-r"><input type="text" value={item.name} onChange={e => handleItemChange(index, 'name', e.target.value)} className="w-full bg-transparent focus:outline-none" placeholder="Nombre" required /></td>
                                        <td className="px-2 py-1 border-r"><input type="text" value={item.brand} onChange={e => handleItemChange(index, 'brand', e.target.value)} className="w-full bg-transparent focus:outline-none" placeholder="Marca" /></td>
                                        <td className="px-2 py-1 border-r"><input type="text" value={item.model} onChange={e => handleItemChange(index, 'model', e.target.value)} className="w-full bg-transparent focus:outline-none" placeholder="Modelo" /></td>
                                        <td className="px-2 py-1 border-r"><input type="text" value={item.accessories} onChange={e => handleItemChange(index, 'accessories', e.target.value)} className="w-full bg-transparent focus:outline-none" placeholder="Cables, etc." /></td>
                                        <td className="px-2 py-1 border-r"><input type="number" min="1" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', parseInt(e.target.value))} className="w-full bg-transparent focus:outline-none" /></td>
                                        <td className="px-2 py-1 text-center">
                                            {items.length > 1 && (
                                                <button type="button" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700 font-bold">&times;</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-2 bg-gray-50 text-center">
                        <button type="button" onClick={addItem} className="text-blue-600 hover:text-blue-800 text-sm font-bold">+ Agregar Fila</button>
                    </div>
                </div>

                {/* Datos del Proveedor */}
                <div className="border border-gray-300">
                    <div className="bg-gray-600 text-white font-bold px-2 py-1 text-sm text-center">Datos del proveedor</div>
                    <div className="grid grid-cols-3 gap-4 p-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700">Empresa</label>
                            <input type="text" value={providerCompany} onChange={e => setProviderCompany(e.target.value)} className="w-full border-b border-gray-300 focus:outline-none focus:border-blue-500 text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700">Dirección</label>
                            <input type="text" value={providerAddress} onChange={e => setProviderAddress(e.target.value)} className="w-full border-b border-gray-300 focus:outline-none focus:border-blue-500 text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700">Contactos</label>
                            <input type="text" value={providerContacts} onChange={e => setProviderContacts(e.target.value)} className="w-full border-b border-gray-300 focus:outline-none focus:border-blue-500 text-sm" />
                        </div>
                    </div>
                </div>

                {/* Botones */}
                <div className="flex justify-end space-x-4 pt-4">
                    <button type="button" onClick={onCancel} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition">Cancelar</button>
                    <button type="submit" className="bg-brand-blue text-white px-6 py-2 rounded hover:bg-brand-blue-dark transition shadow-lg">Generar Solicitud y Guardar</button>
                </div>

                <div className="text-center text-xs text-gray-500 mt-8 border-t pt-2">
                    <p>Solicita: Ingeniería Biomédica (Usted)</p>
                    <p>Autoriza: Dirección Médica (Se requiere firma física)</p>
                </div>
            </form>
        </div>
    );
};

export default LoanRequestForm;
