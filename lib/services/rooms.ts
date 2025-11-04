import { api } from "../api";
import type { Room } from "../types";

export interface CreateRoomRequest {
  motelId: string;
  name: string;
  area: number;
  price: number;
  status?: "vacant" | "occupied" | "maintenance";
  images?: string[];
  notes?: string[];
}

export interface UpdateRoomRequest {
  name?: string;
  area?: number;
  price?: number;
  status?: "vacant" | "occupied" | "maintenance";
  images?: string[];
  notes?: string[];
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
