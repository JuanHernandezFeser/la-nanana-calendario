export type ReservationStatus = 'confirmed' | 'pending' | 'cancelled';

export interface Reservation {
  id: string;
  guestName: string;
  checkIn: string; // ISO date string
  checkOut: string; // ISO date string
  phone: string;
  notes: string;
  status: ReservationStatus;
  createdAt: string;
}

export interface ReservationFormData {
  guestName: string;
  checkIn: string;
  checkOut: string;
  phone: string;
  notes: string;
  status: ReservationStatus;
}
