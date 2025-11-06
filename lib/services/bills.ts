import { api } from "../api";
import type { Bill } from "../../types";

export interface CreateBillRequest {
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
  dueDate: string;
}

export interface UpdateBillRequest {
  roomPrice?: number;
  electricityUsage?: number;
  electricityPrice?: number;
  waterUsage?: number;
  waterPrice?: number;
  otherFees?: number;
  dueDate?: string;
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

  payBill: async (id: string, data: PaymentRequest): Promise<PaymentResponse> => {
    return api.post(`/api/v1/bills/${id}/pay`, data);
  },
};
