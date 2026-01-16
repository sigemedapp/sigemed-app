// FIX: Populated constants.ts with mock data to resolve module errors.
import { User, Role, Equipment, EquipmentStatus, WorkOrder, WorkOrderStatus, WorkOrderType, ProcedureManual, TrainingManual, Supplier, DocumentType } from './components/layout/types';
import { EQUIPMENT_IMAGES } from './assets/equipmentImages';

export const MOCK_EQUIPMENT: Equipment[] = [
    {
        id: 'eq1',
        name: 'Monitor de Signos Vitales',
        brand: 'Philips',
        model: 'IntelliVue MX700',
        serialNumber: 'DE12345678',
        location: 'UCI - Cama 1',
        status: EquipmentStatus.OPERATIONAL,
        lastMaintenanceDate: '2024-01-20',
        nextMaintenanceDate: '2024-07-20',
        lastCalibrationDate: '2024-01-20',
        nextCalibrationDate: '2025-01-20',
        imageUrl: EQUIPMENT_IMAGES.monitor,
        documents: [
            { id: 'doc1', name: 'Manual de Usuario MX700.pdf', type: DocumentType.USER_MANUAL, fileUrl: '#', uploadedAt: '2023-01-15T10:00:00Z' },
            { id: 'doc2', name: 'Factura Compra H-2023-01.pdf', type: DocumentType.INVOICE, fileUrl: '#', uploadedAt: '2023-01-10T14:30:00Z' },
            { id: 'doc3', name: 'Certificado Calibración Ene-2024.pdf', type: DocumentType.CALIBRATION_CERTIFICATE, fileUrl: '#', uploadedAt: '2024-01-20T11:00:00Z' },
        ],
    },
    {
        id: 'eq2',
        name: 'Ventilador Mecánico',
        brand: 'Dräger',
        model: 'Evita V500',
        serialNumber: 'US87654321',
        location: 'Quirófano 2',
        status: EquipmentStatus.IN_MAINTENANCE,
        lastMaintenanceDate: '2023-11-10',
        nextMaintenanceDate: '2024-05-10',
        imageUrl: EQUIPMENT_IMAGES.ventilator,
        documents: [
            { id: 'doc4', name: 'Guía Rápida Evita V500.pdf', type: DocumentType.USER_MANUAL, fileUrl: '#', uploadedAt: '2022-11-01T09:00:00Z' },
            { id: 'doc5', name: 'Garantía Extendida.pdf', type: DocumentType.WARRANTY, fileUrl: '#', uploadedAt: '2022-11-01T09:05:00Z' },
        ],
    },
    {
        id: 'eq3',
        name: 'Bomba de Infusión',
        brand: 'B. Braun',
        model: 'Infusomat Space',
        serialNumber: 'ES99887766',
        location: 'Planta 3 - Hab 304',
        status: EquipmentStatus.OUT_OF_SERVICE,
        lastMaintenanceDate: '2023-03-15',
        nextMaintenanceDate: '2023-09-15',
        imageUrl: EQUIPMENT_IMAGES.infusionPump,
        documents: [
            { id: 'doc6', name: 'Manual de Servicio Infusomat.pdf', type: DocumentType.SERVICE_MANUAL, fileUrl: '#', uploadedAt: '2022-05-20T16:00:00Z' },
        ],
    },
    {
        id: 'eq4',
        name: 'Electrocardiógrafo',
        brand: 'GE Healthcare',
        model: 'MAC 2000',
        serialNumber: 'GE11223344',
        location: 'Cardiología',
        status: EquipmentStatus.OPERATIONAL,
        lastMaintenanceDate: '2024-02-10',
        nextMaintenanceDate: '2024-03-01',
        lastCalibrationDate: '2023-10-15',
        nextCalibrationDate: '2024-10-15',
        imageUrl: EQUIPMENT_IMAGES.ecg,
        documents: [],
    },
    {
        id: 'eq5',
        name: 'Desfibrilador',
        brand: 'Zoll',
        model: 'R Series',
        serialNumber: 'ZOLL556677',
        location: 'Emergencias',
        status: EquipmentStatus.OPERATIONAL,
        lastMaintenanceDate: '2024-02-01',
        nextMaintenanceDate: '2024-08-01',
        lastCalibrationDate: '2024-02-01',
        nextCalibrationDate: '2025-02-01',
        imageUrl: EQUIPMENT_IMAGES.defibrillator,
        documents: [
            { id: 'doc7', name: 'Manual de Usuario Zoll R.pdf', type: DocumentType.USER_MANUAL, fileUrl: '#', uploadedAt: '2023-08-01T09:00:00Z' },
            { id: 'doc8', name: 'Manual de Servicio Zoll R.pdf', type: DocumentType.SERVICE_MANUAL, fileUrl: '#', uploadedAt: '2023-08-01T09:00:00Z' },
            { id: 'doc9', name: 'Foto Frontal.jpg', type: DocumentType.PHOTO, fileUrl: '#', uploadedAt: '2023-08-01T09:01:00Z' },
        ],
    }
];

