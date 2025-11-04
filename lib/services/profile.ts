import { api } from "../api";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: "admin" | "landlord" | "tenant";
  idCard?: string;
  address?: string;
  createdAt: string;
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  avatar?: string;
  idCard?: string;
  address?: string;
}

export const profileService = {
  getProfile: async (): Promise<UserProfile> => {
    return api.get("/api/v1/profile");
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<UserProfile> => {
    return api.put("/api/v1/profile", data);
  },

  changePassword: async (oldPassword: string, newPassword: string): Promise<{ message: string }> => {
    return api.put("/api/v1/profile/password", { oldPassword, newPassword });
  },
};
