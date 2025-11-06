import { api } from "../api";
import type { Feedback } from "../../types";

export interface CreateFeedbackRequest {
  title: string;
  description: string;
  category: "maintenance" | "cleaning" | "complaint" | "other";
  priority: "low" | "normal" | "high" | "urgent";
  images?: string[];
  roomId?: string;
}

export interface UpdateFeedbackRequest {
  status?: "pending" | "in_progress" | "completed";
  priority?: "low" | "normal" | "high" | "urgent";
  title?: string;
  description?: string;
}

export interface FeedbackListResponse {
  data: Feedback[];
  total: number;
  page: number;
  limit: number;
}

export const feedbackService = {
  listFeedbacks: async (page = 1, limit = 10, status?: string, motelId?: string): Promise<FeedbackListResponse> => {
    const query = new URLSearchParams();
    query.append("page", page.toString());
    query.append("limit", limit.toString());
    if (status) query.append("status", status);
    if (motelId) query.append("motelId", motelId);
    return api.get(`/api/v1/feedbacks?${query.toString()}`);
  },

  getFeedback: async (id: string): Promise<Feedback> => {
    return api.get(`/api/v1/feedbacks/${id}`);
  },

  createFeedback: async (data: CreateFeedbackRequest): Promise<Feedback> => {
    return api.post("/api/v1/feedbacks", data);
  },

  updateFeedback: async (id: string, data: UpdateFeedbackRequest): Promise<Feedback> => {
    return api.put(`/api/v1/feedbacks/${id}`, data);
  },

  deleteFeedback: async (id: string): Promise<{ message: string }> => {
    return api.del(`/api/v1/feedbacks/${id}`);
  },
};
