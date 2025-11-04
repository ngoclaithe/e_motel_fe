# E-Motel - Task 3: Giao diện & Route theo Role

## 1. Giao diện chính

### 1.1. Role: TENANT (Người thuê)
- **Trang chủ (Dashboard)**
  - Tổng quan hợp đồng, hóa đơn, phòng đang thuê
  - Thông báo nhắc nhở thanh toán, phản ánh mới
- **Hợp đồng của tôi**
  - Xem chi tiết hợp đồng, tải PDF
  - Cảnh báo sắp hết hạn
- **Hóa đơn**
  - Danh sách hóa đơn tháng
  - Thanh toán online
  - Trạng thái: Chưa thanh toán / Đã thanh toán
- **Phản ánh & bảo trì**
  - Tạo yêu cầu sửa chữa
  - Upload ảnh minh họa
  - Theo dõi trạng thái: Đang xử lý / Hoàn thành
- **Hồ sơ cá nhân**
  - Thông tin cá nhân, CCCD, số điện thoại
  - Avatar, đổi mật khẩu
- **Thông báo**
  - Realtime notification qua app/web/email

---

### 1.2. Role: LANDLORD (Chủ trọ)
- **Trang chủ (Dashboard)**
  - Thống kê doanh thu, tỉ lệ phòng trống, hợp đồng sắp hết hạn
  - Thông báo phản ánh mới
- **Quản lý nhà trọ**
  - Tạo / sửa / xóa nhà trọ
  - Quản lý nhiều nhà trọ trên cùng tài khoản
  - Thông tin chi tiết: tên, địa chỉ, số phòng, mô tả, logo, hình ảnh, vị trí bản đồ
- **Quản lý phòng**
  - Danh sách phòng theo nhà trọ
  - Trạng thái phòng: Trống / Đang thuê / Bảo trì
  - Ghi chú thiết bị, tải hình ảnh
- **Quản lý hợp đồng**
  - Tạo hợp đồng với người thuê
  - Thông tin hợp đồng: ngày bắt đầu, thời hạn, tiền cọc, kỳ thanh toán
  - Đính kèm file PDF hợp đồng
  - Cảnh báo sắp hết hạn hợp đồng
- **Quản lý hóa đơn**
  - Tạo và chỉnh sửa hóa đơn hàng tháng
  - Ghi điện nước, tổng tiền
  - Xuất PDF / gửi mail thông báo
  - Trạng thái thanh toán
- **Phản ánh & bảo trì**
  - Nhận và cập nhật trạng thái yêu cầu sửa chữa
  - Upload ảnh minh họa
- **Hồ sơ cá nhân**
  - Thông tin cá nhân, avatar, đổi mật khẩu
- **Thông báo**
  - Realtime notification qua app/web/email

---

### 1.3. Role: ADMIN (Quản trị hệ thống)
- **Dashboard**
  - Thống kê tổng quan hệ thống: số nhà trọ, số phòng, số hợp đồng, doanh thu
  - Báo cáo & thống kê
- **Quản lý người dùng**
  - Danh sách chủ trọ, người thuê
  - Tạo / chỉnh sửa / xóa tài khoản
  - Phân quyền: Admin / Landlord / Tenant
- **Quản lý nhà trọ & phòng**
  - Xem danh sách tất cả nhà trọ và phòng
  - Chỉnh sửa, xóa (nếu cần)
- **Báo cáo & thống kê**
  - Doanh thu từng tháng / năm
  - Tỉ lệ phòng trống
  - Lịch sử thanh toán
  - Xuất Excel / PDF
- **Thông báo**
  - Quản lý hệ thống thông báo đến người dùng

---

## 2. Route API & Frontend theo Role

| Route | Method | TENANT | LANDLORD | ADMIN | Mô tả |
|-------|--------|--------|----------|-------|-------|
| `/auth/register` | POST | ✅ | ✅ | ❌ | Đăng ký tài khoản |
| `/auth/login` | POST | ✅ | ✅ | ✅ | Đăng nhập |
| `/auth/logout` | POST | ✅ | ✅ | ✅ | Đăng xuất |
| `/auth/forgot-password` | POST | ✅ | ✅ | ❌ | Quên mật khẩu |
| `/profile` | GET / PUT | ✅ | ✅ | ✅ | Xem / cập nhật hồ sơ |
| `/motels` | GET | ❌ | ✅ | ✅ | Danh sách nhà trọ |
| `/motels` | POST | ❌ | ✅ | ✅ | Tạo nhà trọ mới |
| `/motels/:id` | PUT / DELETE | ❌ | ✅ | ✅ | Sửa / xóa nhà trọ |
| `/rooms` | GET | ✅ (chỉ phòng đang thuê) | ✅ | ✅ | Danh sách phòng |
| `/rooms` | POST | ❌ | ✅ | ✅ | Tạo phòng mới |
| `/rooms/:id` | PUT / DELETE | ❌ | ✅ | ✅ | Chỉnh sửa / xóa phòng |
| `/contracts` | GET | ✅ (hợp đồng của mình) | ✅ (theo nhà trọ) | ✅ | Xem hợp đồng |
| `/contracts` | POST | ❌ | ✅ | ✅ | Tạo hợp đồng |
| `/contracts/:id` | PUT / DELETE | ❌ | ✅ | ✅ | Chỉnh sửa / xóa hợp đồng |
| `/bills` | GET | ✅ (hóa đơn của mình) | ✅ (theo nhà trọ) | ✅ | Xem hóa đơn |
| `/bills/:id/pay` | POST | ✅ | ❌ | ❌ | Thanh toán hóa đơn |
| `/feedbacks` | GET | ✅ (của mình) | ✅ (nhận yêu cầu) | ✅ | Danh sách phản ánh |
| `/feedbacks` | POST | ✅ | ❌ | ❌ | Gửi phản ánh |
| `/feedbacks/:id` | PUT | ❌ | ✅ | ✅ | Cập nhật trạng thái |
| `/notifications` | GET | ✅ | ✅ | ✅ | Xem thông báo |
| `/reports` | GET | ❌ | ✅ (nhà trọ) | ✅ (toàn hệ thống) | Báo cáo & thống kê |

