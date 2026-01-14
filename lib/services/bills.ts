import { api } from "../api";
import type { Bill } from "../../types";

export interface CreateBillRequest {
  contractId: string;
  month: string; 
  electricityStart: number;
  electricityEnd: number;
  waterStart: number;
  waterEnd: number;
  electricityRate: number;
  waterRate: number;
  otherFees?: number;
}

export interface UpdateBillRequest {
  electricityStart?: number;
  electricityEnd?: number;
  waterStart?: number;
  waterEnd?: number;
  electricityRate?: number;
  waterRate?: number;
  otherFees?: number;
  isPaid?: boolean;
}

export interface BillListResponse {
  data: Bill[];
  total: number;
  page: number;
  limit: number;
}

export interface PaymentRequest {
  paymentMethod: "bank_transfer" | "cash" | "e_wallet";
  note?: string;
}

export interface PaymentResponse {
  billId: string;
  status: "success" | "pending";
  message: string;
  transactionId?: string;
}

export const billService = {
  listBills: async (page = 1, limit = 10, motelId?: string): Promise<BillListResponse> => {
    const query = new URLSearchParams();
    query.append("page", page.toString());
    query.append("limit", limit.toString());
    if (motelId) query.append("motelId", motelId);
    return api.get(`/api/v1/bills?${query.toString()}`);
  },

  getBill: async (id: string): Promise<Bill> => {
    return api.get(`/api/v1/bills/${id}`);
  },

  createBill: async (data: CreateBillRequest): Promise<Bill> => {
    return api.post("/api/v1/bills", data);
  },

  updateBill: async (id: string, data: UpdateBillRequest): Promise<Bill> => {
    return api.put(`/api/v1/bills/${id}`, data);
  },

  markAsPaid: async (id: string): Promise<Bill> => {
    return api.put(`/api/v1/bills/${id}/pay`);
  },
};
