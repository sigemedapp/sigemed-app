import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { MOCK_USERS } from '../../constants';
import { Role } from './types';

interface SearchResult {
    id: string;
    type: 'Equipo' | 'Orden de Trabajo' | 'Usuario';
    title: string;
    subtitle: string;
    link: string;
    icon: React.ReactElement;
}

const ResultItem: React.FC<{ result: SearchResult, onNavigate: () => void }> = ({ result, onNavigate }) => (
    <li
        onClick={onNavigate}
        className="flex items-center p-3 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
    >
        <div className="mr-4 text-gray-400 dark:text-gray-500">{result.icon}</div>
        <div>
            <p className="font-semibold text-gray-800 dark:text-gray-100">{result.title}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{result.subtitle}</p>
        </div>
    </li>
);

const GlobalSearch: React.FC = () => {
    const { isSearchOpen, closeSearch, user, equipment, workOrders } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!isSearchOpen) {
            setSearchTerm('');
        }
    }, [isSearchOpen]);

    const allResults = useMemo<SearchResult[]>(() => {
        if (!user) return [];
        const lowerSearch = searchTerm.toLowerCase();
        if (lowerSearch.length < 2) return [];

        const results: SearchResult[] = [];

        equipment
            .filter(e => e.name.toLowerCase().includes(lowerSearch) || e.serialNumber.toLowerCase().includes(lowerSearch))
            .forEach(e => results.push({
                id: `eq-${e.id}`, type: 'Equipo', title: e.name, subtitle: `N/S: ${e.serialNumber} - ${e.location}`, link: `/inventory/${e.id}`, icon: <IconInventory />,
            }));
            
        if ([Role.SUPER_ADMIN, Role.SYSTEM_ADMIN, Role.BIOMEDICAL_ENGINEER].includes(user.role)) {
            workOrders
                .filter(wo => wo.id.toLowerCase().includes(lowerSearch) || wo.description.toLowerCase().includes(lowerSearch))
                .forEach(wo => {
                    const eqName = equipment.find(e => e.id === wo.equipmentId)?.name || 'Desconocido';
                    results.push({ id: `wo-${wo.id}`, type: 'Orden de Trabajo', title: `OT: ${wo.id} (${eqName})`, subtitle: wo.description, link: `/maintenance`, icon: <IconWorkOrder /> });
                });
        }
        
        if (user.role === Role.SUPER_ADMIN) {
             MOCK_USERS
                .filter(u => u.name.toLowerCase().includes(lowerSearch) || u.email.toLowerCase().includes(lowerSearch))
                .forEach(u => results.push({ id: `user-${u.id}`, type: 'Usuario', title: u.name, subtitle: `${u.email} - ${u.role}`, link: '/users', icon: <IconUsers /> }));
        }

        return results;
    }, [searchTerm, user, equipment, workOrders]);

    const groupedResults = useMemo(() => {
        return allResults.reduce((acc, result) => {
            if (!acc[result.type]) acc[result.type] = [];
            acc[result.type].push(result);
            return acc;
        }, {} as Record<SearchResult['type'], SearchResult[]>);
    }, [allResults]);

    const handleNavigate = (link: string) => {
        navigate(link);
        closeSearch();
    };

    if (!isSearchOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-start pt-12 md:pt-20" onClick={closeSearch}>
            <div
                className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-2xl mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative p-2">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-5">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </span>
                    <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar equipos, órdenes, usuarios..." className="w-full pl-12 pr-4 py-3 border-0 rounded-md bg-transparent focus:ring-0 text-lg text-gray-800 dark:text-gray-200" autoFocus />
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 max-h-[60vh] overflow-y-auto p-2">
                    {searchTerm.length < 2 && (<p className="text-center text-gray-500 dark:text-gray-400 p-8">Escriba al menos 2 caracteres para buscar.</p>)}
                    {searchTerm.length >= 2 && allResults.length === 0 && (<p className="text-center text-gray-500 dark:text-gray-400 p-8">No se encontraron resultados para "{searchTerm}".</p>)}
                    
                    {Object.entries(groupedResults).map(([category, results]) => (
                        <div key={category} className="p-2">
                            <h3 className="text-xs font-semibold uppercase text-gray-400 dark:text-gray-500 px-3 mb-2">{category}</h3>
                            <ul>
                                {/* FIX: Cast `results` to `SearchResult[]` to resolve TypeScript error. `Object.entries` can produce `unknown` values, so this assertion clarifies the expected type. */}
                                {(results as SearchResult[]).map(result => (<ResultItem key={result.id} result={result} onNavigate={() => handleNavigate(result.link)} />))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const IconInventory = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>;
const IconWorkOrder = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
const IconUsers = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm6-11a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;

export default GlobalSearch;