
import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect, useMemo } from 'react';
import { User, Role, Equipment, WorkOrder, Supplier, Notification, Email, AuditLogEntry, WorkOrderStatus, WorkOrderType } from '../components/layout/types';
import { MOCK_EQUIPMENT, MOCK_WORK_ORDERS, MOCK_SUPPLIERS, MOCK_USERS } from '../constants';

const useLocalStorage = <T,>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] => {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            return initialValue;
        }
    });

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) { }
    };

    return [storedValue, setValue];
};

interface AppContextType {
    user: User | null;
    login: (user: User) => void;
    logout: () => void;
    equipment: Equipment[];
    refreshInventory: () => Promise<void>;
    workOrders: WorkOrder[];
    suppliers: Supplier[];
    updateEquipment: (updatedEquipment: Equipment) => void;
    updateWorkOrder: (updatedWorkOrder: WorkOrder) => void;
    addWorkOrder: (newWorkOrder: WorkOrder) => void;
    addSupplier: (newSupplier: Supplier) => void;
    updateSupplier: (updatedSupplier: Supplier) => void;
    deleteSupplier: (supplierId: string) => void;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    closeSidebar: () => void;
    isSearchOpen: boolean;
    openSearch: () => void;
    closeSearch: () => void;
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    isPanelOpen: boolean;
    togglePanel: () => void;
    emails: Email[];
    sendEmail: (email: Omit<Email, 'id' | 'timestamp' | 'isRead'>) => void;
    markEmailAsRead: (emailId: string) => void;
    unreadEmailCount: number;
    logEntries: AuditLogEntry[];
    addLogEntry: (action: string, details?: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [logEntries, setLogEntries] = useLocalStorage<AuditLogEntry[]>('sigemed-audit-log', []);
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>(MOCK_SUPPLIERS);

    const baseUrl = process.env.VITE_API_BASE_URL || '';

    const refreshInventory = useCallback(async () => {
        try {
            const inventoryUrl = `${baseUrl}/api/inventory`;
            console.log('Fetching inventory from:', inventoryUrl);

            const response = await fetch(inventoryUrl);
            if (response.ok) {
                const data = await response.json();
                setEquipment(data);
                console.log('Inventory loaded successfully:', data.length, 'items');
            } else {
                console.error('Failed to fetch inventory, status:', response.status);
                setEquipment(MOCK_EQUIPMENT);
            }
        } catch (error) {
            console.error("Failed to fetch inventory", error);
            // Fallback to mock if server fails
            setEquipment(MOCK_EQUIPMENT);
        }
    }, [baseUrl]);

    const refreshWorkOrders = useCallback(async () => {
        try {
            const url = `${baseUrl}/api/work-orders`;
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setWorkOrders(data);
                console.log('Work Orders loaded:', data.length);
            } else {
                console.warn('Failed to fetch work orders, using empty list.');
                setWorkOrders([]);
            }
        } catch (error) {
            console.error("Failed to fetch work orders:", error);
            setWorkOrders([]);
        }
    }, [baseUrl]);

    useEffect(() => {
        if (user) {
            refreshInventory();
            refreshWorkOrders();
        }
    }, [user, refreshInventory, refreshWorkOrders]);

    const _log = useCallback((actor: User, action: string, details?: string) => {
        const newEntry: AuditLogEntry = {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            userId: actor.id,
            action,
            details,
        };
        setLogEntries(prev => [newEntry, ...prev]);
    }, [setLogEntries]);

    const addLogEntry = useCallback((action: string, details?: string) => {
        if (!user) return;
        _log(user, action, details);
    }, [user, _log]);

    const login = useCallback((userToLogin: User) => {
        setUser(userToLogin);
        sessionStorage.setItem('justLoggedIn', 'true');
        _log(userToLogin, 'Inicio de Sesión Exitoso');
    }, [_log]);

    const logout = useCallback(() => {
        if (user) _log(user, 'Cierre de Sesión');
        setUser(null);
        sessionStorage.removeItem('justLoggedIn');
    }, [user, _log]);

    const updateEquipment = useCallback((updatedEquipment: Equipment) => {
        setEquipment(prev => prev.map(eq => (eq.id === updatedEquipment.id ? updatedEquipment : eq)));
    }, []);
    const updateWorkOrder = useCallback((updatedWorkOrder: WorkOrder) => {
        setWorkOrders(prev => prev.map(wo => (wo.id === updatedWorkOrder.id ? updatedWorkOrder : wo)));
    }, []);
    const addWorkOrder = useCallback((newWorkOrder: WorkOrder) => {
        setWorkOrders(prev => [newWorkOrder, ...prev]);
    }, []);
    const addSupplier = useCallback((newSupplier: Supplier) => {
        setSuppliers(prev => [newSupplier, ...prev]);
    }, []);
    const updateSupplier = useCallback((updatedSupplier: Supplier) => {
        setSuppliers(prev => prev.map(s => s.id === updatedSupplier.id ? updatedSupplier : s));
    }, []);
    const deleteSupplier = useCallback((supplierId: string) => {
        setSuppliers(prev => prev.filter(s => s.id !== supplierId));
    }, []);

    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        const savedTheme = localStorage.getItem('sigemed-theme') as 'light' | 'dark';
        return savedTheme || 'light';
    });
    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') root.classList.add('dark');
        else root.classList.remove('dark');
        localStorage.setItem('sigemed-theme', theme);
    }, [theme]);
    const toggleTheme = useCallback(() => setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light')), []);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const toggleSidebar = useCallback(() => setIsSidebarOpen(prev => !prev), []);
    const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const openSearch = useCallback(() => setIsSearchOpen(true), []);
    const closeSearch = useCallback(() => setIsSearchOpen(false), []);

    const [allEmails, setAllEmails] = useState<Email[]>([]);
    const sendEmail = useCallback((email: Omit<Email, 'id' | 'timestamp' | 'isRead'>) => {
        const newEmail: Email = { ...email, id: `email-${Date.now()}`, timestamp: new Date().toISOString(), isRead: false };
        setAllEmails(prev => [newEmail, ...prev]);
    }, []);

    const userEmails = useMemo(() => allEmails.filter(e => e.to === user?.id), [allEmails, user]);
    const unreadEmailCount = useMemo(() => userEmails.filter(e => !e.isRead).length, [userEmails]);
    const markEmailAsRead = useCallback((emailId: string) => {
        setAllEmails(prev => prev.map(e => e.id === emailId ? { ...e, isRead: true } : e));
    }, []);

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);
    const markAsRead = useCallback((id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n)), []);
    const markAllAsRead = useCallback(() => setNotifications(prev => prev.map(n => ({ ...n, isRead: true }))), []);
    const togglePanel = useCallback(() => setIsPanelOpen(prev => !prev), []);

    return (
        <AppContext.Provider value={{
            user, login, logout, equipment, refreshInventory, workOrders, suppliers, updateEquipment, updateWorkOrder, addWorkOrder, addSupplier, updateSupplier, deleteSupplier,
            theme, toggleTheme, isSidebarOpen, toggleSidebar, closeSidebar, isSearchOpen, openSearch, closeSearch,
            notifications, unreadCount, markAsRead, markAllAsRead, isPanelOpen, togglePanel, emails: userEmails, sendEmail, markEmailAsRead, unreadEmailCount, logEntries, addLogEntry
        }}>
            {children}
        </AppContext.Provider>
    );
}

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error('useApp must be used within an AppProvider');
    return context;
};
