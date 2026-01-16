
import React, { useState, useEffect } from 'react';
import { HOSPITAL_LOGO } from '../assets/hospital_logo';
import { Equipment, User, EquipmentStatus } from './layout/types';
import { generateInternalDeparturePDF, InternalDepartureData } from '../utils/pdfGenerator';
import { useApp } from '../context/AppContext';

interface InternalDepartureFormProps {
    equipment: Equipment;
    currentUser: User | null;
    onCancel: () => void;
    onSuccess: () => void;
}

const InternalDepartureForm: React.FC<InternalDepartureFormProps> = ({ equipment, currentUser, onCancel, onSuccess }) => {
    const { addLogEntry, updateEquipment } = useApp();

    // Auto-filled data
    const [folio, setFolio] = useState(`F-IBM-10-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`);

    // User Input
    const [destination, setDestination] = useState('');
    const [reason, setReason] = useState<'Donación' | 'Préstamo' | 'Devolución' | 'Otro'>('Préstamo');
    const [reasonOther, setReasonOther] = useState('');
    const [accessories, setAccessories] = useState('');
    const [description, setDescription] = useState('');
    const [observations, setObservations] = useState('');
    const [inventoryNumber, setInventoryNumber] = useState(String(equipment.id).slice(0, 8)); // Default to partial ID

    // Signatures / Personnel
    const [receiver, setReceiver] = useState('');
    const [receiverPosition, setReceiverPosition] = useState('');

    // Evidence
    const [images, setImages] = useState<string[]>([]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    setImages(prev => [...prev, reader.result as string]);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const data: InternalDepartureData = {
            folio,
            date: new Date().toLocaleDateString(),
            location: destination,
            equipmentName: equipment.name,
            brand: equipment.brand,
            model: equipment.model,
            serialNumber: equipment.serialNumber,
            inventoryNumber,
            accessories,
            description,
            imageUrls: images,
            reason,
            reasonOther,
            observations,
            sender: currentUser?.name || 'Ingeniería Biomédica',
            receiver,
            receiverPosition
        };

        generateInternalDeparturePDF(data);

        // Determine new status based on reason
        let newStatus = EquipmentStatus.OUT_OF_SERVICE; // Default fallback
        switch (reason) {
            case 'Donación': newStatus = EquipmentStatus.DONATION; break;
            case 'Préstamo': newStatus = EquipmentStatus.LOAN; break;
            case 'Devolución': newStatus = EquipmentStatus.RETURN; break;
            case 'Otro': newStatus = EquipmentStatus.OTHER; break;
        }

        // Update equipment status
        if (updateEquipment) {
            await updateEquipment({ ...equipment, status: newStatus });
            addLogEntry('Generó Salida Interna', `Folio: ${folio}, Equipo: ${equipment.name} -> ${destination} (Nuevo Estado: ${newStatus})`);
        } else {
            // Fallback if updateEquipment is not available directly (should be from context)
            // But wait, the component body destructured ONLY addLogEntry. I need to get updateEquipment.
            addLogEntry('Generó Salida Interna', `Folio: ${folio}, Equipo: ${equipment.name} -> ${destination}`);
        }

        // Notify success
        alert(`Formato de Salida Interna generado correctamente. El equipo ha pasado a estado: ${newStatus}.`);
        onSuccess();
    };

    return (
        <div className="bg-white p-6 max-w-4xl mx-auto shadow-2xl rounded-lg text-gray-900 border border-gray-300 relative h-[90vh] overflow-y-auto">
            <button onClick={onCancel} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 font-bold text-xl">&times;</button>

            {/* Header */}
            <div className="flex border-b-2 border-gray-800 mb-6">
                <div className="w-1/4 p-2 flex items-center justify-center border-r border-gray-300">
                    <img src={HOSPITAL_LOGO} alt="Hospitales Polanco" className="h-12 object-contain filter drop-shadow-md dark:invert" />
                </div>
                <div className="w-1/2 bg-gray-800 text-white flex flex-col items-center justify-center p-2 text-center">
                    <h2 className="text-xl font-bold uppercase tracking-wider">SALIDA INTERNA</h2>
                    <h2 className="text-xl font-bold uppercase tracking-wider">DE EQUIPO MÉDICO</h2>
                </div>
                <div className="w-1/4 text-xs">
                    <div className="flex justify-between p-1 border-b border-gray-300 font-bold bg-gray-100">
                        <span>F-IBM-10</span>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Auto-filled Info */}
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded border">
                    <div>
                        <label className="block text-xs font-bold text-gray-500">Folio</label>
                        <p className="font-mono">{folio}</p>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500">Equipo</label>
                        <p className="font-bold">{equipment.name} ({equipment.brand} - {equipment.model})</p>
                    </div>
                </div>

                {/* Section 1: details */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700">Ubicación destino / Salida</label>
                        <input type="text" value={destination} onChange={e => setDestination(e.target.value)} className="w-full border p-2 rounded" placeholder="Ej. Terapia Intensiva, Almacén..." required />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700">No. de Inventario</label>
                        <input type="text" value={inventoryNumber} onChange={e => setInventoryNumber(e.target.value)} className="w-full border p-2 rounded" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700">Partes y/o accesorios</label>
                    <textarea value={accessories} onChange={e => setAccessories(e.target.value)} className="w-full border p-2 rounded h-20" placeholder="Listar accesorios..."></textarea>
                </div>

                {/* Evidence */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Descripción y Evidencia Fotográfica</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full border p-2 rounded h-24 mb-2" placeholder="Descripción del estado físico..."></textarea>

                    <div className="flex items-center space-x-4">
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                        <span className="text-xs text-gray-400">Max 3 imágenes</span>
                    </div>

                    <div className="flex space-x-2 mt-2">
                        {images.map((img, idx) => (
                            <div key={idx} className="relative">
                                <img src={img} alt="Evidence" className="h-20 w-20 object-cover rounded border" />
                                <button type="button" onClick={() => removeImage(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">&times;</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Reason */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Motivo de salida</label>
                    <div className="flex flex-wrap gap-4">
                        {['Préstamo', 'Donación', 'Devolución', 'Otro'].map((r) => (
                            <label key={r} className="flex items-center space-x-2 cursor-pointer">
                                <input type="radio" name="reason" value={r} checked={reason === r} onChange={() => setReason(r as any)} className="form-radio text-blue-600" />
                                <span>{r}</span>
                            </label>
                        ))}
                    </div>
                    {reason === 'Otro' && (
                        <input type="text" value={reasonOther} onChange={e => setReasonOther(e.target.value)} className="mt-2 w-full border-b border-gray-300 focus:outline-none focus:border-blue-500" placeholder="Especifique..." />
                    )}
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700">Observaciones</label>
                    <textarea value={observations} onChange={e => setObservations(e.target.value)} className="w-full border p-2 rounded h-16"></textarea>
                </div>

                {/* Receiver Info */}
                <div className="bg-gray-50 p-4 rounded border">
                    <h3 className="font-bold text-sm mb-2 text-gray-700">Datos de Recepción</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-600">Nombre de quien recibe</label>
                            <input type="text" value={receiver} onChange={e => setReceiver(e.target.value)} className="w-full border p-2 rounded" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600">Cargo</label>
                            <input type="text" value={receiverPosition} onChange={e => setReceiverPosition(e.target.value)} className="w-full border p-2 rounded" />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4 border-t">
                    <button type="button" onClick={onCancel} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition">Cancelar</button>
                    <button type="submit" className="bg-brand-blue text-white px-6 py-2 rounded hover:bg-brand-blue-dark transition shadow-lg flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        Generar PDF
                    </button>
                </div>
            </form>
        </div>
    );
};

export default InternalDepartureForm;
