import { api } from "../api";

export interface RevenueReport {
  month: number;
  year: number;
  totalRevenue: number;
  paidAmount: number;
  unpaidAmount: number;
  billCount: number;
}

export interface RoomOccupancyReport {
  total: number;
  occupied: number;
  vacant: number;
  maintenance: number;
  occupancyRate: number;
}

export interface ContractExpiringReport {
  contractId: string;
  tenantEmail: string;
  roomName: string;
  endDate: string;
  daysUntilExpiry: number;
}

export interface SystemStatistics {
  totalMotels: number;
  totalRooms: number;
  totalContracts: number;
  totalRevenue: number;
  occupancyRate: number;
  totalUsers: number;
  adminCount: number;
  landlordCount: number;
  tenantCount: number;
}

export interface RevenueReportResponse {
  data: RevenueReport[];
  total: number;
  period: string;
}

export interface ContractExpiringResponse {
  data: ContractExpiringReport[];
  total: number;
}

export const reportService = {
  getSystemStatistics: async (): Promise<SystemStatistics> => {
    return api.get("/api/v1/reports/statistics");
  },

  getRevenueReport: async (year: number, month?: number): Promise<RevenueReportResponse> => {
    const query = new URLSearchParams();
    query.append("year", year.toString());
    if (month) query.append("month", month.toString());
    return api.get(`/api/v1/reports/revenue?${query.toString()}`);
  },

  getRoomOccupancyReport: async (motelId?: string): Promise<RoomOccupancyReport> => {
    const query = new URLSearchParams();
    if (motelId) query.append("motelId", motelId);
    return api.get(`/api/v1/reports/occupancy?${query.toString()}`);
  },

  getExpiringContractsReport: async (daysFromNow = 30, motelId?: string): Promise<ContractExpiringResponse> => {
    const query = new URLSearchParams();
    query.append("days", daysFromNow.toString());
    if (motelId) query.append("motelId", motelId);
    return api.get(`/api/v1/reports/expiring-contracts?${query.toString()}`);
  },

  exportReportAsPDF: async (reportType: "revenue" | "occupancy" | "contracts", year: number, month?: number): Promise<Blob> => {
    const query = new URLSearchParams();
    query.append("type", reportType);
    query.append("year", year.toString());
    if (month) query.append("month", month.toString());
    const response = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "")}/api/v1/reports/export?${query.toString()}`, {
      headers: {
        "Authorization": `Bearer ${getTokenFromStorage()}`,
      },
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to export report");
    return response.blob();
  },

  exportReportAsExcel: async (reportType: "revenue" | "occupancy" | "contracts", year: number, month?: number): Promise<Blob> => {
    const query = new URLSearchParams();
    query.append("type", reportType);
    query.append("format", "excel");
    query.append("year", year.toString());
    if (month) query.append("month", month.toString());
    const response = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "")}/api/v1/reports/export?${query.toString()}`, {
      headers: {
        "Authorization": `Bearer ${getTokenFromStorage()}`,
      },
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to export report");
    return response.blob();
  },
};

function getTokenFromStorage(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const keys = ["emotel_token", "token", "access_token", "accessToken", "auth_token"];
    for (const storage of [localStorage, sessionStorage]) {
      try {
        for (const k of keys) {
          const v = storage.getItem(k);
          if (typeof v === "string" && v.trim()) {
            return v.replace(/^Bearer\s+/i, "").trim();
          }
        }
        const session = storage.getItem("emotel_session");
        if (session) {
          const obj = JSON.parse(session);
          if (obj && typeof obj === "object" && typeof (obj as any).token === "string") {
            return (obj as any).token.replace(/^Bearer\s+/i, "").trim();
          }
        }
      } catch {
        // ignore
      }
    }
  } catch {
    // ignore
  }
  return null;
}
