import { api } from "../api";

export interface UserSearchResult {
  id: string;
  email?: string;
  phone?: string;
  fullName?: string;
  role?: string;
}

export const userService = {
  getAllUsers: async (): Promise<unknown> => {
    return api.get("/api/v1/users");
  },
  getLandlords: async (): Promise<unknown> => {
    return api.get("/api/v1/users/landlords");
  },
  getTenants: async (): Promise<unknown> => {
    return api.get("/api/v1/users/tenants");
  },
  getProfile: async (): Promise<unknown> => {
    return api.get("/api/v1/users/profile");
  },
  searchByPhone: async (phone: string): Promise<UserSearchResult | null> => {
    if (!phone) return null;
    const query = new URLSearchParams({ phone });
    const res = await api.get(`/api/v1/users/search/phone?${query.toString()}`);

    try {
      if (Array.isArray(res)) {
        if (res.length === 0) return null;
        const u = res[0] as any;
        return {
          id: String(u.id),
          role: u.role,
          fullName: [u.firstName, u.lastName].filter(Boolean).join(" "),
          phone: u.phoneNumber || u.phone || null,
          email: u.email || null,
        };
      }

      if (res && typeof res === "object") {
        const u = res as any;
        return {
          id: String(u.id),
          role: u.role,
          fullName: u.fullName || [u.firstName, u.lastName].filter(Boolean).join(" "),
          phone: u.phoneNumber || u.phone || null,
          email: u.email || null,
        };
      }
    } catch {
    }

    return null;
  },
  getUserById: async (id: string): Promise<unknown> => {
    return api.get(`/api/v1/users/${id}`);
  },
  updateUser: async (id: string, payload: unknown): Promise<unknown> => {
    return api.put(`/api/v1/users/${id}`, payload);
  },
  deleteUser: async (id: string): Promise<unknown> => {
    return api.del(`/api/v1/users/${id}`);
  },
};
