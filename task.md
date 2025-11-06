Task 2: Bổ sung Service user.ts và cập nhật form tạo hợp đồng
Mục tiêu

Tạo service user.ts gọi các endpoint của UserController (tiền tố /api/v1).

Thay đổi form tạo hợp đồng: nhập Số điện thoại người thuê thay vì email, gọi API tìm tenant theo số điện thoại và lấy tenantId.

1. Tạo file service

Đường dẫn:
e_motel_fe/lib/services/user.ts

Yêu cầu:

Tất cả request tới API có tiền tố /api/v1.

Gửi header Authorization: Bearer <access_token> cho các endpoint yêu cầu xác thực.

Các hàm nên viết dạng async trả về data.

Danh sách hàm đề xuất:

export async function getAllUsers(): Promise<any> {}
export async function getLandlords(): Promise<any> {}
export async function getTenants(): Promise<any> {}
export async function getProfile(): Promise<any> {}
export async function searchByPhone(phone: string): Promise<any> {}
export async function getUserById(id: string): Promise<any> {}
export async function updateUser(id: string, payload: any): Promise<any> {}
export async function deleteUser(id: string): Promise<any> {}

2. Danh sách endpoint
Phương thức	Endpoint	Quyền	Chức năng
GET	/api/v1/users	ADMIN	Lấy danh sách tất cả user
GET	/api/v1/users/landlords	ADMIN	Lấy danh sách landlords
GET	/api/v1/users/tenants	ADMIN, LANDLORD	Lấy danh sách tenants
GET	/api/v1/users/profile	AUTH (JWT)	Lấy profile người dùng hiện tại
GET	/api/v1/users/search/phone?phone={phone}	ADMIN, LANDLORD	Tìm user theo số điện thoại
GET	/api/v1/users/:id	AUTH (JWT)	Lấy chi tiết user theo id
PUT	/api/v1/users/:id	AUTH (JWT)	Cập nhật user
DELETE	/api/v1/users/:id	ADMIN	Xóa user
3. Cập nhật form tạo hợp đồng

Vị trí file:
e_motel_fe/app/(dashboard)/contracts/create/page.tsx

Thay đổi:

Input Email người thuê → Số điện thoại người thuê.

Khi người dùng nhập số điện thoại, gọi:

GET /api/v1/users/search/phone?phone={phone}


qua userService.searchByPhone(phone).

Luồng xử lý:

Người dùng nhập số điện thoại.

Gọi API tìm người thuê.

Nếu tìm thấy → hiển thị thông tin, gán tenantId.

Nếu không thấy → hiển thị thông báo lỗi.

Payload mẫu khi tạo hợp đồng:

{
  "roomId": "c8b42e17-97a9-4dc2-8e2d-98d3e4a41a55",
  "tenantId": "e5a713d1-1ac4-4f9b-9d79-67c3d3c1b210",
  "startDate": "2025-11-10T00:00:00.000Z",
  "endDate": "2026-11-10T00:00:00.000Z",
  "deposit": 2500000,
  "paymentCycle": 1,
  "documentUrl": "https://example.com/contract.pdf"
}

4. UI / UX đề xuất

Hiển thị spinner khi đang tìm kiếm.

Validate định dạng số điện thoại.

Nếu tìm thấy → hiển thị “Chọn người thuê này”.

Nếu không → hiển thị “Không tìm thấy người thuê”.