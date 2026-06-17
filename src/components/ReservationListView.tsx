import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Reservation, PROPERTIES } from '@/types/reservation';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Search, ArrowUpDown } from 'lucide-react';

interface ReservationListViewProps {
  reservations: Reservation[];
  onReservationClick: (reservation: Reservation) => void;
}

type SortKey = 'guestName' | 'checkIn' | 'status' | 'property';

export function ReservationListView({
  reservations,
  onReservationClick,
}: ReservationListViewProps) {
  const [search, setSearch] = useState('');
  const [statusFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<SortKey>('checkIn');
  const [sortAsc, setSortAsc] = useState(true);

  const getReservationStatus = (checkIn: string, checkOut: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(checkIn);
    start.setHours(0, 0, 0, 0);

    const end = new Date(checkOut);
    end.setHours(23, 59, 59, 999);

    if (today < start) return 'PENDIENTE';
    if (today <= end) return 'EN CURSO';

    return 'TERMINADA';
  };

  const filtered = useMemo(() => {
    let result = [...reservations];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((r) =>
        r.guestName.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((r) => r.status === statusFilter);
    }

    result.sort((a, b) => {
      let cmp = 0;

      if (sortKey === 'guestName') {
        cmp = a.guestName.localeCompare(b.guestName);
      } else if (sortKey === 'checkIn') {
        cmp =
          new Date(a.checkIn).getTime() -
          new Date(b.checkIn).getTime();
      } else if (sortKey === 'property') {
        cmp = a.property.localeCompare(b.property);
      } else {
        cmp = getReservationStatus(a.checkIn, a.checkOut).localeCompare(
          getReservationStatus(b.checkIn, b.checkOut)
        );
      }

      return sortAsc ? cmp : -cmp;
    });

    return result;
  }, [reservations, search, statusFilter, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  return (
    <Card className="shadow-card border-border/50 overflow-hidden">
      <div className="p-4 border-b border-border/50 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <button
                  className="flex items-center gap-1 hover:text-foreground"
                  onClick={() => toggleSort('guestName')}
                >
                  Huésped <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>

              <TableHead>
                <button
                  className="flex items-center gap-1 hover:text-foreground"
                  onClick={() => toggleSort('property')}
                >
                  Propiedad <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>

              <TableHead>
                <button
                  className="flex items-center gap-1 hover:text-foreground"
                  onClick={() => toggleSort('checkIn')}
                >
                  Fechas <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>

              <TableHead className="hidden sm:table-cell">
                Teléfono
              </TableHead>

              <TableHead>
                <button
                  className="flex items-center gap-1 hover:text-foreground"
                  onClick={() => toggleSort('status')}
                >
                  Estado <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  No se encontraron reservas
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((r) => {
                const reservationStatus = getReservationStatus(
                  r.checkIn,
                  r.checkOut
                );

                return (
                  <TableRow
                    key={r.id}
                    className="cursor-pointer hover:bg-accent/50"
                    onClick={() => onReservationClick(r)}
                  >
                    <TableCell className="font-medium">
                      {r.guestName}
                    </TableCell>

                    <TableCell className="text-sm text-muted-foreground">
                      {PROPERTIES[r.property]}
                    </TableCell>

                    <TableCell className="text-sm text-muted-foreground">
                      {format(parseISO(r.checkIn), 'dd/MM', {
                        locale: es,
                      })}{' '}
                      –{' '}
                      {format(parseISO(r.checkOut), 'dd/MM', {
                        locale: es,
                      })}
                    </TableCell>

                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {r.phone || '-'}
                    </TableCell>

                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${reservationStatus === 'PENDIENTE'
                          ? 'bg-yellow-100 text-yellow-800'
                          : reservationStatus === 'EN CURSO'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                          }`}
                      >
                        {reservationStatus}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}