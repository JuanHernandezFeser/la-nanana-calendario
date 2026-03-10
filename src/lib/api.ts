import { APP_CONFIG } from '@/config';

const API_BASE_URL = APP_CONFIG.BACKEND_URL;

// Mapeo de propiedades frontend a IDs de casa backend
const PROPERTY_TO_CASA_ID: Record<string, number> = APP_CONFIG.PROPERTY_TO_CASA_ID;

const CASA_ID_TO_PROPERTY: Record<number, string> = {
  1: 'onoke',
  2: 'asike',
};

export interface BackendReserva {
  id: number;
  casa_id: number;
  start: string; // fecha_inicio
  end: string; // fecha_fin
  title: string; // nombre
  personas: number;
  costo: number;
  sena: number;
  es_reserva: boolean;
  color: string;
  telefono: string;
}

export interface ApiResponse {
  ok: boolean;
  id?: number;
}

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export const apiReservas = {
  // Obtener todas las reservas de una casa
  getByProperty: async (property: string): Promise<BackendReserva[]> => {
    const casaId = PROPERTY_TO_CASA_ID[property];
    return fetchAPI<BackendReserva[]>(`/reservas?casa_id=${casaId}`);
  },

  // Obtener todas las reservas (ambas casas)
  getAll: async (): Promise<BackendReserva[]> => {
    return fetchAPI<BackendReserva[]>('/reservas');
  },

  // Crear reserva o bloqueo
  create: async (data: {
    casa_id: number;
    fecha_inicio: string;
    fecha_fin: string;
    nombre: string;
    personas: number;
    costo: number;
    sena: number;
    es_reserva: boolean;
    color: string;
    telefono: string;
  }): Promise<ApiResponse> => {
    return fetchAPI<ApiResponse>('/reservas', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Actualizar reserva o bloqueo
  update: async (
    id: number,
    data: {
      casa_id: number;
      fecha_inicio: string;
      fecha_fin: string;
      nombre: string;
      personas: number;
      costo: number;
      sena: number;
      es_reserva: boolean;
      color: string;
      telefono: string;
    }
  ): Promise<ApiResponse> => {
    return fetchAPI<ApiResponse>(`/reservas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Eliminar reserva o bloqueo
  delete: async (id: number): Promise<ApiResponse> => {
    return fetchAPI<ApiResponse>(`/reservas/${id}`, {
      method: 'DELETE',
    });
  },
};

export { PROPERTY_TO_CASA_ID, CASA_ID_TO_PROPERTY };
