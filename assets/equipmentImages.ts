// FIX: Populated equipmentImages.ts with placeholder data to resolve module errors.

// In a real app, these would be imported from image files
// import monitor from './images/monitor.jpg';
// For this mock, we'll use placeholder image URLs.

const placeholder = (width: number, height: number, text: string) => `https://via.placeholder.com/${width}x${height}.png?text=${encodeURIComponent(text)}`;

export const EQUIPMENT_IMAGES = {
    monitor: placeholder(400, 400, 'Monitor de Signos Vitales'),
    ventilator: placeholder(400, 400, 'Ventilador Mecánico'),
    infusionPump: placeholder(400, 400, 'Bomba de Infusión'),
    ecg: placeholder(400, 400, 'Electrocardiógrafo'),
    defibrillator: placeholder(400, 400, 'Desfibrilador'),
};
