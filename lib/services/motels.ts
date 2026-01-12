import { api } from "../api";
import type { Motel } from "../../types";

export interface CreateMotelRequest {
  name: string;
  address: string;
  description?: string;
  totalRooms?: number;
  monthlyRent?: number;
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
  monthlyRent?: number;
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
  totalPages: number;
}

export interface MotelFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  hasWifi?: boolean;
  hasParking?: boolean;
  allowPets?: boolean;
  minPrice?: number;
  maxPrice?: number;
  alleyType?: string;
  securityType?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

const buildQueryString = (params: MotelFilterParams): string => {
  const query = new URLSearchParams();

  if (params.page) query.append('page', String(params.page));
  if (params.limit) query.append('limit', String(params.limit));
  if (params.search) query.append('search', params.search);
  if (params.hasWifi !== undefined) query.append('hasWifi', String(params.hasWifi));
  if (params.hasParking !== undefined) query.append('hasParking', String(params.hasParking));
  if (params.allowPets !== undefined) query.append('allowPets', String(params.allowPets));
  if (params.minPrice !== undefined) query.append('minPrice', String(params.minPrice));
  if (params.maxPrice !== undefined) query.append('maxPrice', String(params.maxPrice));
  if (params.alleyType) query.append('alleyType', params.alleyType);
  if (params.securityType) query.append('securityType', params.securityType);
  if (params.sortBy) query.append('sortBy', params.sortBy);
  if (params.sortOrder) query.append('sortOrder', params.sortOrder);

  const qs = query.toString();
  return qs ? `?${qs}` : '';
};

export const motelService = {
  listMotels: async (params: MotelFilterParams = {}): Promise<MotelListResponse> => {
    const defaultParams = { page: 1, limit: 10, ...params };
    const queryString = buildQueryString(defaultParams);
    return api.get<MotelListResponse>(`/api/v1/motels${queryString}`);
  },

  getMyMotels: async (): Promise<MotelListResponse> => {
    const response = await api.get<Motel[] | MotelListResponse>(`/api/v1/motels/my-motels`);
    if (Array.isArray(response)) {
      return {
        data: response,
        total: response.length,
        page: 1,
        limit: response.length,
        totalPages: 1,
      };
    }
    return response;
  },

  getMotel: async (id: string): Promise<Motel> => {
    return api.get<Motel>(`/api/v1/motels/${id}`);
  },

  createMotel: async (data: CreateMotelRequest): Promise<Motel> => {
    return api.post<Motel>("/api/v1/motels", data);
  },

  updateMotel: async (id: string, data: UpdateMotelRequest): Promise<Motel> => {
    return api.put<Motel>(`/api/v1/motels/${id}`, data);
  },

  deleteMotel: async (id: string): Promise<{ message: string }> => {
    return api.del<{ message: string }>(`/api/v1/motels/${id}`);
  },
};
