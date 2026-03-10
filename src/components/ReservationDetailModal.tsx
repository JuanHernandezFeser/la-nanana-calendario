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
import { formatCurrency } from '@/lib/utils';

async function generateVoucherImage(reservation: any): Promise<string | null> {
  // Portrait format
  const width = 675;
  const height = 640;
  const padding = 36;
  const headerHeight = 140;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Header bar with reservation color (or primary)
  const headerColor = reservation.color ?? '#10B981';
  ctx.fillStyle = headerColor;
  ctx.fillRect(0, 0, width, headerHeight);

  // Title
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 22px sans-serif';
  ctx.fillText('VOUCHER - Reserva Confirmada', padding, headerHeight / 2 + 8);

  // Body texts
  ctx.fillStyle = '#0f172a';
  ctx.font = '600 20px sans-serif';
  ctx.fillText(reservation.guestName || '', padding, headerHeight + 48);

  ctx.font = '500 16px sans-serif';
  const lineHeight = 28;
  let y = headerHeight + 90;
  const addLine = (label: string, value: string) => {
    ctx.fillStyle = '#374151';
    ctx.fillText(label, padding, y);
    ctx.fillStyle = '#111827';
    ctx.fillText(value, padding + 150, y);
    y += lineHeight;
  };

  addLine('Casa:', PROPERTIES[reservation.property]);
  addLine('Check-In:', reservation.checkIn);
  addLine('Check-Out:', reservation.checkOut);
  addLine('Noches:', String(Math.max(0, (new Date(reservation.checkOut).getTime() - new Date(reservation.checkIn).getTime()) / (1000 * 60 * 60 * 24))));
  addLine('Personas:', String(reservation.guests ?? ''));
  addLine('Teléfono:', reservation.phone ?? '');
  addLine('Valor total:', `$ ${formatCurrency(reservation.total)}`);
  addLine('Seña recibida:', `$ ${formatCurrency(reservation.deposit)}`);
  addLine('Saldo restante:', `$ ${formatCurrency(reservation.total - reservation.deposit)}`);

  // Try to load side image from public folder
  const imgSrc = '/voucher-photo.jpg';
  const loadImage = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Image load error'));
      img.src = src;
    });

  try {
    const img = await loadImage(imgSrc);
    // Draw circular image on the upper-right area with slight translucency (increased size)
    const imgSize = 160;
    const x = width - padding - imgSize;
    const yImg = headerHeight + 20;
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + imgSize / 2, yImg + imgSize / 2, imgSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.globalAlpha = 0.9;
    ctx.drawImage(img, x, yImg, imgSize, imgSize);
    ctx.globalAlpha = 1;
    ctx.restore();
  } catch (e) {
    // image missing — ignore
  }

  return canvas.toDataURL('image/png');
}

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
      <DialogContent className="w-full sm:max-w-[440px] p-0 overflow-hidden border-border/50">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="p-4 sm:p-6"
        >
          <DialogHeader>
            <div className="flex flex-col gap-1">
              <DialogTitle className="font-display text-xl text-left">
                {reservation.guestName}
              </DialogTitle>
              {/* <div className="pt-1 sm:pt-2">
                <StatusBadge status={reservation.status} />
              </div> */}
            </div>
            {reservation.color && (
              <div className="mt-2 sm:mt-3 flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: reservation.color }} />
                <span className="text-sm text-muted-foreground">Color: {reservation.color}</span>
              </div>
            )}
          </DialogHeader>

          <div className="mt-3 sm:mt-5 space-y-2 sm:space-y-4">
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

            <div className="flex items-center gap-3">
              <Home className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{reservation.guests} {reservation.guests === 1 ? 'persona' : 'personas'}</span>
            </div>

            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Valor total: <strong>$ {formatCurrency(reservation.total)}</strong></span>
            </div>

            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Seña: <strong>$ {formatCurrency(reservation.deposit)}</strong></span>
            </div>

            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Saldo restante: <strong>$ {formatCurrency(reservation.total - reservation.deposit)}</strong></span>
            </div>
          </div>

          <div className="flex justify-end gap-1 sm:gap-2 mt-4 sm:mt-6 pt-2 sm:pt-4 border-t border-border/50">
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
            <Button
              size="sm"
              onClick={async () => {
                try {
                  const dataUrl = await generateVoucherImage(reservation);
                  if (!dataUrl) throw new Error('No se pudo generar la imagen');
                  const link = document.createElement('a');
                  link.href = dataUrl;
                  const name = `voucher_${reservation.guestName?.replace(/\s+/g, '_') || reservation.id}.png`;
                  link.download = name;
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                } catch (e) {
                  console.error(e);
                }
              }}
            >
              Comprobante
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
