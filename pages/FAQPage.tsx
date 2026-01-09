import React, { useState } from 'react';

// Componente para un bloque de código con botón de copiado
const CodeBlock: React.FC<{ children: string }> = ({ children }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(children.trim()).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="relative my-4">
            <pre className="bg-slate-100 dark:bg-slate-900 p-4 rounded-md overflow-x-auto text-sm leading-relaxed">
                <code>{children.trim()}</code>
            </pre>
            <button
                onClick={handleCopy}
                className="absolute top-2 right-2 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded text-xs hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
                {copied ? '¡Copiado!' : 'Copiar'}
            </button>
        </div>
    );
};


// A single FAQ item component with accordion functionality
const FAQItem: React.FC<{ question: string; children: React.ReactNode }> = ({ question, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b dark:border-gray-700">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left py-4 px-2 hover:bg-gray-50 dark:hover:bg-slate-700/50"
                aria-expanded={isOpen}
            >
                <span className="font-semibold text-lg text-gray-800 dark:text-gray-100">{question}</span>
                <svg
                    className={`w-6 h-6 transform transition-transform duration-300 text-gray-500 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>
            <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="p-4 bg-gray-50 dark:bg-slate-900/50 text-gray-700 dark:text-gray-300">
                    {children}
                </div>
            </div>
        </div>
    );
};


const FAQPage: React.FC = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Preguntas Frecuentes y Ayuda</h1>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md">
                <FAQItem question="¿Qué roles de usuario existen y qué pueden hacer?">
                    <div className="prose dark:prose-invert max-w-none">
                        <p>SiGEMed cuenta con un sistema de roles robusto para controlar el acceso a las diferentes funciones. Los roles son:</p>
                        <ul>
                            <li><strong>Super Administrador:</strong> Control total del sistema. Puede gestionar usuarios, configuraciones, inventario, mantenimiento y ver todos los reportes.</li>
                            <li><strong>Administrador de Sistema:</strong> Puede gestionar el inventario, mantenimiento y ver reportes. No puede gestionar usuarios ni configuraciones avanzadas.</li>
                            <li><strong>Ingeniero Biomédico:</strong> Rol técnico. Puede gestionar órdenes de trabajo, actualizar el estado de los equipos y registrar mantenimientos.</li>
                            <li><strong>Jefe de Área:</strong> Puede ver el inventario completo, reportar fallas de equipos en su área y consultar manuales.</li>
                            <li><strong>Solo Lectura:</strong> Acceso de consulta. Puede ver el inventario y los manuales, pero no puede realizar cambios.</li>
                        </ul>
                    </div>
                </FAQItem>

                <FAQItem question="¿Cómo puedo reportar una falla de un equipo?">
                    <div className="prose dark:prose-invert max-w-none">
                        <p>Reportar una falla es muy sencillo:</p>
                        <ol>
                            <li>Navegue a la sección de <strong>Inventario</strong>.</li>
                            <li>Busque y seleccione el equipo que presenta la falla para ir a su página de detalles.</li>
                            <li>Haga clic en el botón rojo <strong>"Reportar Falla"</strong>.</li>
                            <li>En la ventana que aparece, describa el problema de la manera más detallada posible.</li>
                            <li>Haga clic en <strong>"Enviar Reporte"</strong>.</li>
                        </ol>
                        <p>Una vez enviado, se creará una orden de trabajo y el equipo de ingeniería biomédica será notificado para que le den seguimiento.</p>
                    </div>
                </FAQItem>
                <FAQItem question="¿Dónde puedo encontrar los manuales de usuario y de servicio?">
                    <p className="mb-2">
                        Los manuales se pueden encontrar en dos lugares:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>
                            <strong>Página de Detalles del Equipo:</strong> Cada equipo tiene una sección de "Documentos y Archivos Adjuntos" donde se pueden encontrar manuales específicos para ese modelo, así como facturas, garantías, etc.
                        </li>
                        <li>
                            <strong>Sección de Formatos:</strong> En el menú lateral, encontrará una sección dedicada a los procedimientos y formatos generales del hospital, como protocolos de limpieza, bioseguridad, etc.
                        </li>
                    </ul>
                </FAQItem>

                <FAQItem question="¿Cómo agrego un equipo al inventario de forma individual?">
                    <div className="prose dark:prose-invert max-w-none">
                        <p>Ahora puede agregar equipos de forma individual sin necesidad de un archivo CSV:</p>
                        <ol>
                            <li>Navegue a <strong>Configuración</strong> en el menú lateral.</li>
                            <li>En la sección "Carga Masiva de Inventario (CSV)", haga clic en el botón azul <strong>"+ Agregar Equipo Individual"</strong>.</li>
                            <li>Complete el formulario con los datos del equipo:
                                <ul>
                                    <li><strong>Nombre *</strong> (obligatorio)</li>
                                    <li>Marca, Modelo, Número de Serie, Ubicación</li>
                                    <li>Estado (Operativo, En Mantenimiento, etc.)</li>
                                    <li>Fechas de mantenimiento (último y próximo)</li>
                                </ul>
                            </li>
                            <li>Haga clic en <strong>"Guardar"</strong>.</li>
                        </ol>
                        <p className="text-green-600 dark:text-green-400 font-semibold">Si el equipo se guarda correctamente, el modal se cerrará y verá un mensaje de confirmación.</p>
                        <p className="text-red-600 dark:text-red-400">Si hay un error (por ejemplo, número de serie duplicado), se mostrará un mensaje indicando el problema.</p>
                    </div>
                </FAQItem>

                <FAQItem question="¿Cuál es el formato correcto del archivo CSV para carga masiva?">
                    <div className="prose dark:prose-invert max-w-none">
                        <p>Para cargar equipos de forma masiva, su archivo CSV debe tener las siguientes columnas en la primera fila (encabezados):</p>

                        <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600 my-4 text-sm">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-slate-700">
                                    <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left">Columna</th>
                                    <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left">Obligatorio</th>
                                    <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left">Formato / Valores</th>
                                    <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left">Ejemplo</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td className="border border-gray-300 dark:border-gray-600 px-3 py-2"><code>name</code></td><td className="border border-gray-300 dark:border-gray-600 px-3 py-2">Sí</td><td className="border border-gray-300 dark:border-gray-600 px-3 py-2">Texto libre</td><td className="border border-gray-300 dark:border-gray-600 px-3 py-2">Monitor de Signos Vitales</td></tr>
                                <tr><td className="border border-gray-300 dark:border-gray-600 px-3 py-2"><code>brand</code></td><td className="border border-gray-300 dark:border-gray-600 px-3 py-2">No</td><td className="border border-gray-300 dark:border-gray-600 px-3 py-2">Texto libre (Default: "Genérica")</td><td className="border border-gray-300 dark:border-gray-600 px-3 py-2">Philips</td></tr>
                                <tr><td className="border border-gray-300 dark:border-gray-600 px-3 py-2"><code>model</code></td><td className="border border-gray-300 dark:border-gray-600 px-3 py-2">No</td><td className="border border-gray-300 dark:border-gray-600 px-3 py-2">Texto libre (Default: "Desconocido")</td><td className="border border-gray-300 dark:border-gray-600 px-3 py-2">IntelliVue MX700</td></tr>
                                <tr><td className="border border-gray-300 dark:border-gray-600 px-3 py-2"><code>serialNumber</code></td><td className="border border-gray-300 dark:border-gray-600 px-3 py-2">Recomendado</td><td className="border border-gray-300 dark:border-gray-600 px-3 py-2">Texto único. Si está vacío, se genera automáticamente.</td><td className="border border-gray-300 dark:border-gray-600 px-3 py-2">DE12345678</td></tr>
                                <tr><td className="border border-gray-300 dark:border-gray-600 px-3 py-2"><code>location</code></td><td className="border border-gray-300 dark:border-gray-600 px-3 py-2">No</td><td className="border border-gray-300 dark:border-gray-600 px-3 py-2">Texto libre (Default: "Almacén General")</td><td className="border border-gray-300 dark:border-gray-600 px-3 py-2">UCI - Cama 1</td></tr>
                                <tr><td className="border border-gray-300 dark:border-gray-600 px-3 py-2"><code>status</code></td><td className="border border-gray-300 dark:border-gray-600 px-3 py-2">No</td><td className="border border-gray-300 dark:border-gray-600 px-3 py-2">Operativo, En Mantenimiento, Baja, Por Revisar</td><td className="border border-gray-300 dark:border-gray-600 px-3 py-2">Operativo</td></tr>
                                <tr><td className="border border-gray-300 dark:border-gray-600 px-3 py-2"><code>lastMaintenanceDate</code></td><td className="border border-gray-300 dark:border-gray-600 px-3 py-2">No</td><td className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-bold text-blue-600 dark:text-blue-400">AAAA-MM-DD (Ej: 2024-11-15)</td><td className="border border-gray-300 dark:border-gray-600 px-3 py-2">2024-11-15</td></tr>
                                <tr><td className="border border-gray-300 dark:border-gray-600 px-3 py-2"><code>nextMaintenanceDate</code></td><td className="border border-gray-300 dark:border-gray-600 px-3 py-2">No</td><td className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-bold text-blue-600 dark:text-blue-400">AAAA-MM-DD (Ej: 2025-02-15)</td><td className="border border-gray-300 dark:border-gray-600 px-3 py-2">2025-02-15</td></tr>
                            </tbody>
                        </table>

                        <h4 className="font-bold mt-4">⚠️ Formato de Fechas Importante:</h4>
                        <p className="text-orange-600 dark:text-orange-400">
                            Las fechas deben estar en formato <strong>AAAA-MM-DD</strong> (Año-Mes-Día con guiones). Ejemplos:
                        </p>
                        <ul className="list-disc pl-5">
                            <li><strong>Correcto:</strong> 2024-11-15, 2025-01-20</li>
                            <li><strong>Incorrecto:</strong> 15/11/2024, 11-15-2024, Nov 15 2024</li>
                        </ul>

                        <h4 className="font-bold mt-4">Ejemplo de archivo CSV:</h4>
                        <CodeBlock>{`name,brand,model,serialNumber,location,status,lastMaintenanceDate,nextMaintenanceDate
Monitor Cardiaco,Philips,IntelliVue MP5,SN001234,Urgencias,Operativo,2024-11-15,2025-02-15
Ventilador Mecánico,Medtronic,PB840,SN005678,UCI,Operativo,2024-10-20,2025-01-20
Desfibrilador,ZOLL,M Series,SN009012,Quirófano 1,En Mantenimiento,2024-09-30,2024-12-30`}</CodeBlock>

                        <p className="mt-4"><strong>Notas adicionales:</strong></p>
                        <ul className="list-disc pl-5">
                            <li>Si un número de serie ya existe, el sistema actualizará ese equipo en lugar de duplicarlo.</li>
                            <li>Campos vacíos tomarán valores por defecto.</li>
                            <li>El sistema reportará advertencias y errores al finalizar la carga.</li>
                        </ul>
                    </div>
                </FAQItem>
                <FAQItem question="Estructura de la Base de Datos (Esquema SQL para Hostinger)">
                    <div className="prose dark:prose-invert max-w-none">
                        <p>
                            A continuación se presenta el esquema SQL completo para crear todas las tablas necesarias en tu base de datos en Hostinger.
                            Está diseñado para ser compatible con <strong>MySQL/MariaDB</strong>, que es el sistema que comúnmente utilizan. Puedes copiar y pegar estos bloques en la pestaña "SQL" de tu herramienta de gestión de bases de datos (como phpMyAdmin).
                        </p>

                        <h4 className="font-bold mt-4">1. Tabla `users`</h4>
                        <p>Almacena la información de los usuarios, sus credenciales de acceso y roles.</p>
                        <CodeBlock>{`
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- IMPORTANTE: Almacenar siempre la contraseña hasheada, nunca en texto plano.
    role ENUM('Super Administrador', 'Administrador de Sistema', 'Ingeniero Biomédico', 'Jefe de Área', 'Solo Lectura') NOT NULL,
    area VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                        `}</CodeBlock>

                        <h4 className="font-bold mt-4">2. Tabla `equipment`</h4>
                        <p>El inventario principal de todos los equipos médicos.</p>
                        <CodeBlock>{`
CREATE TABLE equipment (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255) NOT NULL,
    model VARCHAR(255) NOT NULL,
    serial_number VARCHAR(255) NOT NULL UNIQUE,
    location VARCHAR(255) NOT NULL,
    status ENUM('Operativo', 'En Mantenimiento', 'Fuera de Servicio') NOT NULL,
    last_maintenance_date DATE,
    next_maintenance_date DATE NOT NULL,
    last_calibration_date DATE,
    next_calibration_date DATE,
    image_url VARCHAR(2048)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                        `}</CodeBlock>

                        <h4 className="font-bold mt-4">3. Tabla `equipment_documents`</h4>
                        <p>Relaciona los documentos (manuales, facturas, etc.) con cada equipo.</p>
                        <CodeBlock>{`
CREATE TABLE equipment_documents (
    id VARCHAR(50) PRIMARY KEY,
    equipment_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type ENUM('Manual de Usuario', 'Manual de Servicio', 'Factura', 'Garantía', 'Certificado de Calibración', 'Foto', 'Otro') NOT NULL,
    file_url VARCHAR(2048) NOT NULL,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                        `}</CodeBlock>

                        <h4 className="font-bold mt-4">4. Tabla `work_orders`</h4>
                        <p>Contiene todas las órdenes de trabajo, ya sean preventivas, correctivas o de calibración.</p>
                        <CodeBlock>{`
CREATE TABLE work_orders (
    id VARCHAR(50) PRIMARY KEY,
    equipment_id VARCHAR(50) NOT NULL,
    type ENUM('Preventivo', 'Correctivo', 'Calibración', 'Reporte de Falla') NOT NULL,
    description TEXT NOT NULL,
    assigned_to_id VARCHAR(50),
    reported_by_id VARCHAR(50),
    status ENUM('Reportada', 'Abierta', 'En Progreso', 'Esperando Refacción', 'Cerrada') NOT NULL,
    created_at DATE NOT NULL,
    parts_needed TEXT,
    estimated_repair_date DATE,
    calibration_certificate_url VARCHAR(2048),
    FOREIGN KEY (equipment_id) REFERENCES equipment(id),
    FOREIGN KEY (assigned_to_id) REFERENCES users(id),
    FOREIGN KEY (reported_by_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                         `}</CodeBlock>

                        <h4 className="font-bold mt-4">5. Tabla `work_order_history`</h4>
                        <p>Registra cada acción o actualización dentro de una orden de trabajo.</p>
                        <CodeBlock>{`
CREATE TABLE work_order_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    work_order_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    action TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (work_order_id) REFERENCES work_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                        `}</CodeBlock>

                        <h4 className="font-bold mt-4">6. Otras Tablas (Proveedores, Manuales, Auditoría)</h4>
                        <p>Tablas adicionales para funcionalidades de soporte.</p>
                        <CodeBlock>{`
CREATE TABLE suppliers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    specialty VARCHAR(255) NOT NULL,
    catalog_url VARCHAR(2048)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE procedure_manuals (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(255) NOT NULL,
    file_url VARCHAR(2048) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE training_manuals (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    year INT NOT NULL,
    file_url VARCHAR(2048) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE audit_log (
    id VARCHAR(50) PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(50) NOT NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                        `}</CodeBlock>
                    </div>
                </FAQItem>

                <FAQItem question="Solución de Problemas: El login de demostración no funciona o quiero reiniciar la base de datos">
                    <div className="prose dark:prose-invert max-w-none">
                        <p>
                            Si tienes problemas para iniciar sesión con los usuarios de demostración, o si simplemente quieres restaurar la base de datos a su estado inicial, la causa más común es que los datos se insertaron incorrectamente o se corrompieron.
                        </p>
                        <p className="font-bold text-orange-500">
                            La siguiente consulta SQL es un "reinicio total". Borrará todos los datos de todas las tablas y los volverá a insertar de forma limpia y en el orden correcto.
                        </p>
                        <CodeBlock>{`
-- Paso 1: Desactivar temporalmente las restricciones de clave foránea
SET FOREIGN_KEY_CHECKS = 0;

-- Paso 2: Limpiar todas las tablas (TRUNCATE es más rápido que DELETE)
TRUNCATE TABLE work_order_history;
TRUNCATE TABLE work_orders;
TRUNCATE TABLE equipment_documents;
TRUNCATE TABLE audit_log;
TRUNCATE TABLE equipment;
TRUNCATE TABLE users;
TRUNCATE TABLE suppliers;
TRUNCATE TABLE procedure_manuals;
TRUNCATE TABLE training_manuals;

-- Paso 3: Reactivar las restricciones
SET FOREIGN_KEY_CHECKS = 1;

-- Paso 4: Volver a insertar todos los datos de demostración limpios

-- Insertar Usuarios
INSERT INTO users (id, name, email, password_hash, role, area) VALUES
('u1', 'Dr. Admin Supremo', 'super@sigemed.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.0rQt5VE6zvdcDMpUEjWB1GicfIZPJ7G', 'Super Administrador', 'Sistema'),
('u2', 'Ing. Sistema', 'admin@sigemed.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.0rQt5VE6zvdcDMpUEjWB1GicfIZPJ7G', 'Administrador de Sistema', 'Sistema'),
('u3', 'Ing. Biomédico', 'biomed@sigemed.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.0rQt5VE6zvdcDMpUEjWB1GicfIZPJ7G', 'Ingeniero Biomédico', 'General'),
('u4', 'Jefe de Quirófano', 'jefe.quirofano@sigemed.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.0rQt5VE6zvdcDMpUEjWB1GicfIZPJ7G', 'Jefe de Área', 'Quirófano'),
('u5', 'Enfermera UCI', 'uci@sigemed.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.0rQt5VE6zvdcDMpUEjWB1GicfIZPJ7G', 'Solo Lectura', 'UCI');

-- Insertar Equipos
INSERT INTO equipment (id, name, brand, model, serial_number, location, status, last_maintenance_date, next_maintenance_date, last_calibration_date, next_calibration_date, image_url) VALUES
('eq1', 'Monitor de Signos Vitales', 'Philips', 'IntelliVue MX700', 'DE12345678', 'UCI - Cama 1', 'Operativo', '2024-01-20', '2024-07-20', '2024-01-20', '2025-01-20', 'https://via.placeholder.com/400x400.png?text=Monitor'),
('eq2', 'Ventilador Mecánico', 'Dräger', 'Evita V500', 'US87654321', 'Quirófano 2', 'En Mantenimiento', '2023-11-10', '2024-05-10', NULL, NULL, 'https://via.placeholder.com/400x400.png?text=Ventilador'),
('eq3', 'Bomba de Infusión', 'B. Braun', 'Infusomat Space', 'ES99887766', 'Planta 3 - Hab 304', 'Fuera de Servicio', '2023-03-15', '2023-09-15', NULL, NULL, 'https://via.placeholder.com/400x400.png?text=Bomba'),
('eq4', 'Electrocardiógrafo', 'GE Healthcare', 'MAC 2000', 'GE11223344', 'Cardiología', 'Operativo', '2024-02-10', '2024-03-01', '2023-10-15', '2024-10-15', 'https://via.placeholder.com/400x400.png?text=ECG'),
('eq5', 'Desfibrilador', 'Zoll', 'R Series', 'ZOLL556677', 'Emergencias', 'Operativo', '2024-02-01', '2024-08-01', '2024-02-01', '2025-02-01', 'https://via.placeholder.com/400x400.png?text=Desfibrilador');

-- Insertar Documentos de Equipos
INSERT INTO equipment_documents (id, equipment_id, name, type, file_url, uploaded_at) VALUES
('doc1', 'eq1', 'Manual de Usuario MX700.pdf', 'Manual de Usuario', '#', '2023-01-15 10:00:00'),
('doc2', 'eq1', 'Factura Compra H-2023-01.pdf', 'Factura', '#', '2023-01-10 14:30:00'),
('doc3', 'eq1', 'Certificado Calibración Ene-2024.pdf', 'Certificado de Calibración', '#', '2024-01-20 11:00:00'),
('doc4', 'eq2', 'Guía Rápida Evita V500.pdf', 'Manual de Usuario', '#', '2022-11-01 09:00:00'),
('doc5', 'eq2', 'Garantía Extendida.pdf', 'Garantía', '#', '2022-11-01 09:05:00'),
('doc6', 'eq3', 'Manual de Servicio Infusomat.pdf', 'Manual de Servicio', '#', '2022-05-20 16:00:00'),
('doc7', 'eq5', 'Manual de Usuario Zoll R.pdf', 'Manual de Usuario', '#', '2023-08-01 09:00:00'),
('doc8', 'eq5', 'Manual de Servicio Zoll R.pdf', 'Manual de Servicio', '#', '2023-08-01 09:00:00'),
('doc9', 'eq5', 'Foto Frontal.jpg', 'Foto', '#', '2023-08-01 09:01:00');

-- Insertar Órdenes de Trabajo
INSERT INTO work_orders (id, equipment_id, type, description, assigned_to_id, status, created_at, parts_needed, estimated_repair_date, reported_by_id, calibration_certificate_url) VALUES
('wo1', 'eq2', 'Preventivo', 'Mantenimiento preventivo anual. Revisión de filtros y calibración.', 'u3', 'En Progreso', '2024-05-08', NULL, NULL, NULL, NULL),
('wo2', 'eq3', 'Correctivo', 'El equipo no enciende. Posible fallo en la fuente de alimentación.', 'u3', 'Esperando Refacción', '2024-05-12', 'Fuente de alimentación (Modelo XYZ-123)', '2024-06-15', NULL, NULL),
('wo3', 'eq1', 'Calibración', 'Calibración semestral del sensor de SpO2.', 'u3', 'En Progreso', '2024-05-15', NULL, NULL, NULL, NULL),
('wo4', 'eq4', 'Preventivo', 'Mantenimiento preventivo. Finalizado.', 'u3', 'Cerrada', '2024-04-20', NULL, NULL, NULL, NULL),
('wo5', 'eq5', 'Reporte de Falla', 'El equipo muestra lecturas de ECG erráticas y la batería no retiene la carga por más de 10 minutos.', NULL, 'Reportada', '2024-05-18', NULL, NULL, 'u5', NULL),
('wo6', 'eq4', 'Calibración', 'Calibración anual programada.', 'u3', 'Abierta', '2024-05-20', NULL, NULL, NULL, NULL),
('wo7', 'eq5', 'Calibración', 'Calibración bianual del desfibrilador.', 'u3', 'Cerrada', '2024-02-01', NULL, NULL, NULL, '/docs/cert-eq5-2024.pdf');

-- Insertar Historial de Órdenes de Trabajo
INSERT INTO work_order_history (work_order_id, user_id, action, timestamp) VALUES
('wo1', 'u2', 'Orden de trabajo creada.', '2024-05-08 10:00:00'),
('wo1', 'u2', 'Asignado a Ing. Biomédico.', '2024-05-08 11:00:00'),
('wo1', 'u3', 'Iniciado el trabajo de mantenimiento. Filtros de aire reemplazados.', '2024-05-09 09:30:00'),
('wo2', 'u2', 'Orden de trabajo creada.', '2024-05-12 14:00:00'),
('wo2', 'u2', 'Asignado a Ing. Biomédico.', '2024-05-12 14:05:00'),
('wo2', 'u3', 'Diagnóstico completado. Se confirma fallo en la fuente de alimentación. Se ha solicitado el repuesto.', '2024-05-13 11:00:00'),
('wo3', 'u2', 'Orden de trabajo creada y asignada a Ing. Biomédico.', '2024-05-15 09:00:00'),
('wo3', 'u3', 'Calibración iniciada.', '2024-05-16 10:00:00'),
('wo4', 'u2', 'Orden de trabajo creada y asignada a Ing. Biomédico.', '2024-04-20 09:00:00'),
('wo4', 'u3', 'Mantenimiento completado. Equipo operativo.', '2024-04-22 16:00:00'),
('wo5', 'u5', 'Reporte de falla creado.', '2024-05-18 08:30:00'),
('wo6', 'u2', 'Orden de calibración creada y asignada a Ing. Biomédico.', '2024-05-20 09:00:00'),
('wo7', 'u2', 'Orden de calibración creada.', '2024-02-01 09:00:00'),
('wo7', 'u3', 'Calibración completada. Certificado adjuntado.', '2024-02-01 15:00:00');

-- Insertar Proveedores y Manuales
INSERT INTO suppliers (id, name, contact_person, phone, email, address, specialty, catalog_url) VALUES
('sup1', 'Medtronic México', 'Ana García', '55-1234-5678', 'ventas@medtronic.com.mx', 'Av. Insurgentes Sur 813, Nápoles, 03810 Ciudad de México, CDMX', 'Equipo Nuevo', 'https://www.medtronic.com/mx-es/index.html'),
('sup2', 'Servicios de Calibración Biomédica (SCB)', 'Carlos López', '81-8765-4321', 'servicio@scb.com.mx', 'Parque de Investigación e Innovación Tecnológica, Apodaca, N.L.', 'Calibración', NULL),
('sup3', 'Refacciones Dräger', 'Sofía Martínez', '55-5555-1111', 'refacciones@draeger.com.mx', 'Calle Falsa 123, Industrial, 54030 Tlalnepantla, Méx.', 'Refacciones', '#');

INSERT INTO procedure_manuals (id, name, description, category, file_url) VALUES
('proc1', 'Manual de Bioseguridad Hospitalaria', 'Protocolos y directrices para garantizar la seguridad del personal y pacientes.', 'Seguridad y Calidad', '#'),
('proc2', 'Procedimiento de Limpieza y Desinfección de Equipos', 'Guía detallada para la correcta higienización de todo el equipo médico.', 'Ingeniería Biomédica', '#'),
('proc3', 'Protocolo de Actuación en Caso de Parada Cardiorrespiratoria', 'Pasos a seguir para el equipo de respuesta rápida.', 'Clínico', '#');

INSERT INTO training_manuals (id, name, description, year, file_url) VALUES
('train1', 'Capacitación en el Uso del Ventilador Dräger Evita V500', 'Curso completo sobre la operación, modos de ventilación y alarmas del equipo.', 2025, '#'),
('train2', 'Taller de Mantenimiento Preventivo de Bombas de Infusión', 'Entrenamiento práctico para el personal técnico sobre calibración y revisión periódica.', 2025, '#'),
('train3', 'Actualización de Protocolos de Reanimación Cardiopulmonar (RCP)', 'Seminario basado en las últimas guías de la AHA.', 2026, '#'),
('train4', 'Curso de Operador del Electrocardiógrafo GE MAC 2000', 'Capacitación para personal de enfermería y cardiología sobre la correcta toma de ECG.', 2026, '#');
                        `}</CodeBlock>
                    </div>
                </FAQItem>
            </div>
        </div>
    );
};

export default FAQPage;