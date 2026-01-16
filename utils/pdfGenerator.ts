import { jsPDF } from 'jspdf';
import { HOSPITAL_LOGO } from '../assets/hospital_logo';

export interface DecommissionData {
    // From equipment (auto-filled)
    nombreDescripcion: string;
    marca: string;
    modelo: string;
    noSerie: string;
    ubicacion: string;

    // User input
    noInventario: string;
    accesorios: string;
    fechaAlta: string;
    fechaBaja: string;
    justificacion: string;

    // For radiation equipment
    numeroLicencia?: string;
    fechaLicencia?: string;
    responsableSeguridad?: string;
    destinoFinal?: string;
    contenedorTraslado?: string;

    // For administrative act
    localidad?: string;
    delegacionMunicipio?: string;
    encargadoDepto?: string;
    unidad?: string;
}

// Helper function to add text with word wrap
const addWrappedText = (doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number => {
    const lines = doc.splitTextToSize(text, maxWidth);
    lines.forEach((line: string, i: number) => {
        doc.text(line, x, y + (i * lineHeight));
    });
    return y + (lines.length * lineHeight);
};

// Helper function to open PDF in new tab for printing
const openPDFInNewTab = (doc: jsPDF, filename: string): void => {
    // Get PDF as blob
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);

    // Open in new tab
    const newWindow = window.open(url, '_blank');

    // If popup blocked or failed, fallback/alert could go here, 
    // but usually user triggers this so it should work.
    if (newWindow) {
        // Optional: set title after load might not work due to cross-origin policies with blob, 
        // but the file is viewable.
        // We can't easily change the title of a blob URL tab programmatically in all browsers.
    } else {
        alert(`Por favor permita ventanas emergentes para ver el archivo: ${filename}`);
    }

    // Note: We can't revoke object URL immediately or the tab might lose content. 
    // We rely on browser garbage collection for tab closure.
};

// Generate "Cédula de Baja de Equipo Médico" (Standard)
export const generateCedulaBajaStandard = (data: DecommissionData): jsPDF => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // Add Logo
    doc.addImage(HOSPITAL_LOGO, 'PNG', margin, 5, 40, 15);

    // Title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('CÉDULA DE BAJA DE EQUIPO MÉDICO', pageWidth / 2, 25, { align: 'center' });
    doc.text('DEPARTAMENTO DE INGENIERÍA BIOMÉDICA', pageWidth / 2, 33, { align: 'center' });

    // Draw table
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    let y = 40;
    const rowHeight = 20;
    const halfWidth = contentWidth / 2;

    // Helper to draw a cell
    const drawCell = (x: number, yPos: number, width: number, height: number, label: string, value: string) => {
        doc.rect(x, yPos, width, height);
        doc.setFont('helvetica', 'bold');
        doc.text(label, x + 2, yPos + 5);
        doc.setFont('helvetica', 'normal');
        doc.text(value || '', x + 2, yPos + 12);
    };

    // Row 1: Nombre y Descripción (full width)
    drawCell(margin, y, contentWidth, rowHeight, 'NOMBRE Y DESCRIPCIÓN', data.nombreDescripcion);
    y += rowHeight;

    // Row 2: Marca | Modelo
    drawCell(margin, y, halfWidth, rowHeight, 'MARCA', data.marca);
    drawCell(margin + halfWidth, y, halfWidth, rowHeight, 'MODELO', data.modelo);
    y += rowHeight;

    // Row 3: No. Serie | No. Inventario
    drawCell(margin, y, halfWidth, rowHeight, 'No. SERIE', data.noSerie);
    drawCell(margin + halfWidth, y, halfWidth, rowHeight, 'No. INVENTARIO', data.noInventario);
    y += rowHeight;

    // Row 4: Accesorios | Ubicación
    drawCell(margin, y, halfWidth, rowHeight, 'ACCESORIOS', data.accesorios);
    drawCell(margin + halfWidth, y, halfWidth, rowHeight, 'UBICACIÓN DE EQUIPO', data.ubicacion);
    y += rowHeight;

    // Row 5: Fecha Alta | Fecha Baja
    drawCell(margin, y, halfWidth, rowHeight, 'FECHA DE ALTA', data.fechaAlta);
    drawCell(margin + halfWidth, y, halfWidth, rowHeight, 'FECHA DE BAJA', data.fechaBaja);
    y += rowHeight;

    // Row 6: Justificación (large box)
    const justifHeight = 60;
    doc.rect(margin, y, contentWidth, justifHeight);
    doc.setFont('helvetica', 'bold');
    doc.text('JUSTIFICACIÓN DE LA BAJA', margin + 2, y + 5);
    doc.setFont('helvetica', 'normal');
    addWrappedText(doc, data.justificacion || '', margin + 2, y + 15, contentWidth - 4, 5);
    y += justifHeight;

    // Signatures
    y += 20;
    doc.setFont('helvetica', 'bold');
    doc.line(margin, y, margin + 60, y);
    doc.line(pageWidth - margin - 60, y, pageWidth - margin, y);
    doc.setFontSize(9);
    doc.text('DEPARTAMENTO DE INGENIERÍA', margin, y + 5);
    doc.text('BIOMÉDICA', margin, y + 10);
    doc.text('DIRECCIÓN MÉDICA', pageWidth - margin - 50, y + 5);

    return doc;
};

