/**
 * Configuración de la aplicación
 * 
 * USE_BACKEND: true = Usar API del backend
 *               false = Usar datos mock locales
 */

export const APP_CONFIG = {
  // Cambiar a true para usar el backend real
  USE_BACKEND: true,
  
  // API Backend URL
  BACKEND_URL: 'https://calendariosierrabackend.onrender.com',
  
  // Mapeo de propiedades a IDs de casa en Supabase
  PROPERTY_TO_CASA_ID: {
    onoke: 1,
    asike: 2,
  } as const,
};
