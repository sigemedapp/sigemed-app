import React, { useState } from 'react';
// FIX: Corrected import paths for constants and types to be relative.
import { MOCK_USERS } from '../constants';
import { User, Role } from '../components/layout/types';
import { useApp } from '../context/AppContext';

const UserManagementPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>(MOCK_USERS);
    // FIX: Replaced useAuditLog with useApp to resolve module errors.
    const { addLogEntry } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);
    const [newUser, setNewUser] = useState<Partial<User>>({});
    const [newPassword, setNewPassword] = useState('');

    const openModal = (user: User | null = null) => {
        setEditingUser(user);
        setNewUser(user ? { ...user } : { name: '', email: '', role: Role.READ_ONLY, password: 'password123', area: '' });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const openPasswordModal = (user: User) => {
        setEditingUser(user);
        setNewPassword('');
        setIsPasswordModalOpen(true);
    };

    const closePasswordModal = () => {
        setIsPasswordModalOpen(false);
        setEditingUser(null);
    };

    const openDeleteModal = (user: User) => {
        setDeletingUser(user);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setDeletingUser(null);
    };
    
    const handleUserFormChange = (field: keyof Partial<User>, value: string | Role) => {
        const updatedUser = { ...newUser, [field]: value };

        if (field === 'role') {
            const newRole = value as Role;
            switch (newRole) {
                case Role.SUPER_ADMIN:
                case Role.SYSTEM_ADMIN:
                    updatedUser.area = 'Sistema';
                    break;
                case Role.BIOMEDICAL_ENGINEER:
                    updatedUser.area = 'General';
                    break;
                case Role.AREA_HEAD:
                case Role.READ_ONLY:
                    // If the previous area was a system default, clear it for user input
                    if (['Sistema', 'General'].includes(updatedUser.area || '')) {
                        updatedUser.area = '';
                    }
                    break;
            }
        }
        setNewUser(updatedUser);
    };

    const handleSave = () => {
        if (editingUser) {
            const updatedUser = { ...newUser } as User;
            setUsers(users.map(u => u.id === editingUser.id ? updatedUser : u));
            addLogEntry('Actualizó Usuario', `Nombre: ${updatedUser.name}, Rol: ${updatedUser.role}`);
        } else {
            const userToAdd: User = {
                id: `user-${Date.now()}`,
                name: newUser.name || 'Sin Nombre',
                email: newUser.email || `temp-${Date.now()}@sigemed.com`,
                role: newUser.role || Role.READ_ONLY,
                password: newUser.password || 'password123',
                area: newUser.area,
            };
            setUsers([...users, userToAdd]);
            addLogEntry('Creó Usuario', `Nombre: ${userToAdd.name}, Rol: ${userToAdd.role}`);
        }
        closeModal();
    };
    
    const handlePasswordChange = () => {
        if (editingUser) {
            setUsers(users.map(u => u.id === editingUser.id ? { ...u, password: newPassword } : u));
            addLogEntry('Cambió Contraseña', `Usuario: ${editingUser.name}`);
        }
        closePasswordModal();
    };

    const handleDelete = () => {
        if (deletingUser) {
            setUsers(users.filter(u => u.id !== deletingUser.id));
            addLogEntry('Eliminó Usuario', `Nombre: ${deletingUser.name}, Email: ${deletingUser.email}`);
        }
        closeDeleteModal();
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4 md:mb-0">Gestión de Usuarios</h1>
                <button 
                    onClick={() => openModal()}
                    className="bg-brand-blue text-white px-4 py-2 rounded-md hover:bg-brand-blue-dark self-start md:self-auto"
                >
                    Agregar Usuario
                </button>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full whitespace-nowrap">
                    <thead className="text-left font-bold bg-gray-50 dark:bg-slate-700 border-b dark:border-gray-700 text-gray-800 dark:text-gray-300">
                        <tr>
                            <th className="px-6 py-3">Nombre</th>
                            <th className="px-6 py-3">Correo</th>
                            <th className="px-6 py-3">Rol</th>
                            <th className="px-6 py-3">Área</th>
                            <th className="px-6 py-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-700 text-gray-900 dark:text-gray-200">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                <td className="px-6 py-4">{user.name}</td>
                                <td className="px-6 py-4">{user.email}</td>
                                <td className="px-6 py-4">{user.role}</td>
                                <td className="px-6 py-4">{user.area}</td>
                                <td className="px-6 py-4 space-x-2 whitespace-nowrap">
                                    <button onClick={() => openModal(user)} className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200">Editar</button>
                                    <button onClick={() => openPasswordModal(user)} className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200">Cambiar Contraseña</button>
                                    <button onClick={() => openDeleteModal(user)} className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded-full hover:bg-red-200">Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {users.map(user => (
                    <div key={user.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 space-y-3">
                        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{user.name}</h3>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                             <p>{user.email}</p>
                             <p><strong>Rol:</strong> {user.role}</p>
                             <p><strong>Área:</strong> {user.area}</p>
                        </div>
                        <div className="border-t dark:border-gray-700 pt-3 flex flex-wrap gap-2">
                             <button onClick={() => openModal(user)} className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200">Editar</button>
                            <button onClick={() => openPasswordModal(user)} className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200">Contraseña</button>
                            <button onClick={() => openDeleteModal(user)} className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded-full hover:bg-red-200">Eliminar</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit/Add Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">{editingUser ? 'Editar Usuario' : 'Agregar Usuario'}</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                                <input 
                                    type="text"
                                    value={newUser.name || ''}
                                    onChange={e => handleUserFormChange('name', e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                                <input 
                                    type="email"
                                    value={newUser.email || ''}
                                    onChange={e => handleUserFormChange('email', e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Rol</label>
                                <select 
                                    value={newUser.role || ''}
                                    onChange={e => handleUserFormChange('role', e.target.value as Role)}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm rounded-md"
                                >
                                    {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Área</label>
                                <input 
                                    type="text"
                                    value={newUser.area || ''}
                                    onChange={e => handleUserFormChange('area', e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 read-only:bg-gray-200"
                                    readOnly={
                                        newUser.role === Role.SUPER_ADMIN || 
                                        newUser.role === Role.SYSTEM_ADMIN || 
                                        newUser.role === Role.BIOMEDICAL_ENGINEER
                                    }
                                    required={
                                        newUser.role === Role.AREA_HEAD || 
                                        newUser.role === Role.READ_ONLY
                                    }
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button onClick={closeModal} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Cancelar</button>
                            <button onClick={handleSave} className="bg-brand-blue text-white px-4 py-2 rounded-md hover:bg-brand-blue-dark">Guardar</button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Change Password Modal */}
            {isPasswordModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">Cambiar Contraseña para {editingUser?.name}</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nueva Contraseña</label>
                            <input 
                                type="password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button onClick={closePasswordModal} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Cancelar</button>
                            <button onClick={handlePasswordChange} className="bg-brand-blue text-white px-4 py-2 rounded-md hover:bg-brand-blue-dark">Actualizar Contraseña</button>
                        </div>
                    </div>
                 </div>
            )}
            
            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">Confirmar Eliminación</h2>
                        <p>¿Está seguro de que desea eliminar al usuario <strong>{deletingUser?.name}</strong>? Esta acción no se puede deshacer.</p>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button onClick={closeDeleteModal} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Cancelar</button>
                            <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">Eliminar</button>
                        </div>
                    </div>
                 </div>
            )}

        </div>
    );
};

export default UserManagementPage;
