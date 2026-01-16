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

export interface LoanRequestData {
    folio: string;
    requesterName: string;
    requesterPosition: string;
    requestingArea: string;
    requestDate: string;
    reason: string;
    duration: string;
    items: {
        name: string;
        brand: string;
        model: string;
        accessories: string;
        quantity: number;
    }[];
    providerCompany: string;
    providerAddress: string;
    providerContacts: string;
    authorizedBy: string;
}

export const generateLoanRequestPDF = (data: LoanRequestData): void => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);

    // -- Header --
    doc.setDrawColor(0);
    // Left Box (Logo)
    doc.rect(margin, 10, 50, 20);
    doc.addImage(HOSPITAL_LOGO, 'PNG', margin + 2, 11, 46, 18);

    // Middle Box (Title)
    doc.setFillColor(40, 40, 40);
    doc.rect(margin + 50, 10, 80, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('SOLICITUD DE', margin + 90, 16, { align: 'center' });
    doc.text('EQUIPO EN', margin + 90, 21, { align: 'center' });
    doc.text('COMODATO', margin + 90, 26, { align: 'center' });

    // Right Box (Meta)
    doc.setTextColor(0, 0, 0);
    doc.rect(margin + 130, 10, 50, 20);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('F-IBM-06', margin + 178, 14, { align: 'right' });
    doc.text('Fecha de emisión: Diciembre 2025', margin + 178, 19, { align: 'right' });
    doc.text('Fecha de revisión: Diciembre 2027', margin + 178, 24, { align: 'right' });
    doc.text('Versión 1', margin + 178, 29, { align: 'right' });
    doc.text('1 de 1', margin + 178, 34, { align: 'right' }); // Just below box or inside? Image shows inside bottom right roughly.

    let y = 35;

    // Helper for Section Headers
    const drawSectionHeader = (text: string, yPos: number) => {
        doc.setFillColor(80, 80, 80);
        doc.setTextColor(255, 255, 255);
        doc.rect(margin, yPos, contentWidth, 7, 'F');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(text, margin + (contentWidth / 2), yPos + 5, { align: 'center' });
        return yPos + 7;
    };

    // Datos del Solicitante
    y = drawSectionHeader('Datos del solicitante', y);
    doc.setTextColor(0);
    doc.setFontSize(9);

    // Headers Row
    doc.setFillColor(150, 150, 150);
    doc.setTextColor(255, 255, 255);
    doc.rect(margin, y, contentWidth, 6, 'F');
    doc.text('Nombre', margin + (contentWidth / 8), y + 4, { align: 'center' });
    doc.text('Puesto', margin + (contentWidth * 3 / 8), y + 4, { align: 'center' });
    doc.text('Área solicitante', margin + (contentWidth * 5 / 8), y + 4, { align: 'center' });
    doc.text('Fecha', margin + (contentWidth * 7 / 8), y + 4, { align: 'center' });
    y += 6;

    // Values Row
    doc.setTextColor(0);
    doc.setFont('helvetica', 'normal');
    doc.rect(margin, y, contentWidth / 4, 10);
    doc.text(data.requesterName, margin + 2, y + 6);
    doc.rect(margin + (contentWidth / 4), y, contentWidth / 4, 10);
    doc.text(data.requesterPosition, margin + (contentWidth / 4) + 2, y + 6);
    doc.rect(margin + (contentWidth / 2), y, contentWidth / 4, 10);
    doc.text(data.requestingArea, margin + (contentWidth / 2) + 2, y + 6);
    doc.rect(margin + (contentWidth * 3 / 4), y, contentWidth / 4, 10);
    doc.text(data.requestDate, margin + (contentWidth * 3 / 4) + 2, y + 6);
    y += 15;

    // Motivo y Tiempo
    const halfWidth = contentWidth / 2;
    doc.setFillColor(80, 80, 80);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.rect(margin, y, halfWidth, 7, 'F');
    doc.text('Motivo de solicitud', margin + (halfWidth / 2), y + 5, { align: 'center' });
    doc.rect(margin + halfWidth, y, halfWidth, 7, 'F');
    doc.text('Tiempo en comodato', margin + halfWidth + (halfWidth / 2), y + 5, { align: 'center' });
    y += 7;

    doc.setTextColor(0);
    doc.setFont('helvetica', 'normal');
    doc.rect(margin, y, halfWidth, 15);
    addWrappedText(doc, data.reason, margin + 2, y + 5, halfWidth - 4, 4);
    doc.rect(margin + halfWidth, y, halfWidth, 15);
    doc.text(data.duration, margin + halfWidth + 2, y + 8);
    y += 20;

    // Datos del Equipo
    y = drawSectionHeader('Datos del equipo', y);

    // Table Headers
    const col1 = margin;
    const w1 = 50; // Nombre
    const col2 = col1 + w1;
    const w2 = 30; // Marca
    const col3 = col2 + w2;
    const w3 = 30; // Modelo
    const col4 = col3 + w3;
    const w4 = 50; // Accesorios
    const col5 = col4 + w4;
    const w5 = 20; // Cantidad - remaining

    doc.setFillColor(150, 150, 150);
    doc.setTextColor(255, 255, 255);
    doc.rect(margin, y, contentWidth, 6, 'F');
    doc.setFontSize(8);
    doc.text('Nombre del equipo', col1 + 2, y + 4);
    doc.text('Marca', col2 + 2, y + 4);
    doc.text('Modelo', col3 + 2, y + 4);
    doc.text('Accesorios / Insumos', col4 + 2, y + 4);
    doc.text('Cantidad', col5 + 2, y + 4);
    y += 6;

    // Table Body
    doc.setTextColor(0);
    doc.setFont('helvetica', 'normal');

    // Ensure at least 5 rows like in the image
    const rowsToRender = Math.max(data.items.length, 5);

    for (let i = 0; i < rowsToRender; i++) {
        const item = data.items[i] || { name: '', brand: '', model: '', accessories: '', quantity: '' };

        doc.rect(col1, y, w1, 8);
        doc.text(item.name, col1 + 1, y + 5);

        doc.rect(col2, y, w2, 8);
        doc.text(item.brand || '', col2 + 1, y + 5);

        doc.rect(col3, y, w3, 8);
        doc.text(item.model || '', col3 + 1, y + 5);

        doc.rect(col4, y, w4, 8);
        doc.text(item.accessories || '', col4 + 1, y + 5);

        doc.rect(col5, y, w5, 8); // adjusted width to fit contentWidth
        doc.text(String(item.quantity || ''), col5 + 1, y + 5);

        y += 8;
    }
    y += 5;

    // Datos del proveedor
    y = drawSectionHeader('Datos del proveedor', y);
    doc.setFillColor(150, 150, 150);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.rect(margin, y, contentWidth, 6, 'F');
    doc.text('Empresa', margin + (contentWidth / 6), y + 4, { align: 'center' });
    doc.text('Dirección', margin + (contentWidth / 2), y + 4, { align: 'center' });
    doc.text('Contactos', margin + (contentWidth * 5 / 6), y + 4, { align: 'center' });
    y += 6;

    doc.setTextColor(0);
    doc.setFont('helvetica', 'normal');
    const provHeight = 15;
    doc.rect(margin, y, contentWidth / 3, provHeight);
    addWrappedText(doc, data.providerCompany, margin + 2, y + 5, (contentWidth / 3) - 4, 4);

    doc.rect(margin + (contentWidth / 3), y, contentWidth / 3, provHeight);
    addWrappedText(doc, data.providerAddress, margin + (contentWidth / 3) + 2, y + 5, (contentWidth / 3) - 4, 4);

    doc.rect(margin + (contentWidth * 2 / 3), y, contentWidth / 3, provHeight);
    addWrappedText(doc, data.providerContacts, margin + (contentWidth * 2 / 3) + 2, y + 5, (contentWidth / 3) - 4, 4);
    y += 20;

    // Signatures
    y += 30; // Space for signature
    const sigWidth = 80;

    // Solicita
    doc.line(margin + 10, y, margin + 10 + sigWidth, y);
    doc.setFont('helvetica', 'bold');
    doc.text('Solicita', margin + 10 + (sigWidth / 2), y + 5, { align: 'center' });
    doc.text('Ingeniería Biomédica', margin + 10 + (sigWidth / 2), y + 10, { align: 'center' });

    // Autoriza
    doc.line(pageWidth - margin - 10 - sigWidth, y, pageWidth - margin - 10, y);
    doc.text('Autoriza', pageWidth - margin - 10 - (sigWidth / 2), y + 5, { align: 'center' });
    doc.text('Dirección Médica', pageWidth - margin - 10 - (sigWidth / 2), y + 10, { align: 'center' });

    // Footer
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.text('DOCUMENTO CONTROLADO | PROHIBIDA SU REPRODUCCIÓN NO AUTORIZADA', pageWidth / 2, pageWidth - 20, { align: 'center' }); // Bottom of page roughly

    openPDFInNewTab(doc, `F-IBM-06_${data.folio}.pdf`);
};

