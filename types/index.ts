export type UserRole = "ADMIN" | "LANDLORD" | "TENANT";

export type AlleyType = "MOTORBIKE" | "CAR" | "BOTH";
export type SecurityType = "CAMERA" | "GUARD" | "BOTH" | "NONE";

export interface Motel {
  id: string;
  name: string;
  address: string;
  description?: string;
  totalRooms?: number;
  monthlyRent?: number;
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
  contactZalo?: string;
  regulations?: string;
  nearbyPlaces?: string[];
  images?: string[];
  status?: "VACANT" | "OCCUPIED" | "MAINTENANCE";
  owner?: User;
  rooms?: Room[];
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  avatar?: string;
}

export type RoomStatus = "VACANT" | "OCCUPIED" | "MAINTENANCE";
export type BathroomType = "PRIVATE" | "SHARED";
export type FurnishingStatus = "UNFURNISHED" | "PARTIALLY_FURNISHED" | "FULLY_FURNISHED";

export interface Room {
  id: string;
  number: string;
  address?: string;
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
  hasFan?: boolean;
  hasKitchenTable?: boolean;
  lightBulbCount?: number;
  createdAt: string;
  airConditionerCount?: number;
  fanCount?: number;
  waterHeaterCount?: number;
  otherEquipment?: string;
}

export type ContractType = "ROOM" | "MOTEL";

export interface Contract {
  id: string;
  type: ContractType;
  tenantId: string;
  roomId?: string | null;
  motelId?: string | null;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  deposit: number;
  paymentCycleMonths: number;
  paymentDay: number;
  depositMonths: number;
  electricityCostPerKwh?: number;
  waterCostPerCubicMeter?: number;
  internetCost?: number;
  parkingCost?: number;
  serviceFee?: number;
  specialTerms?: string;
  maxOccupants?: number;
  hasWifi?: boolean;
  hasParking?: boolean;
  status?: "ACTIVE" | "PENDING_TENANT" | "EXPIRED" | "TERMINATED";
  regulations?: string;
  documentContent?: string;
  documentUrl?: string | null;
  createdAt: string;
  updatedAt: string;
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
