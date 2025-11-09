import { IsEmail, IsNotEmpty, IsOptional, MinLength, IsEnum } from 'class-validator';
import { api } from "../api";

export type UserRole = "admin" | "landlord" | "tenant";

export class LoginDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsEnum(["admin", "landlord", "tenant"] as const)
  role?: UserRole;

  @IsOptional()
  firstName?: string;

  @IsOptional()
  lastName?: string;

  @IsOptional()
  phoneNumber?: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  otp: string;

  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}

export class ChangePasswordDto {
  @IsNotEmpty()
  oldPassword: string;

  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}

export class RefreshTokenDto {
  @IsNotEmpty()
  refreshToken: string;
}

// Type definitions for API responses
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
}

export interface AuthResponse {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export const authService = {
  login: async (data: LoginDto): Promise<LoginResponse> => {
    return api.post("/api/v1/auth/login", data);
  },

  register: async (data: RegisterDto): Promise<RegisterResponse> => {
    return api.post("/api/v1/auth/register", data);
  },

  logout: async (): Promise<void> => {
    return api.post("/api/v1/auth/logout", {});
  },

  forgotPassword: async (data: ForgotPasswordDto): Promise<ForgotPasswordResponse> => {
    return api.post("/api/v1/auth/forgot-password", data);
  },

  resetPassword: async (data: ResetPasswordDto): Promise<ResetPasswordResponse> => {
    return api.post("/api/v1/auth/reset-password", data);
  },

  changePassword: async (data: ChangePasswordDto): Promise<ChangePasswordResponse> => {
    return api.post("/api/v1/auth/change-password", data);
  },

  refreshToken: async (data: RefreshTokenDto): Promise<LoginResponse> => {
    return api.post("/api/v1/auth/refresh-token", data);
  },

  me: async (): Promise<AuthResponse> => {
    return api.get("/api/v1/auth/me");
  },
};
