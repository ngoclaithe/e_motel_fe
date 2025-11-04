import { api } from "../api";
import type { Contract } from "../types";

export interface CreateContractRequest {
  tenantEmail: string;
  roomId: string;
  startDate: string;
  endDate: string;
  monthlyPrice: number;
  deposit: number;
  paymentPeriod: "monthly" | "quarterly" | "yearly";
  notes?: string;
}

export interface UpdateContractRequest {
  startDate?: string;
  endDate?: string;
  monthlyPrice?: number;
  deposit?: number;
  paymentPeriod?: "monthly" | "quarterly" | "yearly";
  notes?: string;
}

export interface ContractListResponse {
  data: Contract[];
  total: number;
  page: number;
  limit: number;
}

export const contractService = {
  listContracts: async (page = 1, limit = 10, motelId?: string): Promise<ContractListResponse> => {
    const query = new URLSearchParams();
    query.append("page", page.toString());
    query.append("limit", limit.toString());
    if (motelId) query.append("motelId", motelId);
    return api.get(`/api/v1/contracts?${query.toString()}`);
  },

  getContract: async (id: string): Promise<Contract> => {
    return api.get(`/api/v1/contracts/${id}`);
  },

  createContract: async (data: CreateContractRequest): Promise<Contract> => {
    return api.post("/api/v1/contracts", data);
  },

  updateContract: async (id: string, data: UpdateContractRequest): Promise<Contract> => {
    return api.put(`/api/v1/contracts/${id}`, data);
  },

  deleteContract: async (id: string): Promise<{ message: string }> => {
    return api.del(`/api/v1/contracts/${id}`);
  },
};
