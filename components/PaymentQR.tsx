"use client";

import { X } from "lucide-react";
import { removeVietnameseTones, generatePaymentQR, formatCurrency } from "../lib/utils/payment";

interface PaymentQRProps {
    billId: string;
    amount: number;
    bankName: string;
    bankCode: string;
    accountNumber: string;
    landlordName: string;
    onClose: () => void;
}

export default function PaymentQR({
    billId,
    amount,
    bankName,
    bankCode,
    accountNumber,
    landlordName,
    onClose,
}: PaymentQRProps) {
    const qrUrl = generatePaymentQR(bankCode, accountNumber, amount, billId);
    const shortId = billId.slice(-8).toUpperCase();
    const content = `HD ${shortId}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="relative w-full max-w-md rounded-2xl border border-black/10 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-black/90">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-lg p-2 hover:bg-black/5 dark:hover:bg-white/10"
                >
                    <X className="h-5 w-5" />
                </button>

                <h2 className="mb-6 text-xl font-semibold">Thanh toán hóa đơn</h2>

                <div className="space-y-6">
                    {/* QR Code */}
                    <div className="flex justify-center">
                        <img
                            src={qrUrl}
                            alt="QR Code thanh toán"
                            className="h-64 w-64 rounded-lg border border-black/10 dark:border-white/10"
                        />
                    </div>

                    {/* Payment Info */}
                    <div className="space-y-3 rounded-xl border border-black/10 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/5">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Ngân hàng:</span>
                            <span className="font-medium">{bankName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Số tài khoản:</span>
                            <span className="font-mono font-medium">{accountNumber}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Chủ tài khoản:</span>
                            <span className="font-medium">{landlordName}</span>
                        </div>
                        <div className="flex justify-between border-t border-black/10 pt-3 dark:border-white/10">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Số tiền:</span>
                            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                {formatCurrency(amount)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Nội dung:</span>
                            <span className="font-mono text-sm font-medium">{content}</span>
                        </div>
                    </div>



                    <button
                        onClick={onClose}
                        className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 font-medium text-white shadow-lg transition-all hover:shadow-xl"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}
