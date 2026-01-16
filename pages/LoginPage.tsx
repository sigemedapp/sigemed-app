
import React, { useState } from 'react';
import { User } from '../components/layout/types';
import { MOCK_USERS } from '../constants';
import { SIGEMED_FULL_LOGO } from '../assets/sigemed_full_logo';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const baseUrl = process.env.VITE_API_BASE_URL || '';

    try {
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // ENFORCE LOCAL ROLES: Check if user exists in local mocks to ensure Roles match the Frontend Enum
        // This fixes the issue where Backend returns "SUPER_ADMIN" (string) but Frontend expects "Super Administrador" (Enum)
        const localUser = MOCK_USERS.find(u => u.email === email);
        if (localUser) {
          console.log("Using Local Mock User for Session:", localUser);
          onLogin(localUser);
        } else {
          onLogin(data.user);
        }
      } else {
        setError(data.message || 'Ocurrió un error. Por favor, intente de nuevo.');
      }
    } catch (err) {
      console.error('Login request failed', err);
      // DEBUG: Show actual error and URL to user
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error de conexión (${errorMessage}) intentando contactar a: ${baseUrl}`);
    }
  };

  return (
    <div className="min-h-screen bg-brand-gray-light dark:bg-gray-900 flex font-sans">
      <div className="hidden lg:flex w-1/2 bg-slate-200 flex-col items-center justify-center p-12 text-slate-800 text-center">
        <a href="https://hospitalespolanco.mx/" target="_blank" rel="noopener noreferrer">
          <img
            src="https://hospitalespolanco.mx/assets/pages/images/logo-white.png"
            alt="Logo Hospital Polanco"
            className="w-56 h-auto filter drop-shadow-[0_2px_3px_rgba(0,0,0,0.2)]"
          />
        </a>
        <h2 className="mt-8 text-2xl font-semibold opacity-90">Sistema de Gestión de Equipo Medico</h2>
        <p className="mt-4 text-lg opacity-80">El futuro de la gestión en salud, hoy.</p>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg">
          <div className="flex flex-col items-center mb-6">
            <img src={SIGEMED_FULL_LOGO} alt="SiGEMed Logo" className="w-40 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Iniciar Sesión</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Bienvenido de nuevo.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </span>
                <input
                  id="email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                  placeholder="usuario@sigemed.com"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <input
                  id="password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && <p className="text-red-600 text-sm text-center font-medium bg-red-50 dark:bg-red-900/40 dark:text-red-300 p-3 rounded-md">{error}</p>}

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-blue hover:bg-brand-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue transition duration-150 ease-in-out"
            >
              Ingresar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
