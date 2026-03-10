import { Reservation, ReservationFormData, BlockedDateFormData, BlockedDate } from '@/types/reservation';
import { apiReservas, BackendReserva, ApiResponse, PROPERTY_TO_CASA_ID, CASA_ID_TO_PROPERTY } from './api';

/**
 * Convierte datos del backend a formato frontend (Reservation)
 */
export function backendToFrontendReservation(backendData: BackendReserva): Reservation {
  return {
    id: String(backendData.id),
    guestName: backendData.title,
    checkIn: backendData.start,
    checkOut: backendData.end,
    phone: backendData.telefono,
    notes: '', // Backend no guarda notas
    status: 'pending', // Usuario indicó que lo manejaría luego
    property: CASA_ID_TO_PROPERTY[backendData.casa_id] as 'onoke' | 'asike',
    guests: backendData.personas,
    total: backendData.costo,
    deposit: backendData.sena,
    color: backendData.color,
    createdAt: new Date().toISOString(), // Backend no devuelve timestamp
  };
}

/**
 * Convierte datos del frontend a formato backend
 * Maneja tanto Reservations como BlockedDates
 */
export function frontendToBackendReserva(
  data: ReservationFormData | BlockedDateFormData,
  isBlocked: boolean = false
) {
  const isReservation = !isBlocked;
  const casaId = PROPERTY_TO_CASA_ID[data.property];
  
  if (isReservation) {
    const formData = data as ReservationFormData;
    return {
      casa_id: casaId,
      fecha_inicio: formData.checkIn,
      fecha_fin: formData.checkOut,
      nombre: formData.guestName,
      personas: formData.guests,
      costo: formData.total,
      sena: formData.deposit,
      es_reserva: true,
      color: formData.color || '#10B981',
      telefono: formData.phone,
    };
  } else {
    const blockedData = data as BlockedDateFormData;
    return {
      casa_id: casaId,
      fecha_inicio: blockedData.startDate,
      fecha_fin: blockedData.endDate,
      nombre: blockedData.reason || 'Bloqueado',
      personas: 0,
      costo: 0,
      sena: 0,
      es_reserva: false,
      color: '#EF4444', // Rojo para bloqueos
      telefono: '',
    };
  }
}

/**
 * Obtiene todas las reservas y bloqueos del backend
 */
/**
 * Determina si un color corresponde a un bloqueo (rojo)
 */
function isBlockedColor(color: string): boolean {
  const colorLower = color.toLowerCase();
  // Detecta variantes de rojo: "red", "#EF4444", "#FF0000", etc.
  return (
    colorLower === 'red' ||
    colorLower.includes('#ef') ||
    colorLower.includes('#ff0000') ||
    colorLower.includes('ff0000')
  );
}

export async function fetchReservationsFromBackend(): Promise<{
  reservations: Reservation[];
  blockedDates: BlockedDate[];
}> {
  try {
    const backendData = await apiReservas.getAll();
    
    const reservations: Reservation[] = [];
    const blockedDates: BlockedDate[] = [];

    for (const item of backendData) {
      // Determinar si es bloqueo basado en el color
      const isBlocked = isBlockedColor(item.color);
      
      if (!isBlocked) {
        // Es una reserva
        reservations.push(backendToFrontendReservation(item));
      } else {
        // Es un bloqueo
        blockedDates.push({
          id: String(item.id),
          startDate: item.start,
          endDate: item.end,
          reason: item.title,
          property: CASA_ID_TO_PROPERTY[item.casa_id] as 'onoke' | 'asike',
          createdAt: new Date().toISOString(),
        });
      }
    }

    return { reservations, blockedDates };
  } catch (error) {
    console.error('Error fetching reservations from backend:', error);
    throw error;
  }
}

/**
 * Crea una reserva en el backend
 */
export async function createReservationInBackend(data: ReservationFormData): Promise<number> {
  try {
    const backendData = frontendToBackendReserva(data, false);
    await apiReservas.create(backendData);
    
    const allData = await apiReservas.getAll();
    const lastReservation = allData
      .filter(item => !isBlockedColor(item.color))
      .sort((a, b) => b.id - a.id)[0];
    
    return lastReservation?.id ?? 0;
  } catch (error) {
    console.error('Error creating reservation:', error);
    throw error;
  }
}

/**
 * Actualiza una reserva en el backend
 */
export async function updateReservationInBackend(id: string, data: ReservationFormData): Promise<boolean> {
  try {
    const backendData = frontendToBackendReserva(data, false);
    const response = await apiReservas.update(Number(id), backendData);
    return response.ok;
  } catch (error) {
    console.error('Error updating reservation:', error);
    throw error;
  }
}

/**
 * Elimina una reserva del backend
 */
export async function deleteReservationFromBackend(id: string): Promise<boolean> {
  try {
    const response = await apiReservas.delete(Number(id));
    return response.ok;
  } catch (error) {
    console.error('Error deleting reservation:', error);
    throw error;
  }
}

/**
 * Crea un bloqueo en el backend
 */
export async function createBlockedDateInBackend(data: BlockedDateFormData): Promise<number> {
  try {
    const backendData = frontendToBackendReserva(data, true);
    await apiReservas.create(backendData);
    
    const allData = await apiReservas.getAll();
    const lastBlock = allData
      .filter(item => isBlockedColor(item.color))
      .sort((a, b) => b.id - a.id)[0];
    
    return lastBlock?.id ?? 0;
  } catch (error) {
    console.error('Error creating blocked date:', error);
    throw error;
  }
}

/**
 * Elimina un bloqueo del backend
 */
export async function deleteBlockedDateFromBackend(id: string): Promise<boolean> {
  try {
    const response = await apiReservas.delete(Number(id));
    return response.ok;
  } catch (error) {
    console.error('Error deleting blocked date:', error);
    throw error;
  }
}
