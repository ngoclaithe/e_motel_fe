# Task: Cập nhật giao diện và service quản lý phòng trong E-Motel FE

---

## 1. Cập nhật trang **Profile Page**
- **Bỏ hoàn toàn mục "Thao tác"** khỏi giao diện trang Profile.
- **Xóa button "Đăng xuất"** nằm trong mục "Thao tác" (nếu có hiển thị riêng, ẩn hoặc remove khỏi DOM luôn).

---

## 2. Cập nhật **Header**
- **Loại bỏ nút chuyển đổi theme sáng/tối** khỏi phần header (ẩn hoặc xóa hẳn component switch theme).

---

## 3. Cập nhật **Service gọi API phòng (rooms.ts)**

File: `e_motel_fe/lib/services/rooms.ts`

Sửa lại các hàm để gọi đúng endpoint từ backend theo bảng sau:

| Chức năng | Phương thức | Endpoint | Yêu cầu đăng nhập |
|------------|-------------|-----------|-------------------|
| Xem tất cả phòng | GET | `/rooms` | Không |
| Xem phòng trống | GET | `/rooms/vacant` | Không |
| Xem phòng độc lập (không thuộc motel) | GET | `/rooms/standalone` | Không |
| Xem phòng theo nhà trọ | GET | `/rooms/motel/:motelId` | Không |
| Xem chi tiết 1 phòng | GET | `/rooms/:id` | Không |
| Tạo phòng mới | POST | `/rooms` | Có |
| Xem tất cả phòng trong nhà trọ của tôi | GET | `/rooms/my-rooms` | Có |
| Cập nhật thông tin phòng | PUT | `/rooms/:id` | Có |
| Cập nhật trạng thái phòng | PUT | `/rooms/:id/status` | Có |
| Xóa phòng | DELETE | `/rooms/:id` | Có |

> **Lưu ý:**
> - Tất cả các request cần đăng nhập phải gửi kèm **accessToken** (qua header Authorization).
> - Dữ liệu phòng trong page `/rooms` phải **lấy từ service thật**, không dùng localStorage hay mock data trong trình duyệt.

---

## 4. Cập nhật trang **/rooms**
- Xóa mọi phần code lưu phòng tạm trong localStorage, Zustand hoặc state mock.
- Dùng các hàm trong `rooms.ts` để fetch dữ liệu thực từ backend.
- Đảm bảo:
  - Render danh sách phòng từ API `/rooms` (public view).
  - Khi user đăng nhập là landlord/admin, trang có thể hiển thị danh sách phòng từ `/rooms/my-rooms`.

---
