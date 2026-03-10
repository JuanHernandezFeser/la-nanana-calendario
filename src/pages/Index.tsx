import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WeeklyTimeline } from '@/components/WeeklyTimeline';
import { StatsCards } from '@/components/StatsCards';
import { ReservationListView } from '@/components/ReservationListView';
import { ReservationFormModal } from '@/components/ReservationFormModal';
import { ReservationDetailModal } from '@/components/ReservationDetailModal';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { BlockDateModal } from '@/components/BlockDateModal';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useReservations } from '@/hooks/useReservations';
import { Reservation, ReservationFormData, BlockedDateFormData, BlockedDate, PropertyId } from '@/types/reservation';
import { Plus, ChevronLeft, ChevronRight, Lock, AlertCircle } from 'lucide-react';
import { startOfWeek, addWeeks, subWeeks, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

const Index = () => {
  const {
    reservations,
    blockedDates,
    createReservation,
    updateReservation,
    deleteReservation,
    createBlockedDate,
    deleteBlockedDate,
    isLoading,
    error,
  } = useReservations();

  const [currentWeek, setCurrentWeek] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));

  const { theme, toggle } = useTheme();

  // Modal states
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [defaultDate, setDefaultDate] = useState<string>('');

  const handleNewReservation = useCallback(() => {
    setSelectedReservation(null);
    setDefaultDate('');
    setFormOpen(true);
  }, []);

  const handleReservationClick = useCallback((reservation: Reservation) => {
    setSelectedReservation(reservation);
    setDetailOpen(true);
  }, []);

  const handleBlockClick = useCallback((block: BlockedDate) => {
    console.log(block);
    if (confirm(`¿Eliminar el bloqueo "${block.reason || 'Sin motivo'}"?`)) {
      deleteBlockedDate(block.id);
    }
  }, [deleteBlockedDate]);

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

  const handleBlockSubmit = useCallback(
    (data: BlockedDateFormData): boolean => {
      return createBlockedDate(data);
    },
    [createBlockedDate]
  );

  const goToToday = useCallback(() => {
    setCurrentWeek(startOfWeek(new Date(), { weekStartsOn: 1 }));
  }, []);

  // Mostrar pantalla de carga
  if (isLoading) {
    return <LoadingScreen message="Cargando reservas..." />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-xl bg-primary/10">
              <img src="/la-nanana-icon.png" alt="La Nañana" className="h-8 w-8 sm:h-14 sm:w-14" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-display font-semibold text-foreground">
                Sierra de la Ventana
              </h1>
              <p className="text-xs text-muted-foreground">Gestión de reservas</p>
            </div>
          </div>
          <Button variant="outline" size="icon" onClick={toggle}>
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error al cargar las reservas: {error}
            </AlertDescription>
          </Alert>
        )}

        <StatsCards reservations={reservations} currentMonth={currentWeek} />

        <Tabs defaultValue="timeline" className="space-y-4">
          <TabsList>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="list">Lista</TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="space-y-6">
            {/* Week navigation */}
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Hoy
              </Button>
            </div>

            {/* Timelines per property */}
            <div className="w-full">
              <WeeklyTimeline
                property="onoke"
                weekStart={currentWeek}
                reservations={reservations}
                blockedDates={blockedDates}
                onReservationClick={handleReservationClick}
                onBlockClick={handleBlockClick}
              />
            </div>

            <div className="w-full">
              <WeeklyTimeline
                property="asike"
                weekStart={currentWeek}
                reservations={reservations}
                blockedDates={blockedDates}
                onReservationClick={handleReservationClick}
                onBlockClick={handleBlockClick}
              />
            </div>

            {/* Action buttons */}
            <div className="flex justify-center gap-3">
              <Button onClick={handleNewReservation} size="sm">
                <Plus className="h-4 w-4 mr-1.5" />
                Nueva Reserva
              </Button>
              <Button
                onClick={() => setBlockOpen(true)}
                size="sm"
                variant="destructive"
              >
                <Lock className="h-4 w-4 mr-1.5" />
                Bloquear Fechas
              </Button>
            </div>
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

      <BlockDateModal
        open={blockOpen}
        onClose={() => setBlockOpen(false)}
        onSubmit={handleBlockSubmit}
      />
    </div>
  );
};

export default Index;
