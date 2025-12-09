"use client";

import { useState, useRef, useCallback } from "react";
import { Camera, X, Upload, CheckCircle, XCircle } from "lucide-react";
import { uploadToCloudinary } from "../lib/cloudinary";
import { faceVerificationService } from "../lib/services/face-verification";
import { useToast } from "./providers/ToastProvider";

interface FaceVerificationProps {
    onClose: () => void;
    onVerified: () => void;
}

export default function FaceVerification({ onClose, onVerified }: FaceVerificationProps) {
    const { push } = useToast();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [result, setResult] = useState<{ verified: boolean; similarity: number } | null>(null);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user", width: 640, height: 480 },
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setCameraActive(true);
        } catch (error) {
            console.error("Camera access error:", error);
            push({ title: "Không thể truy cập camera", description: "Vui lòng cho phép truy cập camera", type: "error" });
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }
        setCameraActive(false);
    };

    const capturePhoto = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        if (!context) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);

        const imageData = canvas.toDataURL("image/jpeg", 0.9);
        setCapturedImage(imageData);
        stopCamera();
    }, [stream]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            push({ title: "Vui lòng chọn file ảnh", type: "error" });
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            setCapturedImage(event.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleVerify = async () => {
        if (!capturedImage) return;

        try {
            console.log('=== FRONTEND VERIFICATION DEBUG ===');
            console.log('Starting verification...');

            setUploading(true);

            const response = await fetch(capturedImage);
            const blob = await response.blob();
            const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });

            console.log('Uploading to Cloudinary...');
            const selfieUrl = await uploadToCloudinary(file);
            console.log('Selfie URL:', selfieUrl);

            setUploading(false);
            setVerifying(true);

            console.log('Calling verification API...');
            const verifyResult = await faceVerificationService.verifyFace({ selfieUrl });
            console.log('Verification result:', verifyResult);

            setResult(verifyResult);

            if (verifyResult.verified) {
                push({
                    title: "Xác thực thành công!",
                    description: `Độ tương đồng: ${(verifyResult.similarity * 100).toFixed(1)}%`,
                    type: "success"
                });
                setTimeout(() => {
                    onVerified();
                    onClose();
                }, 2000);
            } else {
                push({
                    title: "Xác thực thất bại",
                    description: "Khuôn mặt không khớp. Vui lòng thử lại.",
                    type: "error"
                });
            }
        } catch (error: any) {
            console.error("Verification error:", error);
            push({
                title: "Lỗi xác thực",
                description: error.message || "Không thể xác thực. Vui lòng thử lại.",
                type: "error"
            });
        } finally {
            setUploading(false);
            setVerifying(false);
        }
    };

    const retake = () => {
        setCapturedImage(null);
        setResult(null);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl rounded-3xl border border-zinc-200/50 bg-white shadow-2xl dark:border-zinc-800/50 dark:bg-zinc-900">
                <div className="border-b border-zinc-200/50 bg-gradient-to-r from-zinc-50 to-white p-6 dark:border-zinc-800/50 dark:from-zinc-900 dark:to-zinc-950">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Xác thực danh tính</h2>
                        <button
                            onClick={onClose}
                            className="flex h-10 w-10 items-center justify-center rounded-full transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    {!cameraActive && !capturedImage && (
                        <div className="text-center space-y-4">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                                <Camera className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">Chụp ảnh selfie hoặc upload ảnh</h3>
                                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                                    Chúng tôi sẽ so sánh ảnh với avatar của bạn để xác thực danh tính
                                </p>
                            </div>
                            <div className="flex justify-center gap-3">
                                <button
                                    onClick={startCamera}
                                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-medium text-white shadow-lg transition-all hover:shadow-xl"
                                >
                                    <Camera className="h-5 w-5" />
                                    Bật camera
                                </button>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-6 py-3 font-medium transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                                >
                                    <Upload className="h-5 w-5" />
                                    Upload ảnh
                                </button>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                        </div>
                    )}

                    {cameraActive && (
                        <div className="space-y-4">
                            <div className="relative overflow-hidden rounded-lg bg-black">
                                <video ref={videoRef} autoPlay playsInline className="w-full" />
                            </div>
                            <div className="flex justify-center gap-3">
                                <button
                                    onClick={stopCamera}
                                    className="rounded-lg border border-zinc-200 bg-white px-6 py-2.5 text-sm font-medium transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={capturePhoto}
                                    className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md"
                                >
                                    Chụp ảnh
                                </button>
                            </div>
                        </div>
                    )}

                    {capturedImage && (
                        <div className="space-y-4">
                            <div className="relative overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                <img
                                    src={capturedImage}
                                    alt="Preview"
                                    className="max-h-96 w-auto object-contain"
                                />
                            </div>

                            {result && (
                                <div className={`rounded-lg border p-4 ${result.verified ? 'border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-900/20' : 'border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-900/20'}`}>
                                    <div className="flex items-center gap-3">
                                        {result.verified ? (
                                            <CheckCircle className="h-6 w-6 text-green-600" />
                                        ) : (
                                            <XCircle className="h-6 w-6 text-red-600" />
                                        )}
                                        <div>
                                            <div className="font-semibold">{result.verified ? 'Xác thực thành công!' : 'Xác thực thất bại'}</div>
                                            <div className="text-sm">Độ tương đồng: {(result.similarity * 100).toFixed(1)}%</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-center gap-3">
                                <button
                                    onClick={retake}
                                    disabled={uploading || verifying}
                                    className="rounded-lg border border-zinc-200 bg-white px-6 py-2.5 text-sm font-medium transition-all hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                                >
                                    Chọn lại
                                </button>
                                <button
                                    onClick={handleVerify}
                                    disabled={uploading || verifying || !!result}
                                    className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md disabled:opacity-50"
                                >
                                    {uploading ? "Đang upload..." : verifying ? "Đang xác thực..." : "Xác thực"}
                                </button>
                            </div>
                        </div>
                    )}

                    <canvas ref={canvasRef} className="hidden" />
                </div>
            </div>
        </div>
    );
}