// Interface for F-IBM-10 Internal Departure Data
export interface InternalDepartureData {
    folio: string;
    date: string; // Emisión Dic 2025
    location: string;
    equipmentName: string;
    brand: string;
    model: string;
    serialNumber: string;
    inventoryNumber: string;
    accessories: string;
    description: string;
    imageUrls: string[]; // For evidence
    reason: 'Donación' | 'Préstamo' | 'Devolución' | 'Otro';
    reasonOther?: string;
    observations: string;
    sender: string; // Entrega
    receiver: string; // Recibe
    receiverPosition: string;
}

export const generateInternalDeparturePDF = (data: InternalDepartureData): void => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    let y = 15;

    // -- Header --
    // Logo
    doc.addImage(HOSPITAL_LOGO, 'PNG', margin, y, 40, 15);

    // Title Box
    doc.setFillColor(30, 30, 30); // Dark Gray/Black
    doc.rect(margin + 45, y, 70, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('SALIDA INTERNA', margin + 80, y + 6, { align: 'center' });
    doc.text('DE EQUIPO', margin + 80, y + 11, { align: 'center' });

    // Info Box (Right)
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('F-IBM-10', pageWidth - margin, y + 4, { align: 'right' });
    doc.text('Fecha de emisión: Diciembre 2025', pageWidth - margin, y + 8, { align: 'right' });
    doc.text('Fecha de revisión: Diciembre 2027', pageWidth - margin, y + 12, { align: 'right' });
    doc.text('Versión 1', pageWidth - margin, y + 16, { align: 'right' });

    y += 25;

    // Folio & Date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, margin, y);
    doc.text(`Folio: ${data.folio}`, margin, y + 5);
    y += 10;

    // Helper for table rows
    const drawRow = (label1: string, val1: string, label2: string, val2: string, currentY: number) => {
        doc.setFillColor(100, 100, 100); // Gray Header
        doc.rect(margin, currentY, contentWidth / 2, 6, 'F');
        doc.rect(margin + (contentWidth / 2), currentY, contentWidth / 2, 6, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.text(label1, margin + (contentWidth / 4), currentY + 4, { align: 'center' });
        doc.text(label2, margin + (contentWidth * 0.75), currentY + 4, { align: 'center' });

        doc.setDrawColor(0);
        doc.setFillColor(255, 255, 255);
        doc.setTextColor(0, 0, 0);

        // Values
        doc.rect(margin, currentY + 6, contentWidth / 2, 8);
        doc.rect(margin + (contentWidth / 2), currentY + 6, contentWidth / 2, 8);

        doc.setFont('helvetica', 'normal');
        doc.text(val1 || '', margin + 2, currentY + 11);
        doc.text(val2 || '', margin + (contentWidth / 2) + 2, currentY + 11);

        return currentY + 14;
    };

    y = drawRow('Ubicación del equipo', data.location, 'Equipo', data.equipmentName, y);
    y = drawRow('Marca', data.brand, 'Modelo', data.model, y);
    y = drawRow('No. de serie', data.serialNumber, 'No. de inventario', data.inventoryNumber, y);

    // Accessories
    doc.setFillColor(100, 100, 100);
    doc.rect(margin, y, contentWidth, 6, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('Partes y/o accesorios', pageWidth / 2, y + 4, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    doc.rect(margin, y + 6, contentWidth, 15);
    doc.setFont('helvetica', 'normal');
    doc.text(data.accessories || 'Ninguno', margin + 2, y + 11);
    y += 25;

    // Description & Evidence
    doc.setFillColor(100, 100, 100);
    doc.rect(margin, y, contentWidth, 6, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('Descripción y evidencia fotográfica', pageWidth / 2, y + 4, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    doc.rect(margin, y + 6, contentWidth, 50);
    doc.text(data.description || 'Sin descripción.', margin + 2, y + 11);

    // Images Integration (Mock)
    if (data.imageUrls && data.imageUrls.length > 0) {
        // Just list them for now or try to add if they are valid Base64/URL
        let imgX = margin + 5;
        let imgY = y + 15;
        data.imageUrls.forEach((url, index) => {
            if (index < 3) {
                doc.setFontSize(8);
                doc.text(`[Imagen adjunta ${index + 1}]`, imgX, imgY);
                imgX += 40;
            }
        });
    }

    y += 60;

    // Reason
    doc.setFillColor(100, 100, 100);
    doc.rect(margin, y, contentWidth, 6, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('Motivo de salida', pageWidth / 2, y + 4, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    doc.rect(margin, y + 6, contentWidth, 12);

    // Checkboxes
    const reasonY = y + 10;
    doc.setFont('helvetica', 'normal');

    const check = (label: string, isChecked: boolean, x: number) => {
        doc.rect(x, reasonY - 2, 4, 4);
        if (isChecked) {
            const currentSize = doc.getFontSize();
            doc.setFontSize(8);
            doc.text('X', x + 1, reasonY + 1.5);
            doc.setFontSize(currentSize);
        }
        doc.text(label, x + 6, reasonY + 1);
    };

    check('Donación', data.reason === 'Donación', margin + 5);
    check('Préstamo', data.reason === 'Préstamo', margin + 40);
    check('Devolución', data.reason === 'Devolución', margin + 75);
    check('Otro', data.reason === 'Otro', margin + 110);
    if (data.reason === 'Otro' && data.reasonOther) {
        doc.text(`: ${data.reasonOther}`, margin + 125, reasonY + 1);
    }

    y += 22;

    // Observations
    doc.setFillColor(100, 100, 100);
    doc.rect(margin, y, contentWidth, 6, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('Observaciones', pageWidth / 2, y + 4, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    doc.rect(margin, y + 6, contentWidth, 20);
    doc.setFont('helvetica', 'normal');
    doc.text(data.observations || '', margin + 2, y + 11);

    y += 30;

    // Signatures
    doc.setFillColor(100, 100, 100);
    doc.rect(margin, y, contentWidth / 2 - 2, 6, 'F'); // Salida
    doc.rect(margin + (contentWidth / 2) + 2, y, contentWidth / 2 - 2, 6, 'F'); // Recepción

    doc.setTextColor(255, 255, 255);
    doc.text('Salida', margin + (contentWidth / 4), y + 4, { align: 'center' });
    doc.text('Recepción', margin + (contentWidth * 0.75), y + 4, { align: 'center' });

    y += 30; // Space for signatures

    doc.setDrawColor(0);
    doc.setTextColor(0, 0, 0);

    const sigY = y;
    const colW = contentWidth / 4;

    doc.line(margin, sigY, margin + colW - 5, sigY); // 1
    doc.line(margin + colW, sigY, margin + (colW * 2) - 5, sigY); // 2
    doc.line(margin + (colW * 2), sigY, margin + (colW * 3) - 5, sigY); // 3
    doc.line(margin + (colW * 3), sigY, margin + contentWidth, sigY); // 4

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');

    doc.text('Entrega', margin + (colW / 2) - 2.5, sigY + 4, { align: 'center' });
    doc.text('Ingeniería Biomédica', margin + (colW / 2) - 2.5, sigY + 8, { align: 'center' });
    doc.text(data.sender, margin + (colW / 2) - 2.5, sigY + 12, { align: 'center' });

    doc.text('Autorización', margin + (colW * 1.5) - 2.5, sigY + 4, { align: 'center' });
    doc.text('Dirección Médica', margin + (colW * 1.5) - 2.5, sigY + 8, { align: 'center' });

    doc.text('Traslada', margin + (colW * 2.5) - 2.5, sigY + 4, { align: 'center' });
    doc.text('Nombre del Responsable', margin + (colW * 2.5) - 2.5, sigY + 8, { align: 'center' });

    doc.text('Recibe', margin + (colW * 3.5), sigY + 4, { align: 'center' });
    doc.text('Nombre y cargo', margin + (colW * 3.5), sigY + 8, { align: 'center' });
    doc.text(data.receiver, margin + (colW * 3.5), sigY + 12, { align: 'center' });
    doc.text(data.receiverPosition, margin + (colW * 3.5), sigY + 15, { align: 'center' });

    // Footer
    doc.setFontSize(6);
    doc.setTextColor(150);
    doc.text('DOCUMENTO CONTROLADO | PROHIBIDA SU REPRODUCCIÓN NO AUTORIZADA', pageWidth / 2, pageWidth - 10, { align: 'center' });

    openPDFInNewTab(doc, `F-IBM-10_${data.folio}.pdf`);
};