// Generate "Cédula de Baja con Radiación Ionizante"
export const generateCedulaRadiacion = (data: DecommissionData): jsPDF => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // Add Logo
    doc.addImage(HOSPITAL_LOGO, 'PNG', margin, 5, 40, 15);

    // Title
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('CÉDULA DE BAJA DE EQUIPO MÉDICO', pageWidth / 2, 25, { align: 'center' });
    doc.text('CON RADIACIÓN IONIZANTE', pageWidth / 2, 32, { align: 'center' });
    doc.text('DEPARTAMENTO DE INGENIERÍA BIOMÉDICA', pageWidth / 2, 39, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    let y = 38;
    const rowHeight = 16;
    const halfWidth = contentWidth / 2;

    const drawCell = (x: number, yPos: number, width: number, height: number, label: string, value: string) => {
        doc.rect(x, yPos, width, height);
        doc.setFont('helvetica', 'bold');
        doc.text(label, x + 2, yPos + 4);
        doc.setFont('helvetica', 'normal');
        doc.text(value || '', x + 2, yPos + 10);
    };

    // Nombre y Descripción
    drawCell(margin, y, contentWidth, rowHeight, 'NOMBRE Y DESCRIPCIÓN', data.nombreDescripcion);
    y += rowHeight;

    // Marca | Modelo
    drawCell(margin, y, halfWidth, rowHeight, 'MARCA', data.marca);
    drawCell(margin + halfWidth, y, halfWidth, rowHeight, 'MODELO', data.modelo);
    y += rowHeight;

    // No. Serie | No. Inventario
    drawCell(margin, y, halfWidth, rowHeight, 'No. SERIE', data.noSerie);
    drawCell(margin + halfWidth, y, halfWidth, rowHeight, 'No. INVENTARIO', data.noInventario);
    y += rowHeight;

    // Licencia | Responsable Seguridad
    drawCell(margin, y, halfWidth, rowHeight + 10, 'NÚMERO Y FECHA DE LA LICENCIA',
        `${data.numeroLicencia || ''} - ${data.fechaLicencia || ''}`);

    // Split long title for header
    const respTitle = doc.splitTextToSize('NOMBRE DEL RESPONSABLE DE SEGURIDAD RADIOLÓGICA', halfWidth - 4);
    drawCell(margin + halfWidth, y, halfWidth, rowHeight + 10, respTitle,
        data.responsableSeguridad || '');
    y += rowHeight + 10;

    // Fecha Alta | Fecha Baja
    drawCell(margin, y, halfWidth, rowHeight, 'FECHA DE ALTA', data.fechaAlta);
    drawCell(margin + halfWidth, y, halfWidth, rowHeight, 'FECHA DE BAJA', data.fechaBaja);
    y += rowHeight;

    // Destino Final | Contenedor
    drawCell(margin, y, halfWidth, rowHeight + 10, 'DESTINO FINAL PROPUESTO', data.destinoFinal || '');

    // Split long title for header
    const contTitle = doc.splitTextToSize('TIPO, MARCA, MODELO DEL CONTENEDOR PARA TRASLADO', halfWidth - 4);
    drawCell(margin + halfWidth, y, halfWidth, rowHeight + 10, contTitle,
        data.contenedorTraslado || '');
    y += rowHeight + 10;

    // Justificación y Evidencia
    const justifHeight = 50;
    doc.rect(margin, y, contentWidth, justifHeight);
    doc.setFont('helvetica', 'bold');
    doc.text('JUSTIFICACIÓN DE LA BAJA Y EVIDENCIA FOTOGRÁFICA', margin + 2, y + 5);
    doc.setFont('helvetica', 'normal');
    addWrappedText(doc, data.justificacion || '', margin + 2, y + 12, contentWidth - 4, 4);
    y += justifHeight;

    // Signatures
    y += 15;
    doc.setFont('helvetica', 'bold');
    doc.line(margin, y, margin + 55, y);
    doc.line(pageWidth - margin - 55, y, pageWidth - margin, y);
    doc.setFontSize(8);
    doc.text('DEPARTAMENTO DE INGENIERÍA', margin, y + 4);
    doc.text('BIOMÉDICA', margin, y + 8);
    doc.text('DIRECCIÓN MÉDICA', pageWidth - margin - 45, y + 4);

    return doc;
};

