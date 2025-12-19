import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';

import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import InventoryListPage from './pages/InventoryListPage';
import EquipmentDetailPage from './pages/EquipmentDetailPage';
import MaintenancePage from './pages/MaintenancePage';
import CalibrationPage from './pages/CalibrationPage';
import ReportsPage from './pages/ReportsPage';
import UserManagementPage from './pages/UserManagementPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import { Role, User } from './components/layout/types';
import ProceduresPage from './pages/ProceduresPage';
import TrainingsPage from './pages/TrainingsPage';
import AnnualReportPage from './pages/AnnualReportPage';
import SuppliersPage from './pages/SuppliersPage';
import EmailNotificationsPage from './pages/EmailNotificationsPage';
import AuditLogPage from './pages/AuditLogPage';
import FAQPage from './pages/FAQPage';

const ProtectedRoute: React.FC<{ roles?: Role[] }> = ({ roles }) => {
    const { user } = useApp();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (roles && !roles.includes(user.role)) {
        // Redirect to a more appropriate page based on role if access is denied
        if(user.role === Role.AREA_HEAD || user.role === Role.READ_ONLY) {
            return <Navigate to="/inventory" replace />;
        }
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

const AppRoutes: React.FC = () => {
    const { user, login } = useApp();

    if (!user) {
        return (
            <Routes>
                <Route path="/login" element={<LoginPage onLogin={login} />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        );
    }
    
    // Redirect after login based on role
    const getHomeRoute = (user: User | null) => {
        if (!user) return "/login";
        switch (user.role) {
            case Role.AREA_HEAD:
            case Role.READ_ONLY:
                return "/inventory";
            default:
                return "/dashboard";
        }
    };

    return (
        <Layout>
            <Routes>
                <Route path="/login" element={<Navigate to={getHomeRoute(user)} replace />} />
                <Route path="/" element={<Navigate to={getHomeRoute(user)} replace />} />
                
                {/* Routes accessible to most users */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/inventory" element={<InventoryListPage />} />
                    <Route path="/inventory/:id" element={<EquipmentDetailPage />} />
                    <Route path="/procedures" element={<ProceduresPage />} />
                    <Route path="/trainings" element={<TrainingsPage />} />
                    <Route path="/faq" element={<FAQPage />} />
                </Route>

                {/* Dashboard: Hidden for area heads and read-only */}
                <Route element={<ProtectedRoute roles={[Role.SUPER_ADMIN, Role.SYSTEM_ADMIN, Role.BIOMEDICAL_ENGINEER]} />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                </Route>

                {/* Maintenance & Calibration: For technical staff */}
                <Route element={<ProtectedRoute roles={[Role.SUPER_ADMIN, Role.SYSTEM_ADMIN, Role.BIOMEDICAL_ENGINEER]} />}>
                    <Route path="/maintenance" element={<MaintenancePage />} />
                    <Route path="/calibration" element={<CalibrationPage />} />
                    <Route path="/annual-report" element={<AnnualReportPage />} />
                    <Route path="/notifications-email" element={<EmailNotificationsPage />} />
                </Route>
                
                {/* Reports & Suppliers: For Admins */}
                <Route element={<ProtectedRoute roles={[Role.SUPER_ADMIN, Role.SYSTEM_ADMIN]} />}>
                    <Route path="/reports" element={<ReportsPage />} />
                    <Route path="/suppliers" element={<SuppliersPage />} />
                </Route>
                
                {/* User Management & Settings: Super Admin only */}
                <Route element={<ProtectedRoute roles={[Role.SUPER_ADMIN]} />}>
                    <Route path="/users" element={<UserManagementPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/audit-log" element={<AuditLogPage />} />
                </Route>

                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Layout>
    );
};


const App: React.FC = () => {
    return (
        <AppProvider>
            <HashRouter>
                <AppRoutes />
            </HashRouter>
        </AppProvider>
    );
};

export default App;