export type ReservationStatus = 'confirmed' | 'pending' | 'cancelled';

export type PropertyId = 'onoke' | 'asike';

export const PROPERTIES: Record<PropertyId, string> = {
  onoke: 'ONOKE - Al Amanecer',
  asike: 'ASIKE - Al Atardecer',
};

export interface Reservation {
  id: string;
  guestName: string;
  checkIn: string; // ISO date string
  checkOut: string; // ISO date string
  phone: string;
  notes: string;
  status: ReservationStatus;
  property: PropertyId;
  createdAt: string;
}

export interface ReservationFormData {
  guestName: string;
  checkIn: string;
  checkOut: string;
  phone: string;
  notes: string;
  status: ReservationStatus;
  property: PropertyId;
}

export interface BlockedDate {
  id: string;
  property: PropertyId;
  startDate: string;
  endDate: string;
  reason: string;
  createdAt: string;
}

export interface BlockedDateFormData {
  property: PropertyId;
  startDate: string;
  endDate: string;
  reason: string;
}
