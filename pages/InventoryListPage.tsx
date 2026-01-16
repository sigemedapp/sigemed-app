import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Equipment, EquipmentStatus, Role, WorkOrderStatus, WorkOrderType } from '../components/layout/types';
import { useApp } from '../context/AppContext';
import { EquipmentStatusBadge } from '../components/EquipmentStatusBadge';

declare const jsQR: any;


const QRScannerModal: React.FC<{ onClose: () => void, onScan: (data: string) => void }> = ({ onClose, onScan }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [scanMessage, setScanMessage] = useState('Apunte la cámara al código QR...');

    useEffect(() => {
        let animationFrameId: number;
        let stream: MediaStream | null = null;

        const cleanup = () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };

        const tick = () => {
            if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
                const canvas = canvasRef.current;
                const video = videoRef.current;
                if (canvas) {
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        canvas.height = video.videoHeight;
                        canvas.width = video.videoWidth;
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        const code = jsQR(imageData.data, imageData.width, imageData.height, {
                            inversionAttempts: "dontInvert",
                        });
                        if (code) {
                            setScanMessage('¡Código detectado!');
                            // Draw a bounding box
                            const { topLeftCorner, topRightCorner, bottomLeftCorner, bottomRightCorner } = code.location;
                            ctx.beginPath();
                            ctx.moveTo(topLeftCorner.x, topLeftCorner.y);
                            ctx.lineTo(topRightCorner.x, topRightCorner.y);
                            ctx.lineTo(bottomRightCorner.x, bottomRightCorner.y);
                            ctx.lineTo(bottomLeftCorner.x, bottomLeftCorner.y);
                            ctx.closePath();
                            ctx.lineWidth = 4;
                            ctx.strokeStyle = '#48BB78';
                            ctx.stroke();

                            cleanup();
                            setTimeout(() => onScan(code.data), 300);
                            return;
                        }
                    }
                }
            }
            animationFrameId = requestAnimationFrame(tick);
        };

        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            .then(s => {
                stream = s;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.setAttribute("playsinline", "true");
                    videoRef.current.play();
                    animationFrameId = requestAnimationFrame(tick);
                }
            })
            .catch(err => {
                console.error("Error accessing camera:", err);
                setScanMessage('Error al acceder a la cámara. Verifique los permisos.');
            });

        return cleanup;
    }, [onScan]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-2xl font-bold text-gray-600 hover:text-black">&times;</button>
                <h2 className="text-xl font-bold mb-4 text-center">Escanear Código QR</h2>
                <div className="relative w-full aspect-square bg-gray-200 rounded-md overflow-hidden">
                    <video ref={videoRef} className="w-full h-full object-cover" />
                    <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
                </div>
                <p className="text-center mt-4 text-gray-700 font-medium">{scanMessage}</p>
            </div>
        </div>
    );
};

// Helper function for fuzzy matching
const fuzzyMatch = (term: string, text: string): boolean => {
    const lowerTerm = term.toLowerCase();
    const lowerText = text.toLowerCase();
    let termIndex = 0;
    let textIndex = 0;

    while (termIndex < lowerTerm.length && textIndex < lowerText.length) {
        if (lowerTerm[termIndex] === lowerText[textIndex]) {
            termIndex++;
        }
        textIndex++;
    }

    return termIndex === lowerTerm.length;
};

const InventoryListPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [showWelcomeToast, setShowWelcomeToast] = useState(false);
    const navigate = useNavigate();
    const { user, equipment, workOrders, addLogEntry, refreshInventory } = useApp();

    const getDynamicStatus = (equipmentItem: Equipment): EquipmentStatus => {
        const activeWorkOrder = workOrders.find(
            wo => wo.equipmentId === equipmentItem.id && wo.status !== WorkOrderStatus.CLOSED
        );

        if (activeWorkOrder) {
            // Only override if it's a failure or maintenance that impacts operation
            if (activeWorkOrder.type === WorkOrderType.CORRECTIVE || activeWorkOrder.status === WorkOrderStatus.REPORTED) {
                return EquipmentStatus.FAILURE_REPORTED;
            }
            // For other work orders (preventive, etc), we might want to show IN_MAINTENANCE vs original.
            // But if it's specialized status like LOAN, keep it.
            if ([EquipmentStatus.LOAN, EquipmentStatus.DONATION, EquipmentStatus.RETURN, EquipmentStatus.DIAGNOSIS, EquipmentStatus.PREVENTIVE, EquipmentStatus.CORRECTIVE, EquipmentStatus.OTHER].includes(equipmentItem.status)) {
                return equipmentItem.status;
            }
        }
        return equipmentItem.status;
    };

    const initialFilters = {
        area: 'ALL',
        name: 'ALL',
        brand: 'ALL',
        model: 'ALL',
        status: 'ALL',
    };
    const [filters, setFilters] = useState(initialFilters);

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 20;

    useEffect(() => {
        const justLoggedIn = sessionStorage.getItem('justLoggedIn');
        if (justLoggedIn && user && (user.role === Role.READ_ONLY || user.role === Role.AREA_HEAD)) {
            setShowWelcomeToast(true);
            sessionStorage.removeItem('justLoggedIn');

            const timer = setTimeout(() => {
                setShowWelcomeToast(false);
            }, 4000);

            return () => clearTimeout(timer);
        }
    }, [user]);

    const getAreaFromLocation = (location: string | null): string => (location || '').split(' - ')[0].trim();

    const { allAreas, allNames, allBrands, allModels } = useMemo(() => {
        const unique = (key: 'name' | 'brand' | 'model') => [...new Set(equipment.map(e => e[key] || ''))].sort();
        const uniqueAreas = [...new Set(equipment.map(e => getAreaFromLocation(e.location)))].filter(Boolean).sort();

        return {
            allAreas: uniqueAreas,
            allNames: unique('name'),
            allBrands: unique('brand'),
            allModels: unique('model')
        };
    }, [equipment]);

    const filteredEquipment = useMemo(() => {
        let filtered = equipment;

        if (filters.area !== 'ALL') filtered = filtered.filter(e => getAreaFromLocation(e.location) === filters.area);
        if (filters.name !== 'ALL') filtered = filtered.filter(e => e.name === filters.name);
        if (filters.brand !== 'ALL') filtered = filtered.filter(e => e.brand === filters.brand);
        if (filters.model !== 'ALL') filtered = filtered.filter(e => e.model === filters.model);
        if (filters.status !== 'ALL') {
            filtered = filtered.filter(e => getDynamicStatus(e) === filters.status);
        }

        if (searchTerm) {
            const lowercasedTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(e =>
                fuzzyMatch(searchTerm, e.name || '') ||
                fuzzyMatch(searchTerm, e.serialNumber || '') ||
                (e.brand || '').toLowerCase().includes(lowercasedTerm) ||
                (e.model || '').toLowerCase().includes(lowercasedTerm) ||
                (e.location || '').toLowerCase().includes(lowercasedTerm) ||
                String(e.id).toLowerCase() === lowercasedTerm
            );
        }

        return filtered;
    }, [searchTerm, filters, equipment, workOrders]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filters]);

    const totalPages = Math.ceil(filteredEquipment.length / ITEMS_PER_PAGE);

    const paginatedEquipment = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredEquipment.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredEquipment, currentPage]);

    const handlePageChange = (page: number) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        setFilters(initialFilters);
        setSearchTerm('');
    };

    const handleScanSuccess = (qrData: string) => {
        setIsScannerOpen(false);
        const equipmentExists = equipment.find(e => e.id === qrData);
        if (equipmentExists) {
            navigate(`/inventory/${qrData}`);
        } else {
            setSearchTerm(qrData);
        }
    };

    const handleExportToCSV = () => {
        if (filteredEquipment.length === 0) return;

        addLogEntry('Exportó Reporte de Inventario (CSV)');

        const headers = [
            "Nombre", "Marca", "Modelo", "N/S", "Ubicación", "Estado", "Próximo Mantenimiento"
        ];

        const formatCSVField = (data: any): string => {
            const value = String(data ?? '');
            if (/[",\n]/.test(value)) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        };

        const csvRows = [
            headers.join(','),
            ...filteredEquipment.map(eq => [
                formatCSVField(eq.name),
                formatCSVField(eq.brand),
                formatCSVField(eq.model),
                formatCSVField(eq.serialNumber),
                formatCSVField(eq.location),
                formatCSVField(getDynamicStatus(eq)),
                formatCSVField(new Date(eq.nextMaintenanceDate).toLocaleDateString())
            ].join(','))
        ];

        const csvString = csvRows.join('\n');
        const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', 'reporte_inventario_sigemed.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const showManageInventoryButton = user && user.role === Role.SUPER_ADMIN;

    return (
        <div>
            {showWelcomeToast && (
                <div className="fixed top-5 right-5 bg-green-500 text-white py-3 px-5 rounded-lg shadow-lg z-50 animate-fade-in-out">
                    ¡Bienvenido, {user?.name}!
                </div>
            )}
            {isScannerOpen && <QRScannerModal onClose={() => setIsScannerOpen(false)} onScan={handleScanSuccess} />}

            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4 md:mb-0">Inventario de Equipos</h1>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleExportToCSV}
                        disabled={filteredEquipment.length === 0}
                        className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 flex items-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                        title={filteredEquipment.length === 0 ? "No hay datos para exportar" : "Exportar a CSV"}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-0 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        <span className="hidden sm:inline">Exportar a CSV</span>
                    </button>
                    {showManageInventoryButton && (
                        <Link to="/settings" className="bg-brand-blue text-white px-4 py-2 rounded-md hover:bg-brand-blue-dark whitespace-nowrap">
                            Gestionar Inventario
                        </Link>
                    )}
                    <button
                        onClick={() => refreshInventory()}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 flex items-center"
                        title="Actualizar lista de inventario"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md mb-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <select name="area" value={filters.area} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-blue focus:border-brand-blue dark:bg-slate-700 dark:border-gray-600 dark:text-gray-200">
                        <option value="ALL">Todas las Áreas</option>
                        {allAreas.map(area => <option key={area} value={area}>{area}</option>)}
                    </select>
                    <select name="name" value={filters.name} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-blue focus:border-brand-blue dark:bg-slate-700 dark:border-gray-600 dark:text-gray-200">
                        <option value="ALL">Todos los Tipos</option>
                        {allNames.map(name => <option key={name} value={name}>{name}</option>)}
                    </select>
                    <select name="brand" value={filters.brand} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-blue focus:border-brand-blue dark:bg-slate-700 dark:border-gray-600 dark:text-gray-200">
                        <option value="ALL">Todas las Marcas</option>
                        {allBrands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
                    </select>
                    <select name="model" value={filters.model} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-blue focus:border-brand-blue dark:bg-slate-700 dark:border-gray-600 dark:text-gray-200">
                        <option value="ALL">Todos los Modelos</option>
                        {allModels.map(model => <option key={model} value={model}>{model}</option>)}
                    </select>
                    <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-blue focus:border-brand-blue dark:bg-slate-700 dark:border-gray-600 dark:text-gray-200">
                        <option value="ALL">Todos los Estados</option>
                        {Object.values(EquipmentStatus).map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t dark:border-gray-700 pt-4">
                    <input
                        type="text"
                        placeholder="Buscar por Nombre, Marca, Modelo, N/S, Ubicación..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-blue focus:border-brand-blue md:col-span-1 dark:bg-slate-700 dark:border-gray-600 dark:text-gray-200"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <button onClick={() => setIsScannerOpen(true)} className="w-full bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-800 flex items-center justify-center md:col-span-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6.364 1.636l-.707.707M20 12h-1M4 12H3m15.364 6.364l-.707-.707M12 20v-1m-6.364-1.636l.707-.707M6 12a6 6 0 1112 0 6 6 0 01-12 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        Escanear QR
                    </button>
                    <button onClick={clearFilters} className="w-full bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 flex items-center justify-center md:col-span-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Limpiar Filtros
                    </button>
                </div>
            </div>

            <div className="hidden md:block bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full whitespace-nowrap">
                    <thead className="text-left font-bold bg-gray-50 dark:bg-slate-700 border-b dark:border-gray-700 text-gray-800 dark:text-gray-300">
                        <tr>
                            <th className="px-6 py-3">Nombre</th>
                            <th className="px-6 py-3">Marca/Modelo</th>
                            <th className="px-6 py-3">N/S</th>
                            <th className="px-6 py-3">Ubicación</th>
                            <th className="px-6 py-3">Estado</th>
                            <th className="px-6 py-3">Próx. Mant.</th>
                            <th className="px-6 py-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-700 text-gray-900 dark:text-gray-200">
                        {paginatedEquipment.map(eq => (
                            <tr key={eq.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                <td className="px-6 py-4 font-medium">{eq.name}</td>
                                <td className="px-6 py-4">{eq.brand} / {eq.model}</td>
                                <td className="px-6 py-4">{eq.serialNumber}</td>
                                <td className="px-6 py-4">{eq.location}</td>
                                <td className="px-6 py-4"><EquipmentStatusBadge status={getDynamicStatus(eq)} /></td>
                                <td className="px-6 py-4">{eq.nextMaintenanceDate ? new Date(eq.nextMaintenanceDate).toLocaleDateString() : 'N/A'}</td>
                                <td className="px-6 py-4">
                                    <Link to={`/inventory/${eq.id}`} className="text-brand-blue hover:underline">Ver detalles</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredEquipment.length === 0 && (
                    <p className="text-center py-8 text-gray-500 dark:text-gray-400">No se encontraron equipos con los filtros seleccionados.</p>
                )}
            </div>

            <div className="md:hidden space-y-4">
                {paginatedEquipment.map(eq => (
                    <div key={eq.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 space-y-3">
                        <div className="flex justify-between items-start">
                            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{eq.name}</h3>
                            <EquipmentStatusBadge status={getDynamicStatus(eq)} />
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                            <p><strong>Marca/Modelo:</strong> {eq.brand} / {eq.model}</p>
                            <p><strong>N/S:</strong> {eq.serialNumber}</p>
                            <p><strong>Ubicación:</strong> {eq.location}</p>
                            <p><strong>Próx. Mant.:</strong> {eq.nextMaintenanceDate ? new Date(eq.nextMaintenanceDate).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        <div className="border-t dark:border-gray-700 pt-3 text-right">
                            <Link to={`/inventory/${eq.id}`} className="text-brand-blue font-semibold hover:underline">Ver detalles &rarr;</Link>
                        </div>
                    </div>
                ))}
            </div>

            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center mt-4 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md print:hidden space-y-2 sm:space-y-0">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                        Mostrando <span className="font-semibold">{paginatedEquipment.length}</span> de <span className="font-semibold">{filteredEquipment.length}</span> resultados
                    </span>
                    <nav className="flex items-center space-x-2" aria-label="Pagination">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border dark:border-gray-600 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Anterior
                        </button>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Página {currentPage} de {totalPages}
                        </span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 border dark:border-gray-600 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Siguiente
                        </button>
                    </nav>
                </div>
            )}
        </div>
    );
};

export default InventoryListPage;