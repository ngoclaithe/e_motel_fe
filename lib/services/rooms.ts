import { api } from "../api";
import type { Room } from "../../types";

export interface CreateRoomRequest {
  number: string;
  area: number;
  price: number;
  motelId?: string;
  bathroomType?: string;
  hasWaterHeater?: boolean;
  furnishingStatus?: string;
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
}

export interface UpdateRoomRequest {
  number?: string;
  area?: number;
  price?: number;
  status?: "VACANT" | "OCCUPIED" | "MAINTENANCE";
  motelId?: string;
  tenantId?: string;
  bathroomType?: string;
  hasWaterHeater?: boolean;
  furnishingStatus?: string;
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
  amenities?: string[];
  availableFrom?: string;
  images?: string[];
}

async function normalizeList(res: unknown): Promise<Room[]> {
  if (Array.isArray(res)) return res as Room[];
  if (res && typeof res === "object") {
    const obj = res as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data as Room[];
    if (Array.isArray(obj.items)) return obj.items as Room[];
  }
  return [];
}

export const roomService = {
  // Public
  listAll: async (): Promise<Room[]> => {
    const res = await api.get(`/api/v1/rooms`);
    return normalizeList(res);
  },
  listVacant: async (): Promise<Room[]> => {
    const res = await api.get(`/api/v1/rooms/vacant`);
    return normalizeList(res);
  },
  listStandalone: async (): Promise<Room[]> => {
    const res = await api.get(`/api/v1/rooms/standalone`);
    return normalizeList(res);
  },
  listByMotel: async (motelId: string): Promise<Room[]> => {
    const res = await api.get(`/api/v1/rooms/motel/${motelId}`);
    return normalizeList(res);
  },
  getRoom: async (id: string): Promise<Room> => {
    return api.get(`/api/v1/rooms/${id}`) as Promise<Room>;
  },

  // Auth required
  createRoom: async (data: CreateRoomRequest): Promise<Room> => {
    return api.post(`/api/v1/rooms`, data) as Promise<Room>;
  },
  myRooms: async (): Promise<Room[]> => {
    const res = await api.get(`/api/v1/rooms/my-rooms`);
    return normalizeList(res);
  },
  updateRoom: async (id: string, data: UpdateRoomRequest): Promise<Room> => {
    return api.put(`/api/v1/rooms/${id}`, data) as Promise<Room>;
  },
  updateStatus: async (id: string, status: "VACANT" | "OCCUPIED" | "MAINTENANCE"): Promise<Room> => {
    return api.put(`/api/v1/rooms/${id}/status`, { status }) as Promise<Room>;
  },
  deleteRoom: async (id: string): Promise<{ message?: string } | null> => {
    return api.del(`/api/v1/rooms/${id}`) as Promise<{ message?: string } | null>;
  },
};
