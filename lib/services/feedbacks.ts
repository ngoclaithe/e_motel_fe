import { api } from "../api";

export type FeedbackStatus = "PENDING" | "IN_PROGRESS" | "RESOLVED";

export interface Feedback {
  id: string;
  title: string;
  description: string;
  status: FeedbackStatus;
  images: string[];
  roomId: string;
  userId: string;
  room?: any;
  user?: any;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeedbackRequest {
  title: string;
  description: string;
  roomId: string;
  images?: string[];
}

export interface UpdateFeedbackRequest {
  status?: FeedbackStatus;
  title?: string;
  description?: string;
  images?: string[];
}

export const feedbackService = {
  listFeedbacks: async (): Promise<Feedback[]> => {
    return api.get("/api/v1/feedbacks");
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

  deleteFeedback: async (id: string): Promise<void> => {
    return api.del(`/api/v1/feedbacks/${id}`);
  },
};
