import { api } from "../api";
import type { Room } from "../types";

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
  price?: number;
  status?: "VACANT" | "OCCUPIED" | "MAINTENANCE";
  tenantId?: string;
  hasRefrigerator?: boolean;
  hasWashingMachine?: boolean;
  description?: string;
  amenities?: string[];
  images?: string[];
}

export interface RoomListResponse {
  data: Room[];
  total: number;
  page: number;
  limit: number;
}

export const roomService = {
  listRooms: async (page = 1, limit = 10, motelId?: string): Promise<RoomListResponse> => {
    const query = new URLSearchParams();
    query.append("page", page.toString());
    query.append("limit", limit.toString());
    if (motelId) query.append("motelId", motelId);
    return api.get(`/api/v1/rooms?${query.toString()}`);
  },

  getRoom: async (id: string): Promise<Room> => {
    return api.get(`/api/v1/rooms/${id}`);
  },

  createRoom: async (data: CreateRoomRequest): Promise<Room> => {
    return api.post("/api/v1/rooms", data);
  },

  updateRoom: async (id: string, data: UpdateRoomRequest): Promise<Room> => {
    return api.put(`/api/v1/rooms/${id}`, data);
  },

  deleteRoom: async (id: string): Promise<{ message: string }> => {
    return api.del(`/api/v1/rooms/${id}`);
  },
};
