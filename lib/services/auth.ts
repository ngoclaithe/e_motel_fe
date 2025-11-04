import { api } from "../api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    email: string;
    role: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: "tenant" | "landlord";
  phone?: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface LogoutRequest {
  token?: string;
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

  me: async (): Promise<{ id: string; email: string; role: string; name: string }> => {
    return api.get("/api/v1/auth/me");
  },
};
