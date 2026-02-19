import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Reservation } from '@/types/reservation';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  addMonths,
  subMonths,
  getDay,
  isSameDay,
  isToday,
  parseISO,
  isBefore,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { StatusBadge } from './StatusBadge';
import { cn } from '@/lib/utils';

interface CalendarViewProps {
  reservations: Reservation[];
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  onDayClick: (date: Date) => void;
  onReservationClick: (reservation: Reservation) => void;
}

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export function CalendarView({
  reservations,
  currentMonth,
  onMonthChange,
  onDayClick,
  onReservationClick,
}: CalendarViewProps) {
  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysArray = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Get day of week for first day (Monday = 0)
    let startDay = getDay(monthStart) - 1;
    if (startDay < 0) startDay = 6;

    return { daysArray, startDay };
  }, [currentMonth]);

  const getReservationsForDay = (date: Date) => {
    return reservations
      .filter((r) => {
        if (r.status === 'cancelled') return false;
        const checkIn = parseISO(r.checkIn);
        const checkOut = parseISO(r.checkOut);
        return date >= checkIn && isBefore(date, checkOut);
      });
  };

  return (
    <Card className="shadow-card border-border/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <Button variant="ghost" size="icon" onClick={() => onMonthChange(subMonths(currentMonth, 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-display font-semibold capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </h2>
        <Button variant="ghost" size="icon" onClick={() => onMonthChange(addMonths(currentMonth, 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-border/50">
        {WEEKDAYS.map((day) => (
          <div key={day} className="p-2 text-center text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7">
        {/* Empty cells for offset */}
        {Array.from({ length: days.startDay }).map((_, i) => (
          <div key={`empty-${i}`} className="min-h-[80px] sm:min-h-[100px] border-b border-r border-border/30 bg-muted/30" />
        ))}

        {days.daysArray.map((day) => {
          const dayReservations = getReservationsForDay(day);
          const hasReservations = dayReservations.length > 0;
          const today = isToday(day);

          return (
            <div
              key={day.toISOString()}
              className={cn(
                'min-h-[80px] sm:min-h-[100px] border-b border-r border-border/30 p-1 cursor-pointer transition-colors hover:bg-accent/50',
                today && 'bg-[hsl(var(--calendar-today))]'
              )}
              onClick={() => (hasReservations ? undefined : onDayClick(day))}
            >
              <span
                className={cn(
                  'inline-flex items-center justify-center w-6 h-6 text-xs rounded-full',
                  today && 'bg-primary text-primary-foreground font-semibold',
                  !today && 'text-foreground'
                )}
              >
                {format(day, 'd')}
              </span>
              <div className="mt-0.5 space-y-0.5 overflow-hidden">
                {dayReservations.slice(0, 2).map((r) => (
                  <button
                    key={r.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onReservationClick(r);
                    }}
                    className={cn(
                      'w-full text-left text-[10px] sm:text-xs px-1.5 py-0.5 rounded truncate font-medium transition-opacity hover:opacity-80',
                      r.status === 'confirmed' && 'bg-status-confirmed-bg text-status-confirmed',
                      r.status === 'pending' && 'bg-status-pending-bg text-status-pending'
                    )}
                  >
                    {r.guestName}
                  </button>
                ))}
                {dayReservations.length > 2 && (
                  <span className="text-[10px] text-muted-foreground px-1">
                    +{dayReservations.length - 2} más
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
