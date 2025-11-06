export type UserRole = "admin" | "landlord" | "tenant";

export type AlleyType = "MOTORBIKE" | "CAR" | "BOTH";
export type SecurityType = "CAMERA" | "GUARD" | "BOTH" | "NONE";

export interface Motel {
  id: string;
  name: string;
  address: string;
  description?: string;
  totalRooms?: number;
  latitude?: number;
  longitude?: number;
  alleyType?: AlleyType;
  alleyWidth?: number;
  hasElevator?: boolean;
  hasParking?: boolean;
  securityType?: SecurityType;
  has24hSecurity?: boolean;
  hasWifi?: boolean;
  hasAirConditioner?: boolean;
  hasWashingMachine?: boolean;
  hasKitchen?: boolean;
  hasRooftop?: boolean;
  allowPets?: boolean;
  allowCooking?: boolean;
  electricityCostPerKwh?: number;
  waterCostPerCubicMeter?: number;
  internetCost?: number;
  parkingCost?: number;
  paymentCycleMonths?: number;
  depositMonths?: number;
  contactPhone?: string;
  contactEmail?: string;
  contactZalo?: string;
  regulations?: string;
  nearbyPlaces?: string[];
  images?: string[];
  createdAt: string;
}

export type RoomStatus = "VACANT" | "OCCUPIED" | "MAINTENANCE";
export type BathroomType = "PRIVATE" | "SHARED";
export type FurnishingStatus = "UNFURNISHED" | "PARTIALLY_FURNISHED" | "FULLY_FURNISHED";

export interface Room {
  id: string;
  number: string;
  area: number;
  price: number;
  motelId?: string;
  tenantId?: string;
  status: RoomStatus;
  bathroomType?: BathroomType;
  hasWaterHeater?: boolean;
  furnishingStatus?: FurnishingStatus;
  hasAirConditioner?: boolean;
  hasBalcony?: boolean;
  hasWindow?: boolean;
  hasKitchen?: boolean;
  hasRefrigerator?: boolean;
  hasWashingMachine?: boolean;
  hasWardrobe?: boolean;
  hasBed?: boolean;
  hasDesk?: boolean;
  hasWifi?: boolean;
  maxOccupancy?: number;
  allowPets?: boolean;
  allowCooking?: boolean;
  allowOppositeGender?: boolean;
  floor?: number;
  electricityCostPerKwh?: number;
  waterCostPerCubicMeter?: number;
  internetCost?: number;
  parkingCost?: number;
  serviceFee?: number;
  paymentCycleMonths?: number;
  depositMonths?: number;
  description?: string;
  amenities: string[];
  availableFrom?: string;
  images?: string[];
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
