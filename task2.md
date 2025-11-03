# 💻 E-Motel Frontend Task List

## I. Cấu trúc & Thiết lập dự án
- [ ] Khởi tạo dự án Next.js (`npx create-next-app@latest e-motel --typescript --tailwind --eslint`)
- [ ] Cấu hình App Router (Next.js 15+)
- [ ] Thiết lập alias & cấu trúc thư mục:
  - `/app` – routing & layout
  - `/components` – UI components
  - `/hooks` – custom hooks
  - `/store` – Zustand stores
  - `/lib` – helper & config
  - `/types` – interface, model
- [ ] Cấu hình ShadCN UI
- [ ] Cấu hình TailwindCSS theme (color palette, font, spacing)
- [ ] Cấu hình React Query (hoặc TanStack Query)
- [ ] Cấu hình NextAuth.js (JWT)
- [ ] Tạo layout mặc định (header, sidebar, content, toast, modal...)

---

## II. Auth & User Flow
- [ ] Trang **Đăng nhập**
  - [ ] Form login (email/password)
  - [ ] Loading & error UI
- [ ] Trang **Đăng ký**
  - [ ] Form đăng ký + validate
  - [ ] Gửi OTP / xác thực email
- [ ] Trang **Quên mật khẩu**
  - [ ] Nhập email → gửi OTP → đặt lại mật khẩu
- [ ] Quản lý session với NextAuth (JWT + refresh)
- [ ] Trang **Hồ sơ cá nhân**
  - [ ] Hiển thị & chỉnh sửa thông tin
  - [ ] Upload avatar (Cloudinary)
  - [ ] Đổi mật khẩu
- [ ] Đăng xuất & redirect

---

## III. Giao diện theo Role
- [ ] `Admin Dashboard`
  - [ ] Quản lý user, thống kê tổng quan
- [ ] `Chủ trọ Dashboard`
  - [ ] Quản lý nhà trọ, phòng, hợp đồng, hóa đơn
- [ ] `Người thuê Dashboard`
  - [ ] Xem hợp đồng, hóa đơn, gửi phản ánh

---

## IV. Quản lý nhà trọ (Motel)
- [ ] Trang danh sách nhà trọ
- [ ] Form tạo / chỉnh sửa / xóa nhà trọ
- [ ] Upload hình ảnh + logo
- [ ] Nhúng Google Maps (địa chỉ nhà trọ)
- [ ] Hiển thị danh sách nhà trọ theo tài khoản chủ

---

## V. Quản lý phòng (Room)
- [ ] Trang danh sách phòng
- [ ] Thêm / sửa / xóa phòng
- [ ] Thông tin phòng: tên, diện tích, giá, trạng thái
- [ ] Upload ảnh phòng
- [ ] Ghi chú thiết bị (checkbox list hoặc tag)
- [ ] Filter phòng theo trạng thái (Trống / Đang thuê / Bảo trì)

---

## VI. Quản lý hợp đồng (Contract)
- [ ] Danh sách hợp đồng (table view)
- [ ] Tạo hợp đồng mới (form step-by-step)
- [ ] Upload / xem file PDF hợp đồng
- [ ] Hiển thị trạng thái, ngày hết hạn
- [ ] Cảnh báo hợp đồng sắp hết hạn (notification banner)

---

## VII. Quản lý hóa đơn (Billing)
- [ ] Trang danh sách hóa đơn
- [ ] Hiển thị chi tiết: tiền phòng, điện, nước, dịch vụ
- [ ] Filter theo tháng / năm
- [ ] Hiển thị trạng thái: Đã thanh toán / Chưa thanh toán
- [ ] Nút tải PDF hóa đơn
- [ ] Gửi mail / hiển thị thông báo hóa đơn mới

---

## VIII. Thanh toán (Payment)
- [ ] Tích hợp Momo / ZaloPay / VietQR UI (redirect hoặc QR modal)
- [ ] Xác nhận trạng thái thanh toán (callback + alert)
- [ ] Lịch sử thanh toán (người thuê xem lại)
- [ ] Giao diện xác nhận thanh toán thành công / thất bại

---

## IX. Phản ánh & Bảo trì (Feedback / Maintenance)
- [ ] Trang gửi phản ánh
  - [ ] Nhập tiêu đề, mô tả, upload ảnh
- [ ] Chủ trọ xem danh sách phản ánh
- [ ] Cập nhật trạng thái (Đang xử lý / Hoàn thành)
- [ ] Giao diện hiển thị timeline xử lý

---

## X. Thông báo (Notification System)
- [ ] Tạo context / hook `useNotification`
- [ ] Giao diện dropdown thông báo (bell icon)
- [ ] Hiển thị realtime notification (WebSocket / Firebase)
- [ ] Gửi thông báo email / push khi:
  - [ ] Hợp đồng sắp hết hạn
  - [ ] Hóa đơn mới
  - [ ] Phản ánh được xử lý

---

## XI. Báo cáo & Thống kê (Analytics)
- [ ] Trang thống kê cho chủ trọ:
  - [ ] Doanh thu theo tháng / năm
  - [ ] Tỉ lệ phòng trống
  - [ ] Lịch sử thanh toán
- [ ] Dùng biểu đồ (Recharts / Chart.js)
- [ ] Export Excel / PDF

---

## XII. Trải nghiệm người dùng (UX)
- [ ] Loading skeleton / spinner
- [ ] Toast notification (success / error)
- [ ] Modal xác nhận xóa
- [ ] Dark mode
- [ ] Responsive full mobile / tablet / desktop
- [ ] Animations (Framer Motion)

---

## XIII. Ưu tiên triển khai (Phase)
**Phase 1:** Auth + Dashboard + Motel + Room  
**Phase 2:** Contract + Billing + Payment  
**Phase 3:** Feedback + Notification + Analytics  

---