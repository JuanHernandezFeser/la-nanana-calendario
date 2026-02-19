import { ReservationStatus } from '@/types/reservation';

export const STATUS_LABELS: Record<ReservationStatus, string> = {
  confirmed: 'Confirmada',
  pending: 'Pendiente',
  cancelled: 'Cancelada',
};

export const STATUS_STYLES: Record<ReservationStatus, string> = {
  confirmed: 'bg-status-confirmed-bg text-status-confirmed',
  pending: 'bg-status-pending-bg text-status-pending',
  cancelled: 'bg-status-cancelled-bg text-status-cancelled',
};
