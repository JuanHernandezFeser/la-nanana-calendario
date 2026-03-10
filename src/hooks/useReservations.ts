import { useState, useCallback, useMemo, useEffect } from 'react';
import { Reservation, ReservationFormData, BlockedDate, BlockedDateFormData, PropertyId } from '@/types/reservation';
import { mockReservations, mockBlockedDates } from '@/data/mockReservations';
import { toast } from 'sonner';
import { APP_CONFIG } from '@/config';
import {
  fetchReservationsFromBackend,
  createReservationInBackend,
  updateReservationInBackend,
  deleteReservationFromBackend,
  createBlockedDateInBackend,
  deleteBlockedDateFromBackend,
} from '@/lib/backendService';

export function useReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos del backend al montar
  useEffect(() => {
    if (!APP_CONFIG.USE_BACKEND) {
      setReservations(mockReservations);
      setBlockedDates(mockBlockedDates);
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const { reservations: backendReservations, blockedDates: backendBlockedDates } =
          await fetchReservationsFromBackend();
        setReservations(backendReservations);
        setBlockedDates(backendBlockedDates);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido al cargar datos';
        console.error('Error loading data from backend:', error);
        setError(errorMessage);
        toast.error(`Error al cargar: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const hasOverlap = useCallback(
    (property: PropertyId, checkIn: string, checkOut: string, excludeId?: string) => {
      const reservationOverlap = reservations.some((r) => {
        if (r.id === excludeId || r.status === 'cancelled' || r.property !== property) return false;
        return checkIn < r.checkOut && checkOut > r.checkIn;
      });
      if (reservationOverlap) return true;

      const blockedOverlap = blockedDates.some((b) => {
        if (b.property !== property) return false;
        return checkIn < b.checkOut && checkOut > b.checkIn;
      });
      return blockedOverlap;
    },
    [reservations, blockedDates]
  );

  const createReservation = useCallback(
    async (data: ReservationFormData): Promise<boolean> => {
      if (APP_CONFIG.USE_BACKEND) {
        try {
          const id = await createReservationInBackend(data);
          const newReservation: Reservation = {
            ...data,
            id: String(id),
            createdAt: new Date().toISOString(),
          };
          setReservations((prev) => [...prev, newReservation]);
          toast.success('Reserva creada exitosamente');
          return true;
        } catch (error) {
          console.error('Error creating reservation:', error);
          toast.error('Error al crear la reserva');
          return false;
        }
      } else {
        const newReservation: Reservation = {
          ...data,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        };
        setReservations((prev) => [...prev, newReservation]);
        toast.success('Reserva creada exitosamente');
        return true;
      }
    },
    []
  );

  const updateReservation = useCallback(
    async (id: string, data: ReservationFormData): Promise<boolean> => {
      if (APP_CONFIG.USE_BACKEND) {
        try {
          await updateReservationInBackend(id, data);
          setReservations((prev) =>
            prev.map((r) => (r.id === id ? { ...r, ...data } : r))
          );
          toast.success('Reserva actualizada exitosamente');
          return true;
        } catch (error) {
          console.error('Error updating reservation:', error);
          toast.error('Error al actualizar la reserva');
          return false;
        }
      } else {
        setReservations((prev) =>
          prev.map((r) => (r.id === id ? { ...r, ...data } : r))
        );
        toast.success('Reserva actualizada exitosamente');
        return true;
      }
    },
    []
  );

  const deleteReservation = useCallback(
    async (id: string) => {
      if (APP_CONFIG.USE_BACKEND) {
        try {
          await deleteReservationFromBackend(id);
          setReservations((prev) => prev.filter((r) => r.id !== id));
          toast.success('Reserva eliminada');
        } catch (error) {
          console.error('Error deleting reservation:', error);
          toast.error('Error al eliminar la reserva');
        }
      } else {
        setReservations((prev) => prev.filter((r) => r.id !== id));
        toast.success('Reserva eliminada');
      }
    },
    []
  );

  const createBlockedDate = useCallback(
    async (data: BlockedDateFormData): Promise<boolean> => {
      if (APP_CONFIG.USE_BACKEND) {
        try {
          const id = await createBlockedDateInBackend(data);
          const newBlock: BlockedDate = {
            ...data,
            id: String(id),
          };
          setBlockedDates((prev) => [...prev, newBlock]);
          toast.success('Fechas bloqueadas exitosamente');
          return true;
        } catch (error) {
          console.error('Error creating blocked date:', error);
          toast.error('Error al bloquear fechas');
          return false;
        }
      } else {
        const newBlock: BlockedDate = {
          ...data,
          id: crypto.randomUUID(),
        };
        setBlockedDates((prev) => [...prev, newBlock]);
        toast.success('Fechas bloqueadas exitosamente');
        return true;
      }
    },
    []
  );

  const deleteBlockedDate = useCallback(
    async (id: string) => {
      if (APP_CONFIG.USE_BACKEND) {
        try {
          await deleteBlockedDateFromBackend(id);
          setBlockedDates((prev) => prev.filter((b) => b.id !== id));
          toast.success('Bloqueo eliminado');
        } catch (error) {
          console.error('Error deleting blocked date:', error);
          toast.error('Error al eliminar el bloqueo');
        }
      } else {
        setBlockedDates((prev) => prev.filter((b) => b.id !== id));
        toast.success('Bloqueo eliminado');
      }
    },
    []
  );

  const activeReservations = useMemo(
    () => reservations.filter((r) => r.status !== 'cancelled'),
    [reservations]
  );

  return {
    reservations,
    blockedDates,
    createReservation,
    updateReservation,
    deleteReservation,
    createBlockedDate,
    deleteBlockedDate,
    activeReservations,
    isLoading,
    error,
  };
}