export const MOCK_USERS: User[] = [
    { id: 'u1', name: 'Dr. Admin Supremo', email: 'super@sigemed.com', password: 'password', role: Role.SUPER_ADMIN, area: 'Sistema' },
    { id: 'u2', name: 'Ing. Sistema', email: 'admin@sigemed.com', password: 'password', role: Role.SYSTEM_ADMIN, area: 'Sistema' },
    { id: 'u3', name: 'Ing. Biomédico', email: 'biomed@sigemed.com', password: 'password', role: Role.BIOMEDICAL_ENGINEER, area: 'General' },
    { id: 'u4', name: 'Jefe de Quirófano', email: 'jefe.quirofano@sigemed.com', password: 'password', role: Role.AREA_HEAD, area: 'Quirófano' },
    { id: 'u5', name: 'Enfermera UCI', email: 'uci@sigemed.com', password: 'password', role: Role.READ_ONLY, area: 'UCI' },
];

export const MOCK_WORK_ORDERS: WorkOrder[] = [
    {
        id: 'wo1',
        equipmentId: 'eq2',
        type: WorkOrderType.PREVENTIVE,
        description: 'Mantenimiento preventivo anual. Revisión de filtros y calibración.',
        assignedTo: 'u3',
        status: WorkOrderStatus.IN_PROGRESS,
        createdAt: '2024-05-08',
        history: [
            { timestamp: '2024-05-08T10:00:00Z', userId: 'u2', action: 'Orden de trabajo creada.' },
            { timestamp: '2024-05-08T11:00:00Z', userId: 'u2', action: 'Asignado a Ing. Biomédico.' },
            { timestamp: '2024-05-09T09:30:00Z', userId: 'u3', action: 'Iniciado el trabajo de mantenimiento. Filtros de aire reemplazados.' },
        ]
    },
    {
        id: 'wo2',
        equipmentId: 'eq3',
        type: WorkOrderType.CORRECTIVE,
        description: 'El equipo no enciende. Posible fallo en la fuente de alimentación.',
        assignedTo: 'u3',
        status: WorkOrderStatus.AWAITING_PART,
        createdAt: '2024-05-12',
        partsNeeded: 'Fuente de alimentación (Modelo XYZ-123)',
        estimatedRepairDate: '2024-06-15',
        history: [
            { timestamp: '2024-05-12T14:00:00Z', userId: 'u2', action: 'Orden de trabajo creada.' },
            { timestamp: '2024-05-12T14:05:00Z', userId: 'u2', action: 'Asignado a Ing. Biomédico.' },
            { timestamp: '2024-05-13T11:00:00Z', userId: 'u3', action: 'Diagnóstico completado. Se confirma fallo en la fuente de alimentación. Se ha solicitado el repuesto.' },
        ]
    },
    {
        id: 'wo3',
        equipmentId: 'eq1',
        type: WorkOrderType.CALIBRATION,
        description: 'Calibración semestral del sensor de SpO2.',
        assignedTo: 'u3',
        status: WorkOrderStatus.IN_PROGRESS,
        createdAt: '2024-05-15',
        history: [
            { timestamp: '2024-05-15T09:00:00Z', userId: 'u2', action: 'Orden de trabajo creada y asignada a Ing. Biomédico.' },
            { timestamp: '2024-05-16T10:00:00Z', userId: 'u3', action: 'Calibración iniciada.' },
        ]
    },
    {
        id: 'wo4',
        equipmentId: 'eq4',
        type: WorkOrderType.PREVENTIVE,
        description: 'Mantenimiento preventivo. Finalizado.',
        assignedTo: 'u3',
        status: WorkOrderStatus.CLOSED,
        createdAt: '2024-04-20',
        history: [
            { timestamp: '2024-04-20T09:00:00Z', userId: 'u2', action: 'Orden de trabajo creada y asignada a Ing. Biomédico.' },
            { timestamp: '2024-04-22T16:00:00Z', userId: 'u3', action: 'Mantenimiento completado. Equipo operativo.' },
        ]
    },
    {
        id: 'wo5',
        equipmentId: 'eq5',
        type: WorkOrderType.CORRECTIVE,
        description: 'El equipo muestra lecturas de ECG erráticas y la batería no retiene la carga por más de 10 minutos.',
        reportedBy: 'u5',
        assignedTo: undefined,
        status: WorkOrderStatus.REPORTED,
        createdAt: '2024-05-18',
        history: [
            { timestamp: '2024-05-18T08:30:00Z', userId: 'u5', action: 'Reporte de falla creado.' },
        ]
    },
    {
        id: 'wo6',
        equipmentId: 'eq4',
        type: WorkOrderType.CALIBRATION,
        description: 'Calibración anual programada.',
        assignedTo: 'u3',
        status: WorkOrderStatus.OPEN,
        createdAt: '2024-05-20',
        history: [
            { timestamp: '2024-05-20T09:00:00Z', userId: 'u2', action: 'Orden de calibración creada y asignada a Ing. Biomédico.' },
        ]
    },
    {
        id: 'wo7',
        equipmentId: 'eq5',
        type: WorkOrderType.CALIBRATION,
        description: 'Calibración bianual del desfibrilador.',
        assignedTo: 'u3',
        status: WorkOrderStatus.CLOSED,
        createdAt: '2024-02-01',
        calibrationCertificateUrl: '/docs/cert-eq5-2024.pdf',
        history: [
            { timestamp: '2024-02-01T09:00:00Z', userId: 'u2', action: 'Orden de calibración creada.' },
            { timestamp: '2024-02-01T15:00:00Z', userId: 'u3', action: 'Calibración completada. Certificado adjuntado.' },
        ]
    }
];

