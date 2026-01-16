// FIX: Removed self-referential import that was causing multiple declaration conflicts.
// FIX: Populated types.ts to resolve module errors across the application.

export enum Role {
  SUPER_ADMIN = 'Super Administrador',
  SYSTEM_ADMIN = 'Administrador de Sistema',
  BIOMEDICAL_ENGINEER = 'Ingeniero Biomédico',
  AREA_HEAD = 'Jefe de Área',
  READ_ONLY = 'Solo Lectura',
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  area?: string;
}

export enum EquipmentStatus {
  OPERATIONAL = 'Operativo',
  IN_MAINTENANCE = 'En Mantenimiento',
  OUT_OF_SERVICE = 'Fuera de Servicio',
  FAILURE_REPORTED = 'Con Reporte de Falla',
  // F-IBM-05 Departure Statuses
  DONATION = 'Donación',
  LOAN = 'Comodato',
  RETURN = 'Devolución',
  DIAGNOSIS = 'Revisión / diagnóstico',
  PREVENTIVE = 'Mantenimiento preventivo',
  CORRECTIVE = 'Mantenimiento correctivo',
  OTHER = 'Otro',
}

export enum DocumentType {
  USER_MANUAL = 'Manual de Usuario',
  SERVICE_MANUAL = 'Manual de Servicio',
  INVOICE = 'Factura',
  WARRANTY = 'Garantía',
  CALIBRATION_CERTIFICATE = 'Certificado de Calibración',
  PHOTO = 'Foto',
  OTHER = 'Otro',
}

export interface EquipmentDocument {
  id: string;
  name: string;
  type: DocumentType;
  fileUrl: string;
  uploadedAt: string; // ISO 8601
}


export interface Equipment {
  id: string;
  name: string;
  brand: string;
  model: string;
  serialNumber: string;
  location: string;
  status: EquipmentStatus;
  lastMaintenanceDate: string; // YYYY-MM-DD
  nextMaintenanceDate: string; // YYYY-MM-DD
  lastCalibrationDate?: string; // YYYY-MM-DD
  nextCalibrationDate?: string; // YYYY-MM-DD
  documents?: EquipmentDocument[];
  imageUrl?: string;
}

export enum WorkOrderStatus {
  REPORTED = 'Reportada',
  OPEN = 'Abierta',
  IN_PROGRESS = 'En Progreso',
  AWAITING_PART = 'Esperando Refacción',
  CLOSED = 'Cerrada',
  FAILURE = 'Falla Reportada',
  MAINTENANCE_REQUEST = 'Solicitud de Mantenimiento',
  EQUIPMENT_DEPARTURE = 'Salida de Equipo',
  // F-IBM-05 Specific Statuses
  ON_LOAN = 'Comodato',
  RETURNED_TO_SOURCE = 'Devolución',
  FOR_DIAGNOSIS = 'Revisión / diagnóstico',
  EXTERNAL_PREVENTIVE = 'Mantenimiento preventivo',
  EXTERNAL_CORRECTIVE = 'Mantenimiento correctivo',
  OTHER_DEPARTURE = 'Otro',
}

export enum WorkOrderType {
  PREVENTIVE = 'Mantenimiento preventivo',
  CORRECTIVE = 'Mantenimiento correctivo',
  INSTALLATION = 'Entrega / Instalación',
  TRAINING = 'Asesoría / Capacitación',
  CHECK = 'Revisión',
  OTHER = 'Otro',
  MAINTENANCE_REQUEST = 'Solicitud de Mantenimiento',
  EQUIPMENT_DEPARTURE = 'Salida de Equipo',
  CALIBRATION = 'Calibración',
}

export interface WorkOrderHistory {
  timestamp: string; // ISO 8601
  userId: string;
  action: string;
}

export interface WorkOrder {
  id: string;
  equipmentId: string;
  type: WorkOrderType;
  description: string;
  assignedTo?: string; // userId
  status: WorkOrderStatus;
  createdAt: string; // YYYY-MM-DD
  history?: WorkOrderHistory[];
  partsNeeded?: string;
  estimatedRepairDate?: string; // YYYY-MM-DD
  reportedBy?: string; // userId
  calibrationCertificateUrl?: string;

  // New fields for Service Order (F-IBM-03)
  requesterName?: string;
  requestingArea?: string;
  folio?: string;
  serviceType?: WorkOrderType; // redundant with type but kept for mapping if needed
  // Fields for later stages
  failureFound?: string;
  servicePerformed?: string;
  conditionsLeft?: string;
  materialsUsed?: { description: string; quantity: number; partNumber: string; }[];
  serviceRealizedBy?: { name: string; position: string; date: string; signature?: string; };
  receivedBy?: { name: string; position: string; date: string; signature?: string; };

  // New fields for Maintenance Request (F-IBM-04)
  failureType?: 'mechanical' | 'electrical' | 'other';
  failureTypeOther?: string;
  requestTime?: string; // HH:mm
  documents?: EquipmentDocument[];

  // New fields for Equipment Departure (F-IBM-05)
  accessories?: string;
  departureReason?: 'Comodato' | 'Devolución' | 'Revisión / diagnóstico' | 'Mantenimiento preventivo' | 'Mantenimiento correctivo' | 'Otro';
  departureReasonOther?: string;
  authorizedBy?: string; // Name/Signature of Dirección Médica
  receivedByOutside?: string; // Name/Signature of Recibe Proveedor
  sender?: string; // Name of Entrega Ingeniería Biomédica (System User)
}

export interface ProcedureManual {
  id: string;
  name: string;
  description: string;
  category: string;
  fileUrl: string;
}

export interface TrainingManual {
  id: string;
  name: string;
  description: string;
  year: number;
  fileUrl: string;
}

export interface Notification {
  id: string;
  message: string;
  type: 'alert' | 'info' | 'success';
  timestamp: string;
  isRead: boolean;
  linkTo?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  specialty: string;
  catalogUrl?: string;
}

export interface Email {
  id: string;
  to: string; // userId
  from: string; // System name or user name
  subject: string;
  body: string; // HTML content
  timestamp: string; // ISO 8601
  isRead: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string; // ISO 8601
  userId: string;
  action: string;
  details?: string;
}