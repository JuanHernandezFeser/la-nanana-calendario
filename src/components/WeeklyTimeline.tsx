import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Reservation, BlockedDate, PropertyId, PROPERTIES } from '@/types/reservation';
import {
  startOfWeek,
  addDays,
  format,
  parseISO,
  isBefore,
  isAfter,
  isSameDay,
  max,
  min,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface WeeklyTimelineProps {
  property: PropertyId;
  weekStart: Date;
  reservations: Reservation[];
  blockedDates: BlockedDate[];
  onReservationClick: (reservation: Reservation) => void;
  onBlockClick: (block: BlockedDate) => void;
}

export function WeeklyTimeline({
  property,
  weekStart,
  reservations,
  blockedDates,
  onReservationClick,
  onBlockClick,
}: WeeklyTimelineProps) {
  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  const weekEnd = addDays(weekStart, 7);

  const propertyReservations = useMemo(() => {
    return reservations.filter((r) => {
      if (r.property !== property || r.status === 'cancelled') return false;
      const checkIn = parseISO(r.checkIn);
      const checkOut = parseISO(r.checkOut);
      return isBefore(checkIn, weekEnd) && isAfter(checkOut, weekStart);
    });
  }, [reservations, property, weekStart, weekEnd]);

  const propertyBlocks = useMemo(() => {
    return blockedDates.filter((b) => {
      if (b.property !== property) return false;
      const start = parseISO(b.startDate);
      const end = parseISO(b.endDate);
      return isBefore(start, weekEnd) && isAfter(end, weekStart);
    });
  }, [blockedDates, property, weekStart, weekEnd]);

  const getBarStyle = (startDate: string, endDate: string) => {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    
    const clampedStart = max([start, weekStart]);
    const clampedEnd = min([end, weekEnd]);
    
    const startOffset = Math.max(0, (clampedStart.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
    const duration = (clampedEnd.getTime() - clampedStart.getTime()) / (1000 * 60 * 60 * 24);
    
    return {
      left: `${(startOffset / 7) * 100}%`,
      width: `${(duration / 7) * 100}%`,
    };
  };

  const dateRange = `${format(days[0], 'd', { locale: es })} – ${format(days[6], 'd', { locale: es })} ${format(days[6], "MMM yyyy", { locale: es })}`;

  return (
    <div className="space-y-2">
      <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground">
        {PROPERTIES[property]}
      </h2>
      <Card className="shadow-card border-border/50 overflow-hidden">
        {/* Date range header */}
        <div className="text-center py-2 border-b border-border/50">
          <span className="text-base font-display font-semibold text-foreground capitalize">
            {dateRange}
          </span>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-border/50">
          {days.map((day) => (
            <div
              key={day.toISOString()}
              className="p-2 text-center text-xs sm:text-sm font-medium text-primary border-r border-border/30 last:border-r-0"
            >
              <span className="underline cursor-pointer">
                {format(day, 'EEE d/M', { locale: es })}
              </span>
            </div>
          ))}
        </div>

        {/* Timeline rows */}
        <div className="relative min-h-[60px]">
          {/* Grid lines */}
          <div className="absolute inset-0 grid grid-cols-7">
            {days.map((day, i) => (
              <div key={i} className="border-r border-border/30 last:border-r-0" />
            ))}
          </div>

          {/* Reservation bars */}
          <div className="relative py-2 space-y-1 px-0">
            {propertyReservations.map((r) => {
              const style = getBarStyle(r.checkIn, r.checkOut);
              return (
                <div key={r.id} className="relative h-7" style={{ marginLeft: style.left, width: style.width }}>
                  <button
                    onClick={() => onReservationClick(r)}
                    className={cn(
                      'absolute inset-0 rounded-sm text-xs font-medium text-white px-2 truncate text-left flex items-center transition-opacity hover:opacity-90',
                      r.status === 'confirmed' && 'bg-[hsl(var(--status-confirmed))]',
                      r.status === 'pending' && 'bg-[hsl(var(--status-pending))]'
                    )}
                  >
                    {r.guestName}
                  </button>
                </div>
              );
            })}

            {/* Blocked date bars */}
            {propertyBlocks.map((b) => {
              const style = getBarStyle(b.startDate, b.endDate);
              return (
                <div key={b.id} className="relative h-7" style={{ marginLeft: style.left, width: style.width }}>
                  <button
                    onClick={() => onBlockClick(b)}
                    className="absolute inset-0 rounded-sm text-xs font-medium px-2 truncate text-left flex items-center bg-muted text-muted-foreground border border-border/50 transition-opacity hover:opacity-80"
                  >
                    {b.reason || 'Bloqueado'}
                  </button>
                </div>
              );
            })}

            {propertyReservations.length === 0 && propertyBlocks.length === 0 && (
              <div className="h-10" />
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