export const MOCK_PROCEDURES: ProcedureManual[] = [
    {
        id: 'proc1',
        name: 'Manual de Bioseguridad Hospitalaria',
        description: 'Protocolos y directrices para garantizar la seguridad del personal y pacientes.',
        category: 'Seguridad y Calidad',
        fileUrl: '#'
    },
    {
        id: 'proc2',
        name: 'Procedimiento de Limpieza y Desinfección de Equipos',
        description: 'Guía detallada para la correcta higienización de todo el equipo médico.',
        category: 'Ingeniería Biomédica',
        fileUrl: '#'
    },
    {
        id: 'proc3',
        name: 'Protocolo de Actuación en Caso de Parada Cardiorrespiratoria',
        description: 'Pasos a seguir para el equipo de respuesta rápida.',
        category: 'Clínico',
        fileUrl: '#'
    }
];

export const MOCK_TRAININGS: TrainingManual[] = [
    {
        id: 'train1',
        name: 'Capacitación en el Uso del Ventilador Dräger Evita V500',
        description: 'Curso completo sobre la operación, modos de ventilación y alarmas del equipo.',
        year: 2025,
        fileUrl: '#'
    },
    {
        id: 'train2',
        name: 'Taller de Mantenimiento Preventivo de Bombas de Infusión',
        description: 'Entrenamiento práctico para el personal técnico sobre calibración y revisión periódica.',
        year: 2025,
        fileUrl: '#'
    },
    {
        id: 'train3',
        name: 'Actualización de Protocolos de Reanimación Cardiopulmonar (RCP)',
        description: 'Seminario basado en las últimas guías de la AHA.',
        year: 2026,
        fileUrl: '#'
    },
    {
        id: 'train4',
        name: 'Curso de Operador del Electrocardiógrafo GE MAC 2000',
        description: 'Capacitación para personal de enfermería y cardiología sobre la correcta toma de ECG.',
        year: 2026,
        fileUrl: '#'
    }
];

export const MOCK_SUPPLIERS: Supplier[] = [
    {
        id: 'sup1',
        name: 'Medtronic México',
        contactPerson: 'Ana García',
        phone: '55-1234-5678',
        email: 'ventas@medtronic.com.mx',
        address: 'Av. Insurgentes Sur 813, Nápoles, 03810 Ciudad de México, CDMX',
        specialty: 'Equipo Nuevo',
        catalogUrl: 'https://www.medtronic.com/mx-es/index.html'
    },
    {
        id: 'sup2',
        name: 'Servicios de Calibración Biomédica (SCB)',
        contactPerson: 'Carlos López',
        phone: '81-8765-4321',
        email: 'servicio@scb.com.mx',
        address: 'Parque de Investigación e Innovación Tecnológica, Apodaca, N.L.',
        specialty: 'Calibración',
    },
    {
        id: 'sup3',
        name: 'Refacciones Dräger',
        contactPerson: 'Sofía Martínez',
        phone: '55-5555-1111',
        email: 'refacciones@draeger.com.mx',
        address: 'Calle Falsa 123, Industrial, 54030 Tlalnepantla, Méx.',
        specialty: 'Refacciones',
        catalogUrl: '#'
    }
];