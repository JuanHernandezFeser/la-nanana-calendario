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
import { Reservation, ReservationFormData, PROPERTIES, PropertyId } from '@/types/reservation';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

const formSchema = z
  .object({
    guestName: z.string().trim().min(1, 'El nombre es obligatorio').max(100),
    checkIn: z.string().min(1, 'La fecha de ingreso es obligatoria'),
    checkOut: z.string().min(1, 'La fecha de egreso es obligatoria'),
    phone: z.string().trim().min(1, 'El teléfono es obligatorio').max(30),
    notes: z.string().max(500).default(''),
    status: z.enum(['confirmed', 'pending', 'cancelled']),
    property: z.enum(['onoke', 'asike'] as const),
    guests: z.preprocess((v) => Number(v), z.number().min(1, 'Debe indicar al menos 1 persona')),
    total: z.preprocess((v) => Number(v), z.number().min(0, 'El valor total debe ser >= 0')),
    deposit: z.preprocess((v) => Number(v), z.number().min(0, 'La seña debe ser >= 0')),
    color: z.string().min(1, 'Seleccione un color'),
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

  const GREEN = '#10B981';
  const ONOKE_COLORS = [
    { label: 'Rosa', value: '#ff3d87' },
    { label: 'Verde', value: GREEN },
  ];
  const ASIKE_COLORS = [
    { label: 'Celeste', value: '#68a0e9' },
    { label: 'Verde', value: GREEN },
  ];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      guestName: reservation?.guestName ?? '',
      checkIn: reservation?.checkIn ?? defaultDate ?? '',
      checkOut: reservation?.checkOut ?? '',
      phone: reservation?.phone ?? '',
      notes: reservation?.notes ?? '',
      status: reservation?.status ?? 'pending',
      property: reservation?.property ?? 'onoke',
      guests: reservation?.guests ?? 1,
      total: reservation?.total ?? 0,
      deposit: reservation?.deposit ?? 0,
      color: reservation?.color ?? (reservation?.property === 'asike' ? ASIKE_COLORS[0].value : ONOKE_COLORS[0].value),
    },
  });

  const watchedProperty = form.watch('property');

  useEffect(() => {
    if (!isEditing) {
      const opts = watchedProperty === 'asike' ? ASIKE_COLORS : ONOKE_COLORS;
      form.setValue('color', opts[0].value);
    }
  }, [watchedProperty, isEditing]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const success = onSubmit(values as ReservationFormData, reservation?.id);
    if (success) {
      form.reset();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-full max-h-screen overflow-y-auto sm:max-w-[480px] sm:max-h-auto sm:overflow-visible p-0 border-border/50">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="p-4 sm:p-6"
        >
          <DialogHeader className="hidden sm:block">
            <DialogTitle className="font-display text-xl">
              {isEditing ? 'Editar reserva' : 'Nueva reserva'}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3 sm:space-y-4 mt-0 sm:mt-4">
              <FormField
                control={form.control}
                name="property"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Propiedad</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(Object.entries(PROPERTIES) as [PropertyId, string][]).map(([id, name]) => (
                          <SelectItem key={id} value={id}>{name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Color selection dependent on property */}
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => {
                  const opts = form.getValues('property') === 'asike' ? ASIKE_COLORS : ONOKE_COLORS;
                  return (
                    <FormItem>
                      <FormLabel>Color de la reserva</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-3">
                          {opts.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => field.onChange(opt.value)}
                              aria-pressed={field.value === opt.value}
                              title={opt.label}
                              className={`flex items-center gap-2 p-1 rounded-md border ${field.value === opt.value ? 'ring-2 ring-offset-1 ring-primary' : 'border-transparent'}`}
                            >
                              <span
                                className="w-6 h-6 rounded-md"
                                style={{ backgroundColor: opt.value }}
                              />
                              <span className="text-sm">{opt.label}</span>
                            </button>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

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

              <div className="grid grid-cols-3 gap-3 items-end">
                <FormField
                  control={form.control}
                  name="guests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cantidad de personas</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} className="h-10 w-full" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="total"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor total</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                          <Input type="number" min={0} step="0.01" {...field} className="pl-7 h-10 w-full" inputMode="decimal" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deposit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seña recibida</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                          <Input type="number" min={0} step="0.01" {...field} className="pl-7 h-10 w-full" inputMode="decimal" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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

              <div className="flex justify-end gap-1 sm:gap-2 pt-1 sm:pt-2">
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
