"use client";

import { useState, useEffect } from "react";
import type { Motel } from "../../../../types";
import { useToast } from "../../../../components/providers/ToastProvider";
import { useEnsureRole } from "../../../../hooks/useAuth";
import { motelService } from "../../../../lib/services/motels";

export default function AdminMotelsPage() {
  useEnsureRole(["ADMIN"]);
  const { push } = useToast();
  const [motels, setMotels] = useState<Motel[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [viewingMotel, setViewingMotel] = useState<Motel | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchMotels();
  }, [page, query]);

  const fetchMotels = async () => {
    try {
      setLoading(true);
      const response = await motelService.listMotels({
        page,
        limit: 12,
        search: query || undefined,
      });
      setMotels(response.data || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error("Error fetching motels:", error);
      push({ title: "Lỗi", description: "Không thể tải danh sách nhà trọ", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Xóa nhà trọ này?")) return;
    try {
      await motelService.deleteMotel(id);
      push({ title: "Đã xóa", type: "info" });
      await fetchMotels();
    } catch (error: any) {
      console.error(error);
      push({ title: "Lỗi", description: error?.message || "Không thể xóa nhà trọ", type: "error" });
    }
  };

  const handleImageError = (motelId: string) => {
    setFailedImages((prev) => new Set(prev).add(motelId));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Quản lý nhà trọ</h1>
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-black/40">
        <input
          type="text"
          placeholder="Tìm kiếm nhà trọ..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          disabled={loading}
          className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 disabled:opacity-50 dark:border-white/15 dark:focus:border-white/25"
        />
      </div>

      {loading && (
        <div className="rounded-2xl border border-black/10 bg-white p-8 text-center dark:border-white/10 dark:bg-black/40">
          <div className="text-sm text-zinc-500">Đang tải...</div>
        </div>
      )}

      {!loading && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {motels.map((m) => (
              <div
                key={m.id}
                onClick={() => setViewingMotel(m)}
                className="group cursor-pointer rounded-2xl border border-black/10 bg-white shadow-sm overflow-hidden transition-all hover:shadow-md dark:border-white/10 dark:bg-black/40 flex flex-col"
              >
                <div className="h-40 overflow-hidden bg-black/5 dark:bg-white/5 flex items-center justify-center">
                  {m.images && m.images.length > 0 && !failedImages.has(m.id) ? (
                    <img
                      src={typeof m.images[0] === 'string' ? m.images[0] : ((m.images[0] as Record<string, unknown>)?.url as string) || ''}
                      alt={m.name}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(m.id)}
                    />
                  ) : (
                    <div className="text-sm text-zinc-400">Không có hình ảnh</div>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <div>
                    <div className="font-medium">{m.name}</div>
                    <div className="text-xs text-zinc-500">{m.address}</div>
                  </div>
                  {m.totalRooms && (
                    <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                      Tổng phòng: {m.totalRooms}
                    </div>
                  )}
                  {(m as any).owner && (
                    <div className="mt-1 text-xs text-zinc-400">
                      Chủ: {(m as any).owner.firstName || (m as any).owner.lastName ? `${(m as any).owner.firstName || ""} ${(m as any).owner.lastName || ""}`.trim() : (m as any).owner.email}
                    </div>
                  )}
                  <div className="mt-3 flex gap-2">
                    <button onClick={(e) => { e.stopPropagation(); remove(m.id); }} className="rounded-lg border border-black/10 px-3 py-1.5 text-xs text-red-600 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10">Xóa</button>
                  </div>
                </div>
              </div>
            ))}
            {motels.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-black/15 p-8 text-center text-sm text-zinc-500 dark:border-white/15">
                Không tìm thấy nhà trọ
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-black/40">
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                Trang {page} / {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-black/10 px-3 py-1.5 text-sm disabled:opacity-50 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
                >
                  Trước
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-lg border border-black/10 px-3 py-1.5 text-sm disabled:opacity-50 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* View Detail Modal */}
      {viewingMotel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] rounded-2xl border border-black/10 bg-white shadow-xl dark:border-white/10 dark:bg-black/40 flex flex-col">
            <div className="flex-shrink-0 border-b border-black/10 px-6 py-4 dark:border-white/15 flex justify-between items-center">
              <h2 className="text-lg font-semibold">{viewingMotel.name}</h2>
              <button onClick={() => setViewingMotel(null)} className="text-zinc-500 hover:text-black dark:hover:text-white">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-6">
                {viewingMotel.images && viewingMotel.images.length > 0 && (
                  <div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                      {viewingMotel.images.slice(0, 8).map((img, idx) => {
                        const imgUrl = typeof img === 'string' ? img : ((img as Record<string, unknown>)?.url as string) || '';
                        return (
                          <div
                            key={idx}
                            onClick={() => setViewingImage(imgUrl)}
                            className="group relative cursor-pointer rounded-lg overflow-hidden bg-black/5 dark:bg-white/5 h-32"
                          >
                            <img src={imgUrl} alt={`${idx + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                              <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-medium bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm">Xem</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <div className="mb-2 text-sm font-semibold">Địa chỉ</div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">{viewingMotel.address}</div>
                </div>

                {viewingMotel.description && (
                  <div>
                    <div className="mb-2 text-sm font-semibold">Mô tả</div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">{viewingMotel.description}</div>
                  </div>
                )}

                {viewingMotel.totalRooms && (
                  <div>
                    <div className="mb-2 text-sm font-semibold">Tổng phòng</div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">{viewingMotel.totalRooms}</div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {viewingMotel.hasWifi && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">✓ WiFi</span>
                    </div>
                  )}
                  {viewingMotel.hasParking && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">✓ Gửi xe</span>
                    </div>
                  )}
                  {viewingMotel.hasAirConditioner && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">✓ Điều hòa</span>
                    </div>
                  )}
                  {viewingMotel.hasWashingMachine && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">✓ Máy giặt</span>
                    </div>
                  )}
                  {viewingMotel.hasKitchen && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">✓ Bếp chung</span>
                    </div>
                  )}
                  {viewingMotel.hasRooftop && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">✓ Sân thượng</span>
                    </div>
                  )}
                  {viewingMotel.allowPets && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">✓ Cho phép thú cưng</span>
                    </div>
                  )}
                  {viewingMotel.allowCooking && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">✓ Cho phép nấu ăn</span>
                    </div>
                  )}
                </div>

                {(viewingMotel.electricityCostPerKwh || viewingMotel.waterCostPerCubicMeter || viewingMotel.internetCost) && (
                  <div className="border-t border-black/10 pt-4 dark:border-white/15">
                    <div className="mb-3 text-sm font-semibold">Chi phí</div>
                    <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                      {viewingMotel.electricityCostPerKwh && <div>Điện: {viewingMotel.electricityCostPerKwh.toLocaleString()}đ/kWh</div>}
                      {viewingMotel.waterCostPerCubicMeter && <div>Nước: {viewingMotel.waterCostPerCubicMeter.toLocaleString()}đ/m³</div>}
                      {viewingMotel.internetCost && <div>Internet: {viewingMotel.internetCost.toLocaleString()}đ/tháng</div>}
                      {viewingMotel.parkingCost && <div>Gửi xe: {viewingMotel.parkingCost.toLocaleString()}đ/tháng</div>}
                    </div>
                  </div>
                )}

                {viewingMotel.nearbyPlaces && viewingMotel.nearbyPlaces.length > 0 && (
                  <div className="border-t border-black/10 pt-4 dark:border-white/15">
                    <div className="mb-3 text-sm font-semibold">Địa điểm lân cận</div>
                    <div className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {viewingMotel.nearbyPlaces.map((place, idx) => (
                        <div key={idx}>• {place}</div>
                      ))}
                    </div>
                  </div>
                )}

                {viewingMotel.regulations && (
                  <div className="border-t border-black/10 pt-4 dark:border-white/15">
                    <div className="mb-3 text-sm font-semibold">Quy định</div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-line">{viewingMotel.regulations}</div>
                  </div>
                )}

                {(viewingMotel.contactPhone || viewingMotel.contactEmail || viewingMotel.contactZalo) && (
                  <div className="border-t border-black/10 pt-4 dark:border-white/15">
                    <div className="mb-3 text-sm font-semibold">Thông tin liên hệ</div>
                    <div className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {viewingMotel.contactPhone && <div>SĐT: {viewingMotel.contactPhone}</div>}
                      {viewingMotel.contactEmail && <div>Email: {viewingMotel.contactEmail}</div>}
                      {viewingMotel.contactZalo && <div>Zalo: {viewingMotel.contactZalo}</div>}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-shrink-0 border-t border-black/10 px-6 py-4 dark:border-white/15 flex justify-end">
              <button
                onClick={() => setViewingMotel(null)}
                className="rounded-lg border border-black/10 px-4 py-2 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox */}
      {viewingImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4" onClick={() => setViewingImage(null)}>
          <img src={viewingImage} alt="Full size" className="max-w-full max-h-full object-contain" />
        </div>
      )}
    </div>
  );
}
