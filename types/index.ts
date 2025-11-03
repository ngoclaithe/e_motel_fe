export type UserRole = "admin" | "landlord" | "tenant";

export interface Motel {
  id: string;
  name: string;
  address: string;
  logoUrl?: string;
  description?: string;
  ownerEmail: string;
  createdAt: string;
}

export type RoomStatus = "vacant" | "occupied" | "maintenance";

export interface Room {
  id: string;
  motelId?: string;
  name: string;
  area: number;
  price: number;
  status: RoomStatus;
  images?: string[];
  notes?: string[];
  createdAt: string;
}
