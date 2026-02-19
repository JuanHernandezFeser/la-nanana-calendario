import { useState, useCallback, useMemo } from 'react';
import { Reservation, ReservationFormData, BlockedDate, BlockedDateFormData, PropertyId } from '@/types/reservation';
import { mockReservations, mockBlockedDates } from '@/data/mockReservations';
import { toast } from 'sonner';

export function useReservations() {
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>(mockBlockedDates);

  const hasOverlap = useCallback(
    (property: PropertyId, checkIn: string, checkOut: string, excludeId?: string) => {
      const reservationOverlap = reservations.some((r) => {
        if (r.id === excludeId || r.status === 'cancelled' || r.property !== property) return false;
        return checkIn < r.checkOut && checkOut > r.checkIn;
      });
      if (reservationOverlap) return true;

      const blockedOverlap = blockedDates.some((b) => {
        if (b.property !== property) return false;
        return checkIn < b.endDate && checkOut > b.startDate;
      });
      return blockedOverlap;
    },
    [reservations, blockedDates]
  );

  const createReservation = useCallback(
    (data: ReservationFormData): boolean => {
      if (hasOverlap(data.property, data.checkIn, data.checkOut)) {
        toast.error('Las fechas se superponen con otra reserva o bloqueo existente.');
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
      if (hasOverlap(data.property, data.checkIn, data.checkOut, id)) {
        toast.error('Las fechas se superponen con otra reserva o bloqueo existente.');
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

  const createBlockedDate = useCallback(
    (data: BlockedDateFormData): boolean => {
      if (hasOverlap(data.property, data.startDate, data.endDate)) {
        toast.error('Las fechas se superponen con otra reserva o bloqueo existente.');
        return false;
      }
      const newBlock: BlockedDate = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      setBlockedDates((prev) => [...prev, newBlock]);
      toast.success('Fechas bloqueadas exitosamente');
      return true;
    },
    [hasOverlap]
  );

  const deleteBlockedDate = useCallback((id: string) => {
    setBlockedDates((prev) => prev.filter((b) => b.id !== id));
    toast.success('Bloqueo eliminado');
  }, []);

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
  };
}