// Generate "Acta Administrativa"
export const generateActaAdministrativa = (data: DecommissionData): jsPDF => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 25;
    const contentWidth = pageWidth - (margin * 2);

    // Add Logo
    doc.addImage(HOSPITAL_LOGO, 'PNG', margin, 5, 40, 15);

    // Title
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('ACTA ADMINISTRATIVA PARA LA BAJA DE EQUIPO MÉDICO', pageWidth / 2, 25, { align: 'center' });
    doc.text('DEPARTAMENTO DE INGENIERÍA BIOMÉDICA', pageWidth / 2, 33, { align: 'center' });

    // Body text
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    let y = 50;

    const fechaActual = new Date();
    const dia = fechaActual.getDate();
    const mes = fechaActual.toLocaleDateString('es-MX', { month: 'long' });
    const año = fechaActual.getFullYear();
    const hora = fechaActual.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

    const paragraph1 = `En la localidad de ${data.localidad || '_________________'}, de la/el Delegación/Municipio de ${data.delegacionMunicipio || '_________________'}, siendo las ${hora} horas del día ${dia} de ${mes} del año ${año}, en las instalaciones del Hospital de Traumatología y Especialidades Médicas Polanco, Unidad ${data.unidad || '_________________'}, del Departamento de Ingeniería Biomédica, con domicilio en esta Ciudad, el que suscribe ${data.encargadoDepto || '_________________'}, Encargado del Departamento de Ingeniería Biomédica de la unidad antes mencionada, hace constar lo siguiente:`;

    y = addWrappedText(doc, paragraph1, margin, y, contentWidth, 6);
    y += 10;

    doc.setFont('helvetica', 'bold');
    doc.text('----------------------------------------HECHOS----------------------------------------', pageWidth / 2, y, { align: 'center' });
    y += 10;

    doc.setFont('helvetica', 'normal');
    const paragraph2 = `Se hace constar que el motivo de la presente es formalizar la baja definitiva del equipo médico que se encuentran en mal estado, mismos que son detallados en el formato anexo al acta de validación, la cual forma parte integral de la presente.`;
    y = addWrappedText(doc, paragraph2, margin, y, contentWidth, 6);
    y += 8;

    const paragraph3 = `Equipo: ${data.nombreDescripcion} - Marca: ${data.marca} - Modelo: ${data.modelo} - No. Serie: ${data.noSerie}`;
    y = addWrappedText(doc, paragraph3, margin, y, contentWidth, 6);
    y += 8;

    const paragraph4 = `Justificación: ${data.justificacion || ''}`;
    y = addWrappedText(doc, paragraph4, margin, y, contentWidth, 6);
    y += 8;

    const paragraph5 = `Como resultado del análisis practicado a dichos bienes, se determina que los mismos no son de utilidad dentro del Hospital. En este sentido, se establece que los equipos sean gestionados bajo su disposición conforme a las normativas vigentes del Hospital de Traumatología y Especialidades Médicas Polanco.`;
    y = addWrappedText(doc, paragraph5, margin, y, contentWidth, 6);
    y += 10;

    doc.text('Se firma la presente para constancia y efectos administrativos correspondientes.', margin, y);

    // Signatures
    y += 40;
    doc.line(margin, y, margin + 55, y);
    doc.line(pageWidth - margin - 55, y, pageWidth - margin, y);
    y += 5;
    doc.text('(Nombre y firma)', margin + 10, y);
    doc.text('(Nombre y firma)', pageWidth - margin - 45, y);
    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('DEPARTAMENTO DE', margin, y);
    doc.text('DIRECCIÓN MÉDICA', pageWidth - margin - 48, y);
    y += 5;
    doc.text('INGENIERÍA BIOMÉDICA', margin, y);

    return doc;
};

