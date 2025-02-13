import { ReservationStatus, Status } from '@prisma/client';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Team {
  id: string;
  teamName: string;
  members?: TeamMember[];
}

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: string;
  user: User;
}

export interface Equipment {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  status: Status;
  location: string | null;
  categoryId: string;
  availability: boolean;
  category?: Category;
  reservations?: Reservation[];
}

export interface Category {
  id: string;
  name: string;
  equipment?: Equipment[];
}

export interface Reservation {
  id: string;
  userId: string | null;
  teamId: string | null;
  equipmentId: string;
  startDate: Date | string;
  endDate: Date | string;
  status: ReservationStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  team?: Team;
  equipment: Equipment;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'RESERVATION_UPDATE' | 'EQUIPMENT_UPDATE' | 'SYSTEM';
  read: boolean;
  createdAt: Date;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}
