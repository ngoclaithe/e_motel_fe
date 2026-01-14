import { api } from "../api";

export type UserRole = "ADMIN" | "LANDLORD" | "TENANT";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role?: UserRole;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Response types (from backend)
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  identityCard?: string | null;
  avatar?: string | null;
  refreshToken?: string | null;
  resetPasswordOtp?: string | null;
  resetPasswordExpires?: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthMeResponse {
  id: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    return api.post("/api/v1/auth/login", data);
  },

  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    return api.post("/api/v1/auth/register", data);
  },

  logout: async (): Promise<void> => {
    return api.post("/api/v1/auth/logout", {});
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<{ message: string }> => {
    return api.post("/api/v1/auth/forgot-password", data);
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<{ message: string }> => {
    return api.post("/api/v1/auth/reset-password", data);
  },

  changePassword: async (data: ChangePasswordRequest): Promise<{ message: string }> => {
    return api.post("/api/v1/auth/change-password", data);
  },

  refreshToken: async (data: RefreshTokenRequest): Promise<LoginResponse> => {
    return api.post("/api/v1/auth/refresh-token", data);
  },

  me: async (): Promise<AuthMeResponse> => {
    return api.get("/api/v1/auth/me");
  },
};
