import { Badge } from '@/components/ui/badge';
import { ReservationStatus } from '@/types/reservation';
import { STATUS_LABELS, STATUS_STYLES } from '@/lib/reservationUtils';

interface StatusBadgeProps {
  status: ReservationStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={`${STATUS_STYLES[status]} border-0 font-medium text-xs`}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
