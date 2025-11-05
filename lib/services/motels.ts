import { api } from "../api";
import type { Motel } from "../types";

export interface CreateMotelRequest {
  name: string;
  address: string;
  description?: string;
  totalRooms?: number;
  latitude?: number;
  longitude?: number;
  alleyType?: string;
  alleyWidth?: number;
  hasElevator?: boolean;
  hasParking?: boolean;
  securityType?: string;
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
}

export interface UpdateMotelRequest {
  name?: string;
  address?: string;
  description?: string;
  totalRooms?: number;
  latitude?: number;
  longitude?: number;
  alleyType?: string;
  alleyWidth?: number;
  hasElevator?: boolean;
  hasParking?: boolean;
  securityType?: string;
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
}

export interface MotelListResponse {
  data: Motel[];
  total: number;
  page: number;
  limit: number;
}

export const motelService = {
  listMotels: async (page = 1, limit = 10): Promise<MotelListResponse> => {
    return api.get(`/api/v1/motels?page=${page}&limit=${limit}`);
  },

  getMotel: async (id: string): Promise<Motel> => {
    return api.get(`/api/v1/motels/${id}`);
  },

  createMotel: async (data: CreateMotelRequest): Promise<Motel> => {
    return api.post("/api/v1/motels", data);
  },

  updateMotel: async (id: string, data: UpdateMotelRequest): Promise<Motel> => {
    return api.put(`/api/v1/motels/${id}`, data);
  },

  deleteMotel: async (id: string): Promise<{ message: string }> => {
    return api.del(`/api/v1/motels/${id}`);
  },
};
