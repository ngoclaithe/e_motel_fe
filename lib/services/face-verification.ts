import { api } from "../api";

export interface VerifyFaceRequest {
    selfieUrl: string;
}

export interface VerifyFaceResponse {
    verified: boolean;
    similarity: number;
    message: string;
}

export const faceVerificationService = {
    verifyFace: async (data: VerifyFaceRequest): Promise<VerifyFaceResponse> => {
        return api.post("/api/v1/face-verification/verify", data);
    },
};