// Generate all PDFs - Opens the main one immediately, others should be opened manually via the details page
export const generateAllDecommissionPDFs = async (data: DecommissionData, includeRadiation: boolean = false): Promise<void> => {
    // Generate main PDF
    const doc1 = generateCedulaBajaStandard(data);

    // Open only the main one automatically to avoid popup blockers
    openPDFInNewTab(doc1, 'Cedula_Baja_Equipo_Medico.pdf');

    // The others (Acta, Radiation) are available via the "Formatos de Baja" section buttons
    // We don't verify them here to avoid multiple popups being blocked which confuses users
};

// Generate a single PDF for re-download (used in equipment details)
export const regenerateSinglePDF = (data: DecommissionData, type: 'cedula' | 'acta' | 'radiacion'): void => {
    let doc: jsPDF;
    let filename: string;

    switch (type) {
        case 'cedula':
            doc = generateCedulaBajaStandard(data);
            filename = 'Cedula_Baja_Equipo_Medico.pdf';
            break;
        case 'acta':
            doc = generateActaAdministrativa(data);
            filename = 'Acta_Administrativa_Baja.pdf';
            break;
        case 'radiacion':
            doc = generateCedulaRadiacion(data);
            filename = 'Cedula_Baja_Radiacion_Ionizante.pdf';
            break;
    }

    openPDFInNewTab(doc, filename);
};

export interface DepartureData {
    folio: string;
    fecha: string;
    ubicacion: string;
    equipo: string;
    marca: string;
    modelo: string;
    noSerie: string;
    noInventario: string;
    accesorios: string;
    descripcion: string;
    motivo: string;
    motivoOtro?: string;
    observaciones: string;
    autoriza: string;
    entrega: string;
    recibe: string;
}

