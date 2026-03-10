import { Card } from '@/components/ui/card';
import { CalendarCheck, TrendingUp } from 'lucide-react';
import { Reservation } from '@/types/reservation';
import { useMemo } from 'react';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  parseISO,
  startOfDay,
} from 'date-fns';

interface StatsCardsProps {
  reservations: Reservation[];
  currentMonth: Date;
}

export function StatsCards({ reservations, currentMonth }: StatsCardsProps) {
  const stats = useMemo(() => {
    const today = startOfDay(new Date());
    const active = reservations.filter((r) => parseISO(r.checkOut) >= today);

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const occupiedDaySlots = daysInMonth.reduce((total, day) => {
      const properties: string[] = ['onoke', 'asike'];
      const occupiedProperties = properties.filter((prop) =>
        reservations.some((r) => {
          if (r.property !== prop) return false;
          const checkIn = parseISO(r.checkIn);
          const checkOut = parseISO(r.checkOut);
          return day >= checkIn && day < checkOut;
        })
      ).length;
      return total + occupiedProperties;
    }, 0);

    const occupancyRate = Math.round((occupiedDaySlots / (daysInMonth.length * 2)) * 100);

    return {
      totalActive: active.length,
      occupancyRate,
    };
  }, [reservations, currentMonth]);

  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-4">
      <Card className="p-3 sm:p-4 shadow-card border-border/50">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2.5 rounded-xl bg-secondary w-fit">
            <CalendarCheck className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">Reservas activas</p>
            <p className="text-lg sm:text-2xl font-semibold font-display">{stats.totalActive}</p>
          </div>
        </div>
      </Card>
      <Card className="p-3 sm:p-4 shadow-card border-border/50">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2.5 rounded-xl bg-secondary w-fit">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">Ocupación mensual</p>
            <p className="text-lg sm:text-2xl font-semibold font-display">{stats.occupancyRate}%</p>
          </div>
        </div>
      </Card>
    </div>
  );
}