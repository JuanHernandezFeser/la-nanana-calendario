import { Card } from '@/components/ui/card';
import { CalendarCheck, CalendarClock, TrendingUp } from 'lucide-react';
import { Reservation } from '@/types/reservation';
import { useMemo } from 'react';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  parseISO,
  isWithinInterval,
} from 'date-fns';

interface StatsCardsProps {
  reservations: Reservation[];
  currentMonth: Date;
}

export function StatsCards({ reservations, currentMonth }: StatsCardsProps) {
  const stats = useMemo(() => {
    const active = reservations.filter((r) => r.status !== 'cancelled');
    const confirmed = reservations.filter((r) => r.status === 'confirmed');

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const occupiedDays = daysInMonth.filter((day) =>
      active.some((r) => {
        const checkIn = parseISO(r.checkIn);
        const checkOut = parseISO(r.checkOut);
        return isWithinInterval(day, { start: checkIn, end: checkOut }) && day >= checkIn && day < checkOut;
      })
    ).length;

    const occupancyRate = Math.round((occupiedDays / daysInMonth.length) * 100);

    return {
      totalActive: active.length,
      totalConfirmed: confirmed.length,
      occupancyRate,
    };
  }, [reservations, currentMonth]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="p-4 shadow-card border-border/50">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-secondary">
            <CalendarCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Reservas activas</p>
            <p className="text-2xl font-semibold font-display">{stats.totalActive}</p>
          </div>
        </div>
      </Card>
      <Card className="p-4 shadow-card border-border/50">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-secondary">
            <CalendarClock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Confirmadas</p>
            <p className="text-2xl font-semibold font-display">{stats.totalConfirmed}</p>
          </div>
        </div>
      </Card>
      <Card className="p-4 shadow-card border-border/50">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-secondary">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Ocupación mensual</p>
            <p className="text-2xl font-semibold font-display">{stats.occupancyRate}%</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