export const generateDeparturePDF = (data: DepartureData): void => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);

    // -- Header --
    // Left Box (Logo placeholder)
    doc.setDrawColor(0);
    doc.rect(margin, 10, 50, 20);
    doc.addImage(HOSPITAL_LOGO, 'PNG', margin + 2, 11, 46, 18); // Adjusted size to fit

    // Middle Box (Title)
    doc.setFillColor(40, 40, 40); // Dark Gray/Black
    doc.rect(margin + 50, 10, 80, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text('SALIDA DE', margin + 90, 16, { align: 'center' });
    doc.text('EQUIPO', margin + 90, 21, { align: 'center' });
    doc.text('PROVEEDOR', margin + 90, 26, { align: 'center' });

    // Right Box (Meta)
    doc.setTextColor(0, 0, 0);
    doc.rect(margin + 130, 10, 50, 20);
    doc.setFontSize(7);

    // Internal lines for meta
    doc.line(margin + 130, 15, margin + 180, 15);
    doc.line(margin + 130, 20, margin + 180, 20);
    doc.line(margin + 130, 25, margin + 180, 25);

    // Meta Text
    doc.text('F-IBM-05', margin + 178, 14, { align: 'right' });
    doc.text('Fecha de emisión: Diciembre 2025', margin + 178, 19, { align: 'right' });
    doc.text('Fecha de revisión: Diciembre 2027', margin + 178, 24, { align: 'right' });
    doc.text('Versión 1', margin + 178, 29, { align: 'right' });

    let y = 35;

    // -- Date & Folio --
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Fecha: `, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(data.fecha, margin + 15, y);

    doc.setFont('helvetica', 'bold');
    doc.text(`Folio: `, margin + 60, y);
    doc.setFont('helvetica', 'normal');
    doc.text(data.folio, margin + 75, y);
    y += 5;

    // -- Tables --
    const rowHeight = 8;
    const colOneX = margin;
    const colTwoX = margin + (contentWidth / 2);

    // Headers Row 1
    doc.setFillColor(100, 100, 100);
    doc.setTextColor(255, 255, 255);
    doc.rect(colOneX, y, contentWidth / 2, rowHeight, 'F');
    doc.rect(colTwoX, y, contentWidth / 2, rowHeight, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('Ubicación del equipo', colOneX + (contentWidth / 4), y + 5, { align: 'center' });
    doc.text('Equipo', colTwoX + (contentWidth / 4), y + 5, { align: 'center' });
    y += rowHeight;

    // Values Row 1
    doc.setTextColor(0);
    doc.rect(colOneX, y, contentWidth / 2, rowHeight);
    doc.rect(colTwoX, y, contentWidth / 2, rowHeight);
    doc.setFont('helvetica', 'normal');
    doc.text(data.ubicacion, colOneX + 2, y + 5);
    doc.text(data.equipo, colTwoX + 2, y + 5);
    y += rowHeight;

    // Headers Row 2
    doc.setFillColor(100, 100, 100);
    doc.setTextColor(255, 255, 255);
    doc.rect(colOneX, y, contentWidth / 2, rowHeight, 'F');
    doc.rect(colTwoX, y, contentWidth / 2, rowHeight, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('Marca', colOneX + (contentWidth / 4), y + 5, { align: 'center' });
    doc.text('Modelo', colTwoX + (contentWidth / 4), y + 5, { align: 'center' });
    y += rowHeight;

    // Values Row 2
    doc.setTextColor(0);
    doc.rect(colOneX, y, contentWidth / 2, rowHeight);
    doc.rect(colTwoX, y, contentWidth / 2, rowHeight);
    doc.setFont('helvetica', 'normal');
    doc.text(data.marca, colOneX + 2, y + 5);
    doc.text(data.modelo, colTwoX + 2, y + 5);
    y += rowHeight;

    // Headers Row 3
    doc.setFillColor(100, 100, 100);
    doc.setTextColor(255, 255, 255);
    doc.rect(colOneX, y, contentWidth / 2, rowHeight, 'F');
    doc.rect(colTwoX, y, contentWidth / 2, rowHeight, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('No. de serie', colOneX + (contentWidth / 4), y + 5, { align: 'center' });
    doc.text('No. de inventario', colTwoX + (contentWidth / 4), y + 5, { align: 'center' });
    y += rowHeight;

    // Values Row 3
    doc.setTextColor(0);
    doc.rect(colOneX, y, contentWidth / 2, rowHeight);
    doc.rect(colTwoX, y, contentWidth / 2, rowHeight);
    doc.setFont('helvetica', 'normal');
    doc.text(data.noSerie, colOneX + 2, y + 5);
    doc.text(data.noInventario, colTwoX + 2, y + 5);
    y += rowHeight;

    // Partes y/o accesorios
    doc.setFillColor(100, 100, 100);
    doc.setTextColor(255, 255, 255);
    doc.rect(margin, y, contentWidth, rowHeight, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('Partes y/o accesorios', margin + (contentWidth / 2), y + 5, { align: 'center' });
    y += rowHeight;

    doc.setTextColor(0);
    doc.rect(margin, y, contentWidth, 20); // Box height 20
    doc.setFont('helvetica', 'normal');
    addWrappedText(doc, data.accesorios, margin + 2, y + 5, contentWidth - 4, 5);
    y += 20;

    // Descripcion y Evidencia
    y += 2; // spacer
    doc.setFillColor(100, 100, 100);
    doc.setTextColor(255, 255, 255);
    doc.rect(margin, y, contentWidth, rowHeight, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('Descripción y evidencia fotográfica', margin + (contentWidth / 2), y + 5, { align: 'center' });
    y += rowHeight;

    doc.setTextColor(0);
    doc.rect(margin, y, contentWidth, 40); // Box height 40
    doc.setFont('helvetica', 'normal');
    addWrappedText(doc, data.descripcion, margin + 2, y + 5, contentWidth - 4, 5);
    y += 40;

    // Motivo de salida
    y += 2; // spacer
    doc.setFillColor(100, 100, 100);
    doc.setTextColor(255, 255, 255);
    doc.rect(margin, y, contentWidth, rowHeight, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('Motivo de salida', margin + (contentWidth / 2), y + 5, { align: 'center' });
    y += rowHeight;

    doc.setTextColor(0);
    doc.rect(margin, y, contentWidth, 20);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    // Grid for checkboxes
    // Left col
    const leftX = margin + 5;
    const rightX = margin + (contentWidth / 2) + 5;
    let checkY = y + 5;

    const drawCheck = (label: string, isChecked: boolean, x: number, lineY: number) => {
        doc.rect(x - 4, lineY - 3, 3, 3);
        if (isChecked) doc.text('X', x - 3.5, lineY - 0.5);
        doc.text(label, x, lineY);
    };

    drawCheck('Comodato', data.motivo === 'Comodato', leftX, checkY);
    drawCheck('Mantenimiento preventivo', data.motivo === 'Mantenimiento preventivo', rightX, checkY);
    checkY += 5;
    drawCheck('Devolución', data.motivo === 'Devolución', leftX, checkY);
    drawCheck('Mantenimiento correctivo', data.motivo === 'Mantenimiento correctivo', rightX, checkY);
    checkY += 5;
    drawCheck('Revisión / diagnóstico', data.motivo === 'Revisión / diagnóstico', leftX, checkY);
    const isOther = ['Comodato', 'Mantenimiento preventivo', 'Devolución', 'Mantenimiento correctivo', 'Revisión / diagnóstico'].indexOf(data.motivo) === -1 && !!data.motivo;
    drawCheck(`Otro. Especificar: ${isOther ? (data.motivoOtro || data.motivo) : ''}`, isOther, rightX, checkY);
    y += 20;

    // Observaciones
    doc.setFillColor(100, 100, 100);
    doc.setTextColor(255, 255, 255);
    doc.rect(margin, y, contentWidth, rowHeight, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('Observaciones', margin + (contentWidth / 2), y + 5, { align: 'center' });
    y += rowHeight;

    doc.setTextColor(0);
    doc.rect(margin, y, contentWidth, 15);
    doc.setFont('helvetica', 'normal');
    addWrappedText(doc, data.observaciones, margin + 2, y + 5, contentWidth - 4, 5);
    y += 15;

    // Signatures
    y += 25;
    const sigWidth = contentWidth / 3;

    doc.setFontSize(9);

    // Auth
    doc.line(margin + 5, y, margin + sigWidth - 5, y);
    doc.text('Autorización', margin + (sigWidth / 2), y + 4, { align: 'center' });
    doc.text('Dirección Médica', margin + (sigWidth / 2), y + 8, { align: 'center' });
    doc.text(data.autoriza || '', margin + (sigWidth / 2), y - 2, { align: 'center' });

    // Entrega
    doc.line(margin + sigWidth + 5, y, margin + (sigWidth * 2) - 5, y);
    doc.text('Entrega', margin + sigWidth + (sigWidth / 2), y + 4, { align: 'center' });
    doc.text('Ingeniería Biomédica', margin + sigWidth + (sigWidth / 2), y + 8, { align: 'center' });
    doc.text(data.entrega || '', margin + sigWidth + (sigWidth / 2), y - 2, { align: 'center' });

    // Recibe
    doc.line(margin + (sigWidth * 2) + 5, y, margin + contentWidth - 5, y);
    doc.text('Recibe', margin + (sigWidth * 2) + (sigWidth / 2), y + 4, { align: 'center' });
    doc.text('Proveedor', margin + (sigWidth * 2) + (sigWidth / 2), y + 8, { align: 'center' });
    doc.text(data.recibe || '', margin + (sigWidth * 2) + (sigWidth / 2), y - 2, { align: 'center' });

    // Footer
    y += 15;
    doc.setFontSize(6);
    doc.text('DOCUMENTO CONTROLADO | PROHIBIDA SU REPRODUCCIÓN NO AUTORIZADA', pageWidth / 2, y, { align: 'center' });

    // Open
    openPDFInNewTab(doc, `F-IBM-05_${data.folio}.pdf`);
};
