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
import { cn, formatCurrency } from '@/lib/utils';
import { useRef, useState, useLayoutEffect } from 'react';
import { User } from 'lucide-react';

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

  const gridRef = useRef<HTMLDivElement>(null);
  const [dayWidth, setDayWidth] = useState(110);

  useLayoutEffect(() => {
    if (!gridRef.current) return;

    const resize = () => {
      const width = gridRef.current!.offsetWidth;
      setDayWidth(width / 7);
    };

    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(gridRef.current);

    return () => observer.disconnect();
  }, []);

  const weekEnd = addDays(weekStart, 6);

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

  // const getBarStyle = (startDate: string, endDate: string) => {
  //   const start = parseISO(startDate);
  //   const end = parseISO(endDate);

  //   const clampedStart = max([start, weekStart]);
  //   const clampedEnd = min([end, weekEnd]);

  //   const startOffset =
  //     (clampedStart.getTime() - weekStart.getTime()) /
  //     (1000 * 60 * 60 * 24);

  //   const duration =
  //     (clampedEnd.getTime() - clampedStart.getTime()) /
  //     (1000 * 60 * 60 * 24) + 1;

  //   const DAY_WIDTH = dayWidth;

  //   const leftPx = Math.round(startOffset * DAY_WIDTH);
  //   const widthPx = Math.max(Math.round(duration * DAY_WIDTH), DAY_WIDTH);

  //   return {
  //     left: `${leftPx}px`,
  //     width: `${widthPx}px`,
  //   };
  // };

  const getBarStyle = (startDate: string, endDate: string) => {
    const start = parseISO(startDate);
    const end = parseISO(endDate);

    const clampedStart = max([start, weekStart]);
    const clampedEnd = min([end, weekEnd]);

    const startOffset =
      (clampedStart.getTime() - weekStart.getTime()) /
      (1000 * 60 * 60 * 24);

    const duration =
      (clampedEnd.getTime() - clampedStart.getTime()) /
      (1000 * 60 * 60 * 24) + 1;

    const DAY_WIDTH = dayWidth;

    const leftPx = Math.round(startOffset * DAY_WIDTH);

    // Máximo ancho posible desde donde empieza la barra
    const maxWidth = (7 - startOffset) * DAY_WIDTH;
    const widthPx = Math.min(Math.max(Math.round(duration * DAY_WIDTH), DAY_WIDTH), maxWidth);

    return {
      left: `${leftPx}px`,
      width: `${widthPx}px`,
    };
  };

  const dateRange = `${format(days[0], 'd', { locale: es })} – ${format(days[6], 'd', { locale: es })} ${format(days[6], "MMM yyyy", { locale: es })}`;

  const isLightColor = (hex?: string) => {
    if (!hex) return false;
    const h = hex.replace('#', '');
    const bigint = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    // relative luminance formula approximation
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return luminance > 0.7;
  };

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

        {/* Combined scrollable header + timeline */}
        <div className="overflow-x-auto">
          <div className="w-[770px] w-full">
            <div ref={gridRef} className="flex border-b border-border/50 w-full">
              {days.map((day) => (
                <div
                  key={day.toISOString()}
                  className={`flex-1 p-2 text-center text-xs sm:text-sm font-medium text-primary border-r border-border/30 last:border-r-0 ${isSameDay(day, new Date()) ? 'bg-accent/10 dark:bg-accent/20' : ''}`}
                >
                  <span className={`underline cursor-pointer ${isSameDay(day, new Date()) ? 'font-semibold text-accent-foreground' : ''}`}>
                    {format(day, 'EEE d/M', { locale: es })}
                  </span>
                </div>
              ))}
            </div>

            {/* Timeline rows */}
            <div className="relative min-h-[60px]">
              {/* Grid lines (match header widths) */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="flex h-full">
                  {days.map((day, i) => (
                    <div
                      key={i}
                      className={`flex-1 border-r border-border/30 last:border-r-0 ${isSameDay(day, new Date()) ? 'bg-accent/10 dark:bg-accent/20' : ''}`}
                    />
                  ))}
                </div>
              </div>

              {/* Reservation bars */}
              <div className="relative py-2 space-y-1 px-0">
                {propertyReservations.map((r) => {
                  const style = getBarStyle(r.checkIn, r.checkOut);
                  return (
                    <div key={r.id} className="relative h-7 w-full">
                      <div className="absolute top-0 left-0 h-7" style={{ left: style.left, width: style.width }}>
                        <button
                          onClick={() => onReservationClick(r)}
                          className={cn(
                            'absolute inset-0 rounded-sm text-xs font-medium px-2 truncate text-left flex items-center transition-opacity hover:opacity-90',
                            !r.color && 'text-white',
                            r.color && (isLightColor(r.color) ? 'text-foreground' : 'text-white'),
                            !r.color && r.status === 'confirmed' && 'bg-[hsl(var(--status-confirmed))]',
                            !r.color && r.status === 'pending' && 'bg-[hsl(var(--status-pending))]'
                          )}
                          style={r.color ? { backgroundColor: r.color } : undefined}
                        >
                          {r.guestName} -
                          <span className="flex items-center gap-0.5 opacity-80">
                            <User className="h-3 w-3" /> {r.guests} - 
                            $ {formatCurrency(r.total - r.deposit)}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Blocked date bars */}
                {propertyBlocks.map((b) => {
                  const style = getBarStyle(b.startDate, b.endDate);
                  return (
                    <div key={b.id} className="relative h-7 w-full">
                      <div className="absolute top-0 left-0 h-7" style={{ left: style.left, width: style.width }}>
                        <button
                          onClick={() => onBlockClick(b)}
                          className="absolute inset-0 rounded-sm text-xs font-medium px-2 truncate text-left flex items-center bg-destructive text-destructive-foreground border border-border/50 transition-opacity hover:opacity-80"
                        >
                          {b.reason || 'Bloqueado'}
                        </button>
                      </div>
                    </div>
                  );
                })}

                {propertyReservations.length === 0 && propertyBlocks.length === 0 && (
                  <div className="h-10" />
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
