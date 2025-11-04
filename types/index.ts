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

export interface Contract {
  id: string;
  landlordEmail: string;
  tenantEmail: string;
  roomId: string;
  startDate: string;
  endDate: string;
  monthlyPrice: number;
  deposit: number;
  paymentPeriod: "monthly" | "quarterly" | "yearly";
  notes?: string;
  createdAt: string;
}

export interface Bill {
  id: string;
  landlordEmail: string;
  tenantEmail: string;
  roomId: string;
  month: number;
  year: number;
  roomPrice: number;
  electricityUsage: number;
  electricityPrice: number;
  waterUsage: number;
  waterPrice: number;
  otherFees?: number;
  totalAmount: number;
  status: "paid" | "unpaid";
  dueDate: string;
  createdAt: string;
}

export interface Feedback {
  id: string;
  tenantEmail: string;
  title: string;
  description: string;
  category: "maintenance" | "cleaning" | "complaint" | "other";
  priority: "low" | "normal" | "high" | "urgent";
  status: "pending" | "in_progress" | "completed";
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  read: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}
