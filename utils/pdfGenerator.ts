import { jsPDF } from 'jspdf';

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

    // Title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('CÉDULA DE BAJA DE EQUIPO MÉDICO', pageWidth / 2, 20, { align: 'center' });
    doc.text('DEPARTAMENTO DE INGENIERÍA BIOMÉDICA', pageWidth / 2, 28, { align: 'center' });

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

    // Title
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('CÉDULA DE BAJA DE EQUIPO MÉDICO', pageWidth / 2, 15, { align: 'center' });
    doc.text('CON RADIACIÓN IONIZANTE', pageWidth / 2, 22, { align: 'center' });
    doc.text('DEPARTAMENTO DE INGENIERÍA BIOMÉDICA', pageWidth / 2, 29, { align: 'center' });

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
    drawCell(margin, y, halfWidth, rowHeight + 5, 'NÚMERO Y FECHA DE LA LICENCIA',
        `${data.numeroLicencia || ''} - ${data.fechaLicencia || ''}`);
    drawCell(margin + halfWidth, y, halfWidth, rowHeight + 5, 'NOMBRE DEL RESPONSABLE DE SEGURIDAD RADIOLÓGICA',
        data.responsableSeguridad || '');
    y += rowHeight + 5;

    // Fecha Alta | Fecha Baja
    drawCell(margin, y, halfWidth, rowHeight, 'FECHA DE ALTA', data.fechaAlta);
    drawCell(margin + halfWidth, y, halfWidth, rowHeight, 'FECHA DE BAJA', data.fechaBaja);
    y += rowHeight;

    // Destino Final | Contenedor
    drawCell(margin, y, halfWidth, rowHeight + 5, 'DESTINO FINAL PROPUESTO', data.destinoFinal || '');
    drawCell(margin + halfWidth, y, halfWidth, rowHeight + 5, 'TIPO, MARCA, MODELO DEL CONTENEDOR PARA TRASLADO',
        data.contenedorTraslado || '');
    y += rowHeight + 5;

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

    // Title
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('ACTA ADMINISTRATIVA PARA LA BAJA DE EQUIPO MÉDICO', pageWidth / 2, 20, { align: 'center' });
    doc.text('DEPARTAMENTO DE INGENIERÍA BIOMÉDICA', pageWidth / 2, 28, { align: 'center' });

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
