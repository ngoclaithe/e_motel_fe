"use client";

import Link from "next/link";
import { useEnsureRole } from "../../../hooks/useAuth";
import { useEffect, useState } from "react";
import { useLocalStorage } from "../../../hooks/useLocalStorage";
import type { Bill, Contract } from "../../../types";

export default function LandlordDashboard() {
  useEnsureRole(["LANDLORD"]);

  const [bills] = useLocalStorage<Bill[]>("emotel_bills", []);
  const [contracts] = useLocalStorage<Contract[]>("emotel_contracts", []);

  const landlordEmail = (() => {
    try {
      const session = JSON.parse(localStorage.getItem("emotel_session") || "null");
      return session?.email || "";
    } catch {
      return "";
    }
  })();

  const myBills = bills.filter((b) => b.landlordEmail === landlordEmail);
  const myContracts = contracts;

  const unpaidBills = myBills.filter((b) => b.status === "unpaid");
  const overdueBills = unpaidBills.filter((b) => new Date(b.dueDate) < new Date());
  const totalRevenue = myBills
    .filter((b) => b.status === "paid")
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  const expiringContracts = myContracts.filter((c) => {
    const end = new Date(c.endDate);
    const now = new Date();
    const daysLeft = Math.floor((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft >= 0 && daysLeft <= 30;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Tổng quan quản lý nhà trọ của bạn
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <div className="group relative overflow-hidden rounded-2xl border border-black/10 bg-gradient-to-br from-green-50 to-emerald-50 p-6 shadow-sm transition-all hover:shadow-lg dark:border-white/10 dark:from-green-900/20 dark:to-emerald-900/20">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-green-200/30 blur-2xl dark:bg-green-500/10"></div>
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-green-700 dark:text-green-400">
                Doanh thu đã thu
              </div>
              <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/40">
                <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 text-3xl font-bold text-green-900 dark:text-green-100">
              {totalRevenue.toLocaleString()}đ
            </div>
            <div className="mt-1 text-xs text-green-600 dark:text-green-400">
              Tổng số tiền đã thanh toán
            </div>
          </div>
        </div>

        {/* Unpaid Bills */}
        <div className="group relative overflow-hidden rounded-2xl border border-black/10 bg-gradient-to-br from-orange-50 to-amber-50 p-6 shadow-sm transition-all hover:shadow-lg dark:border-white/10 dark:from-orange-900/20 dark:to-amber-900/20">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-orange-200/30 blur-2xl dark:bg-orange-500/10"></div>
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-orange-700 dark:text-orange-400">
                Hóa đơn chưa thu
              </div>
              <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/40">
                <svg className="h-5 w-5 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 text-3xl font-bold text-orange-900 dark:text-orange-100">
              {unpaidBills.length}
            </div>
            <div className="mt-1 text-xs text-orange-600 dark:text-orange-400">
              {unpaidBills.reduce((sum, b) => sum + (b.totalAmount || 0), 0).toLocaleString()}đ chưa thu
            </div>
          </div>
        </div>

        {/* Overdue Bills */}
        <div className="group relative overflow-hidden rounded-2xl border border-black/10 bg-gradient-to-br from-red-50 to-pink-50 p-6 shadow-sm transition-all hover:shadow-lg dark:border-white/10 dark:from-red-900/20 dark:to-pink-900/20">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-red-200/30 blur-2xl dark:bg-red-500/10"></div>
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-red-700 dark:text-red-400">
                Hóa đơn quá hạn
              </div>
              <div className="rounded-lg bg-red-100 p-2 dark:bg-red-900/40">
                <svg className="h-5 w-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 text-3xl font-bold text-red-900 dark:text-red-100">
              {overdueBills.length}
            </div>
            <div className="mt-1 text-xs text-red-600 dark:text-red-400">
              Cần xử lý ngay
            </div>
          </div>
        </div>

        {/* Expiring Contracts */}
        <div className="group relative overflow-hidden rounded-2xl border border-black/10 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-sm transition-all hover:shadow-lg dark:border-white/10 dark:from-blue-900/20 dark:to-indigo-900/20">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-blue-200/30 blur-2xl dark:bg-blue-500/10"></div>
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-blue-700 dark:text-blue-400">
                HĐ sắp hết hạn
              </div>
              <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/40">
                <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 text-3xl font-bold text-blue-900 dark:text-blue-100">
              {expiringContracts.length}
            </div>
            <div className="mt-1 text-xs text-blue-600 dark:text-blue-400">
              Trong vòng 30 ngày
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-black/40">
        <h2 className="mb-4 text-lg font-semibold">Thao tác nhanh</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Link
            href="/landlord/contracts"
            className="group flex flex-col items-center gap-2 rounded-xl border border-black/10 bg-gradient-to-br from-purple-50 to-purple-100 p-4 text-center transition-all hover:scale-105 hover:shadow-md dark:border-white/10 dark:from-purple-900/20 dark:to-purple-800/20"
          >
            <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/40">
              <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Hợp đồng</span>
          </Link>

          <Link
            href="/landlord/bills"
            className="group flex flex-col items-center gap-2 rounded-xl border border-black/10 bg-gradient-to-br from-blue-50 to-blue-100 p-4 text-center transition-all hover:scale-105 hover:shadow-md dark:border-white/10 dark:from-blue-900/20 dark:to-blue-800/20"
          >
            <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/40">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Hóa đơn</span>
          </Link>

          <Link
            href="/motels"
            className="group flex flex-col items-center gap-2 rounded-xl border border-black/10 bg-gradient-to-br from-green-50 to-green-100 p-4 text-center transition-all hover:scale-105 hover:shadow-md dark:border-white/10 dark:from-green-900/20 dark:to-green-800/20"
          >
            <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/40">
              <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className="text-sm font-medium text-green-900 dark:text-green-100">Nhà trọ</span>
          </Link>

          <Link
            href="/rooms"
            className="group flex flex-col items-center gap-2 rounded-xl border border-black/10 bg-gradient-to-br from-orange-50 to-orange-100 p-4 text-center transition-all hover:scale-105 hover:shadow-md dark:border-white/10 dark:from-orange-900/20 dark:to-orange-800/20"
          >
            <div className="rounded-lg bg-orange-100 p-3 dark:bg-orange-900/40">
              <svg className="h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span className="text-sm font-medium text-orange-900 dark:text-orange-100">Phòng</span>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Overdue Bills List */}
        {overdueBills.length > 0 && (
          <div className="rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-pink-50 p-6 shadow-sm dark:border-red-900/30 dark:from-red-900/20 dark:to-pink-900/20">
            <h2 className="mb-4 text-lg font-semibold text-red-900 dark:text-red-100">
              ⚠️ Hóa đơn quá hạn
            </h2>
            <div className="space-y-2">
              {overdueBills.slice(0, 5).map((bill) => (
                <div
                  key={bill.id}
                  className="flex items-center justify-between rounded-lg border border-red-200 bg-white/50 p-3 dark:border-red-900/30 dark:bg-black/20"
                >
                  <div>
                    <div className="text-sm font-medium">Phòng {bill.roomId}</div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-400">
                      Hạn: {new Date(bill.dueDate).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-red-700 dark:text-red-400">
                      {bill.totalAmount?.toLocaleString()}đ
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {overdueBills.length > 5 && (
              <Link
                href="/landlord/bills"
                className="mt-3 block text-center text-sm text-red-700 hover:underline dark:text-red-400"
              >
                Xem tất cả {overdueBills.length} hóa đơn →
              </Link>
            )}
          </div>
        )}

        {/* Expiring Contracts List */}
        {expiringContracts.length > 0 && (
          <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-sm dark:border-blue-900/30 dark:from-blue-900/20 dark:to-indigo-900/20">
            <h2 className="mb-4 text-lg font-semibold text-blue-900 dark:text-blue-100">
              📋 Hợp đồng sắp hết hạn
            </h2>
            <div className="space-y-2">
              {expiringContracts.slice(0, 5).map((contract) => (
                <div
                  key={contract.id}
                  className="flex items-center justify-between rounded-lg border border-blue-200 bg-white/50 p-3 dark:border-blue-900/30 dark:bg-black/20"
                >
                  <div>
                    <div className="text-sm font-medium">
                      {contract.type === "ROOM" ? `Phòng ${contract.roomId}` : `Nhà trọ ${contract.motelId}`}
                    </div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-400">
                      Hết hạn: {new Date(contract.endDate).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                      {contract.monthlyRent?.toLocaleString()}đ/tháng
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {expiringContracts.length > 5 && (
              <Link
                href="/landlord/contracts"
                className="mt-3 block text-center text-sm text-blue-700 hover:underline dark:text-blue-400"
              >
                Xem tất cả {expiringContracts.length} hợp đồng →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
