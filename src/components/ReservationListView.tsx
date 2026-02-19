import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Reservation, ReservationStatus } from '@/types/reservation';
import { StatusBadge } from './StatusBadge';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Search, ArrowUpDown } from 'lucide-react';

interface ReservationListViewProps {
  reservations: Reservation[];
  onReservationClick: (reservation: Reservation) => void;
}

type SortKey = 'guestName' | 'checkIn' | 'status';

export function ReservationListView({ reservations, onReservationClick }: ReservationListViewProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<SortKey>('checkIn');
  const [sortAsc, setSortAsc] = useState(true);

  const filtered = useMemo(() => {
    let result = [...reservations];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((r) => r.guestName.toLowerCase().includes(q));
    }

    if (statusFilter !== 'all') {
      result = result.filter((r) => r.status === statusFilter);
    }

    result.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'guestName') cmp = a.guestName.localeCompare(b.guestName);
      else if (sortKey === 'checkIn') cmp = a.checkIn.localeCompare(b.checkIn);
      else cmp = a.status.localeCompare(b.status);
      return sortAsc ? cmp : -cmp;
    });

    return result;
  }, [reservations, search, statusFilter, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  return (
    <Card className="shadow-card border-border/50 overflow-hidden">
      {/* Filters */}
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
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="confirmed">Confirmadas</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
            <SelectItem value="cancelled">Canceladas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <button className="flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort('guestName')}>
                  Huésped <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>
                <button className="flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort('checkIn')}>
                  Fechas <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead className="hidden sm:table-cell">Teléfono</TableHead>
              <TableHead>
                <button className="flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort('status')}>
                  Estado <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No se encontraron reservas
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((r) => (
                <TableRow
                  key={r.id}
                  className="cursor-pointer hover:bg-accent/50"
                  onClick={() => onReservationClick(r)}
                >
                  <TableCell className="font-medium">{r.guestName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(parseISO(r.checkIn), 'dd/MM', { locale: es })} –{' '}
                    {format(parseISO(r.checkOut), 'dd/MM', { locale: es })}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                    {r.phone}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={r.status} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
