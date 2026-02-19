import { useState, useCallback, useMemo } from 'react';
import { Reservation, ReservationFormData } from '@/types/reservation';
import { mockReservations } from '@/data/mockReservations';
import { toast } from 'sonner';

export function useReservations() {
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations);
  const [isLoading] = useState(false);

  const hasOverlap = useCallback(
    (checkIn: string, checkOut: string, excludeId?: string) => {
      return reservations.some((r) => {
        if (r.id === excludeId || r.status === 'cancelled') return false;
        return checkIn < r.checkOut && checkOut > r.checkIn;
      });
    },
    [reservations]
  );

  const createReservation = useCallback(
    (data: ReservationFormData): boolean => {
      if (hasOverlap(data.checkIn, data.checkOut)) {
        toast.error('Las fechas se superponen con otra reserva existente.');
        return false;
      }
      const newReservation: Reservation = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      setReservations((prev) => [...prev, newReservation]);
      toast.success('Reserva creada exitosamente');
      return true;
    },
    [hasOverlap]
  );

  const updateReservation = useCallback(
    (id: string, data: ReservationFormData): boolean => {
      if (hasOverlap(data.checkIn, data.checkOut, id)) {
        toast.error('Las fechas se superponen con otra reserva existente.');
        return false;
      }
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...data } : r))
      );
      toast.success('Reserva actualizada exitosamente');
      return true;
    },
    [hasOverlap]
  );

  const deleteReservation = useCallback((id: string) => {
    setReservations((prev) => prev.filter((r) => r.id !== id));
    toast.success('Reserva eliminada');
  }, []);

  const activeReservations = useMemo(
    () => reservations.filter((r) => r.status !== 'cancelled'),
    [reservations]
  );

  return {
    reservations,
    isLoading,
    createReservation,
    updateReservation,
    deleteReservation,
    activeReservations,
  };
}
