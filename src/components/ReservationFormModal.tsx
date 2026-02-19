import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Reservation, ReservationFormData } from '@/types/reservation';
import { motion, AnimatePresence } from 'framer-motion';

const formSchema = z
  .object({
    guestName: z.string().trim().min(1, 'El nombre es obligatorio').max(100),
    checkIn: z.string().min(1, 'La fecha de ingreso es obligatoria'),
    checkOut: z.string().min(1, 'La fecha de egreso es obligatoria'),
    phone: z.string().trim().min(1, 'El teléfono es obligatorio').max(30),
    notes: z.string().max(500).default(''),
    status: z.enum(['confirmed', 'pending', 'cancelled']),
  })
  .refine((data) => data.checkOut > data.checkIn, {
    message: 'La fecha de egreso debe ser posterior al ingreso',
    path: ['checkOut'],
  });

interface ReservationFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ReservationFormData, id?: string) => boolean;
  reservation?: Reservation | null;
  defaultDate?: string;
}

export function ReservationFormModal({
  open,
  onClose,
  onSubmit,
  reservation,
  defaultDate,
}: ReservationFormModalProps) {
  const isEditing = !!reservation;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      guestName: reservation?.guestName ?? '',
      checkIn: reservation?.checkIn ?? defaultDate ?? '',
      checkOut: reservation?.checkOut ?? '',
      phone: reservation?.phone ?? '',
      notes: reservation?.notes ?? '',
      status: reservation?.status ?? 'pending',
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const success = onSubmit(values as ReservationFormData, reservation?.id);
    if (success) {
      form.reset();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-border/50">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="p-6"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {isEditing ? 'Editar reserva' : 'Nueva reserva'}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mt-4">
              <FormField
                control={form.control}
                name="guestName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del huésped</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Juan Pérez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="checkIn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ingreso</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="checkOut"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Egreso</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input placeholder="+54 291 ..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="confirmed">Confirmada</SelectItem>
                        <SelectItem value="cancelled">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observaciones</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Notas adicionales..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {isEditing ? 'Guardar cambios' : 'Crear reserva'}
                </Button>
              </div>
            </form>
          </Form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
