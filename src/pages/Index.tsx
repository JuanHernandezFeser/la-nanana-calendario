import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarView } from '@/components/CalendarView';
import { StatsCards } from '@/components/StatsCards';
import { ReservationListView } from '@/components/ReservationListView';
import { ReservationFormModal } from '@/components/ReservationFormModal';
import { ReservationDetailModal } from '@/components/ReservationDetailModal';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { useReservations } from '@/hooks/useReservations';
import { Reservation, ReservationFormData } from '@/types/reservation';
import { Plus, Mountain } from 'lucide-react';
import { format } from 'date-fns';

const Index = () => {
  const {
    reservations,
    createReservation,
    updateReservation,
    deleteReservation,
  } = useReservations();

  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Modal states
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [defaultDate, setDefaultDate] = useState<string>('');

  const handleNewReservation = useCallback(() => {
    setSelectedReservation(null);
    setDefaultDate('');
    setFormOpen(true);
  }, []);

  const handleDayClick = useCallback((date: Date) => {
    setSelectedReservation(null);
    setDefaultDate(format(date, 'yyyy-MM-dd'));
    setFormOpen(true);
  }, []);

  const handleReservationClick = useCallback((reservation: Reservation) => {
    setSelectedReservation(reservation);
    setDetailOpen(true);
  }, []);

  const handleEdit = useCallback((reservation: Reservation) => {
    setDetailOpen(false);
    setSelectedReservation(reservation);
    setFormOpen(true);
  }, []);

  const handleDeleteRequest = useCallback((id: string) => {
    const r = reservations.find((res) => res.id === id);
    if (r) {
      setSelectedReservation(r);
      setDetailOpen(false);
      setDeleteOpen(true);
    }
  }, [reservations]);

  const handleDeleteConfirm = useCallback(() => {
    if (selectedReservation) {
      deleteReservation(selectedReservation.id);
      setDeleteOpen(false);
      setSelectedReservation(null);
    }
  }, [selectedReservation, deleteReservation]);

  const handleFormSubmit = useCallback(
    (data: ReservationFormData, id?: string): boolean => {
      if (id) return updateReservation(id, data);
      return createReservation(data);
    },
    [createReservation, updateReservation]
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Mountain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-display font-semibold text-foreground">
                Sierra de la Ventana
              </h1>
              <p className="text-xs text-muted-foreground">Gestión de reservas</p>
            </div>
          </div>
          <Button onClick={handleNewReservation} size="sm">
            <Plus className="h-4 w-4 mr-1.5" />
            Nueva reserva
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <StatsCards reservations={reservations} currentMonth={currentMonth} />

        <Tabs defaultValue="calendar" className="space-y-4">
          <TabsList>
            <TabsTrigger value="calendar">Calendario</TabsTrigger>
            <TabsTrigger value="list">Lista</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar">
            <CalendarView
              reservations={reservations}
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
              onDayClick={handleDayClick}
              onReservationClick={handleReservationClick}
            />
          </TabsContent>

          <TabsContent value="list">
            <ReservationListView
              reservations={reservations}
              onReservationClick={handleReservationClick}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Modals */}
      <ReservationFormModal
        key={selectedReservation?.id ?? 'new' + defaultDate}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        reservation={selectedReservation}
        defaultDate={defaultDate}
      />

      <ReservationDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        reservation={selectedReservation}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        guestName={selectedReservation?.guestName}
      />
    </div>
  );
};

export default Index;
