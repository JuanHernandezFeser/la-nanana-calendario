import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Reservation, PROPERTIES } from '@/types/reservation';
import { StatusBadge } from './StatusBadge';
import { format, parseISO, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarDays, Phone, FileText, Pencil, Trash2, Home } from 'lucide-react';
import { motion } from 'framer-motion';

interface ReservationDetailModalProps {
  open: boolean;
  onClose: () => void;
  reservation: Reservation | null;
  onEdit: (reservation: Reservation) => void;
  onDelete: (id: string) => void;
}

export function ReservationDetailModal({
  open,
  onClose,
  reservation,
  onEdit,
  onDelete,
}: ReservationDetailModalProps) {
  if (!reservation) return null;

  const nights = differenceInDays(parseISO(reservation.checkOut), parseISO(reservation.checkIn));

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border-border/50">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="p-6"
        >
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="font-display text-xl">
                {reservation.guestName}
              </DialogTitle>
              <StatusBadge status={reservation.status} />
            </div>
          </DialogHeader>

          <div className="mt-5 space-y-4">
            <div className="flex items-center gap-3">
              <Home className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{PROPERTIES[reservation.property]}</span>
            </div>

            <div className="flex items-start gap-3">
              <CalendarDays className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="text-sm">
                <p>
                  {format(parseISO(reservation.checkIn), "d 'de' MMMM", { locale: es })} →{' '}
                  {format(parseISO(reservation.checkOut), "d 'de' MMMM yyyy", { locale: es })}
                </p>
                <p className="text-muted-foreground">
                  {nights} {nights === 1 ? 'noche' : 'noches'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{reservation.phone}</span>
            </div>

            {reservation.notes && (
              <div className="flex items-start gap-3">
                <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{reservation.notes}</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border/50">
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => onDelete(reservation.id)}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Eliminar
            </Button>
            <Button size="sm" onClick={() => onEdit(reservation)}>
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              Editar
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
