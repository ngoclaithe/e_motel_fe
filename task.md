# 🧾 Task 3 - Sửa lại trang tạo hợp đồng của Landlord

---

## **Mục tiêu**
Cập nhật trang **tạo hợp đồng (Create Contract)** trên FE **Next.js + TypeScript** sao cho người cho thuê (landlord) có thể tạo hợp đồng thuê **phòng (ROOM)** hoặc **nhà trọ (MOTEL)** tương ứng với cấu trúc dữ liệu backend cung cấp.

---

## **1. Logic phân loại hợp đồng**

- Khi người dùng chọn **loại hợp đồng**, form sẽ hiển thị các trường tương ứng:
  - Nếu chọn **ROOM**: hiển thị `roomId`, ẩn `motelId`
  - Nếu chọn **MOTEL**: hiển thị `motelId`, ẩn `roomId`

---

## **2. Cấu trúc dữ liệu gửi lên API**

### 🏠 Hợp đồng thuê PHÒNG (ROOM)

```json
{
  "type": "ROOM",
  "roomId": "uuid-room",
  "tenantId": "uuid-tenant",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "monthlyRent": 3000000,
  "deposit": 6000000,
  "paymentCycleMonths": 1,
  "paymentDay": 5,
  "depositMonths": 2,
  "maxOccupants": 2,
  "specialTerms": "optional",
  "electricityCostPerKwh": 3500,
  "waterCostPerCubicMeter": 15000,
  "internetCost": 100000,
  "parkingCost": 150000,
  "serviceFee": 50000
}
```

### 🏢 Hợp đồng thuê CẢ NHÀ TRỌ (MOTEL)

```json
{
  "type": "MOTEL",
  "motelId": "uuid-motel",
  "tenantId": "uuid-tenant",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "monthlyRent": 50000000,
  "deposit": 100000000,
  "paymentCycleMonths": 3,
  "paymentDay": 1,
  "depositMonths": 2,
  "electricityCostPerKwh": 3000,
  "waterCostPerCubicMeter": 12000,
  "internetCost": 200000,
  "parkingCost": 100000,
  "serviceFee": 500000,
  "specialTerms": "optional"
}
```

---

## **3. Các trường bắt buộc**

| Trường | Bắt buộc | Ghi chú |
|--------|-----------|----------|
| type | ✅ | ROOM hoặc MOTEL |
| roomId | ✅ khi type=ROOM | UUID phòng |
| motelId | ✅ khi type=MOTEL | UUID nhà trọ |
| tenantId | ✅ | Người thuê |
| startDate / endDate | ✅ | Ngày bắt đầu / kết thúc |
| monthlyRent | ✅ | Giá thuê/tháng |
| deposit | ✅ | Tiền cọc |

---
Đây là response khi tạo thành công hợp đồng room nhé
{
    "type": "ROOM",
    "startDate": "2025-11-01T00:00:00.000Z",
    "endDate": "2026-10-31T00:00:00.000Z",
    "monthlyRent": 3000000,
    "deposit": 6000000,
    "paymentCycleMonths": 1,
    "paymentDay": 5,
    "depositMonths": 2,
    "electricityCostPerKwh": 4000,
    "waterCostPerCubicMeter": 25000,
    "internetCost": 100000,
    "parkingCost": 50000,
    "serviceFee": 100000,
    "hasWifi": true,
    "hasParking": true,
    "maxOccupants": 2,
    "status": "ACTIVE",
    "specialTerms": "Khách được miễn phí tháng đầu tiên.",
    "regulations": "",
    "roomId": "c8dcfc6b-8c80-49df-a3de-1f7da863af56",
    "motelId": null,
    "tenantId": "357c6be6-2194-4a44-a5ad-76de13af6fb9",
    "documentContent": "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập – Tự do – Hạnh phúc\n────────────────\n\nHỢP ĐỒNG THUÊ PHÒNG TRỌ\n\nHôm nay, ngày 7 tháng 11 năm 2025, tại 43 Trung Kính Hà Nội\n\nChúng tôi ký tên dưới đây gồm có:\n\nBÊN CHO THUÊ PHÒNG TRỌ (gọi tắt là Bên A):\nÔng/Bà: Lai Ngoc\nCMND/CCCD số: ................................\nCấp ngày: ..........................\nNơi cấp: ................................\nThường trú tại: 43 Trung Kính Hà Nội\nSố điện thoại: 0956236269\n\nBÊN THUÊ PHÒNG TRỌ (gọi tắt là Bên B):\nÔng/Bà: Lai Ngoc\nCMND/CCCD số: ................................\nCấp ngày: ..........................\nNơi cấp: ................................\nThường trú tại: ................................\nSố điện thoại: 0905123456\n\nSau khi thỏa thuận, hai bên thống nhất như sau:\n\n1. NỘI DUNG THUÊ PHÒNG TRỌ\n\nBên A đồng ý cho Bên B thuê 01 phòng trọ số A101 tại 43 Trung Kính, địa chỉ: 43 Trung Kính Hà Nội.\n\n- Diện tích phòng: 25m²\n\n- Thời hạn thuê: 12 tháng (từ ngày 01/11/2025 đến ngày 31/10/2026)\n- Giá thuê: 3.000.000 đồng/tháng (Bằng chữ: 3.000.000 đồng)\n- Tiền đặt cọc: 6.000.000 đồng (Bằng chữ: 6.000.000 đồng)\n- Chu kỳ thanh toán: 1 tháng, thanh toán vào ngày 5 hàng tháng\n\n2. CÁC KHOẢN PHÍ DỊCH VỤ\n\nĐiện sinh hoạt: 4.000 đồng/kWh; Nước: 25.000 đồng/m³; Internet/Wifi: 100.000 đồng/tháng; Gửi xe: 50.000 đồng/tháng; Phí dịch vụ (rác, vệ sinh): 100.000 đồng/tháng\n\n3. TRÁCH NHIỆM BÊN A (Bên cho thuê)\n\n- Đảm bảo căn phòng cho thuê không có tranh chấp, khiếu kiện.\n- Đăng ký với chính quyền địa phương về thủ tục cho thuê phòng trọ.\n- Cung cấp đầy đủ các dịch vụ đã cam kết trong hợp đồng.\n- Thông báo trước ít nhất 30 ngày nếu có thay đổi về giá dịch vụ hoặc nội quy.\n- Bảo đảm các thiết bị chung (hành lang, nhà vệ sinh chung nếu có...) hoạt động bình thường.\n\n4. TRÁCH NHIỆM BÊN B (Bên thuê)\n\n- Thanh toán tiền thuê phòng đầy đủ, đúng hạn vào ngày 5 hàng tháng.\n- Đặt cọc với số tiền 6.000.000 đồng khi ký hợp đồng. Số tiền này sẽ được hoàn trả khi kết thúc hợp đồng nếu không có vi phạm và các thiết bị trong phòng còn nguyên vẹn.\n- Đảm bảo bảo quản các thiết bị trong phòng. Nếu có hư hỏng do lỗi người sử dụng, Bên B phải sửa chữa hoặc bồi thường theo giá thị trường.\n- Chỉ sử dụng phòng trọ vào mục đích ở với số lượng tối đa không quá 2 người (kể cả trẻ em).\n- Không chứa, tàng trữ các chất cháy nổ, hàng cấm, chất gây nghiện.\n- Cung cấp giấy tờ tùy thân để đăng ký tạm trú theo quy định pháp luật.\n- Giữ gìn an ninh trật tự, vệ sinh chung, nếp sống văn hóa đô thị.\n- Không tụ tập đánh bạc, sử dụng ma túy, mại dâm hoặc các hành vi vi phạm pháp luật khác.\n- Không được tự ý cải tạo kết cấu phòng hoặc trang trí ảnh hưởng đến tường, cột, nền. Nếu có nhu cầu phải trao đổi và được Bên A đồng ý bằng văn bản.\n- Được phép nấu ăn trong phòng nhưng phải đảm bảo vệ sinh và an toàn phòng cháy chữa cháy.\n- Được phép nuôi thú cưng nhưng phải đảm bảo vệ sinh và không gây ảnh hưởng đến người khác.\n\n5. NỘI QUY VÀ QUY ĐỊNH KHÁC\n\nTuân thủ nội quy chung của khu nhà trọ và quy định của pháp luật.\n\n\n6. ĐIỀU KHOẢN ĐẶC BIỆT\n\nKhách được miễn phí tháng đầu tiên.\n\n\n7. ĐIỀU KHOẢN THỰC HIỆN\n\n- Hai bên cam kết thực hiện đúng các điều khoản đã thỏa thuận.\n- Nếu một trong hai bên muốn chấm dứt hợp đồng trước thời hạn phải báo trước cho bên kia ít nhất 30 ngày.\n- Nếu Bên B vi phạm hợp đồng (nợ tiền thuê quá 2 tháng, vi phạm nội quy nghiêm trọng...), Bên A có quyền đơn phương chấm dứt hợp đồng và không hoàn trả tiền đặt cọc.\n- Mọi tranh chấp phát sinh sẽ được hai bên giải quyết trên tinh thần thiện chí, hòa giải. Nếu không thỏa thuận được sẽ đưa ra cơ quan chức năng giải quyết theo pháp luật.\n- Hợp đồng có hiệu lực kể từ ngày ký.\n- Hợp đồng được lập thành 02 bản, mỗi bên giữ 01 bản có giá trị pháp lý như nhau.\n\n────────────────\n\nĐẠI DIỆN BÊN A                                    ĐẠI DIỆN BÊN B\n(Ký, ghi rõ họ tên)                              (Ký, ghi rõ họ tên)\n\n\n\n\nLai Ngoc                                             Lai Ngoc\n\n────────────────\nHợp đồng được tạo tự động ngày 07/11/2025",
    "documentUrl": null,
    "id": "f014a4fd-e794-4b4f-9bb2-9cd6d6a67425",
    "createdAt": "2025-11-07T04:19:17.745Z",
    "updatedAt": "2025-11-07T04:19:17.745Z"
}

## **4. Form FE đề xuất**

### 🔹 Bước 1: Chọn loại hợp đồng
```tsx
<Select onValueChange={(v) => setType(v)}>
  <SelectItem value="ROOM">Thuê phòng</SelectItem>
  <SelectItem value="MOTEL">Thuê cả nhà trọ</SelectItem>
</Select>
```

### 🔹 Bước 2: Hiển thị form động
```tsx
{type === "ROOM" ? (
  <RoomContractForm />
) : (
  <MotelContractForm />
)}
```

Mỗi form con (`RoomContractForm` / `MotelContractForm`) có các field riêng biệt tương ứng.

---

## **5. API kết nối**
- **Endpoint**: `POST /api/v1/contracts`
- **Header**: `Authorization: Bearer <token>`
- **Body**: Theo schema ở trên
- **Response**: Trả về hợp đồng vừa tạo

---

## **6. Yêu cầu bổ sung**
- Validate dữ liệu trước khi gửi.
- Hiển thị loading + thông báo thành công / lỗi.
- Sau khi tạo xong hợp đồng, điều hướng sang trang chi tiết hợp đồng (`/landlord/contracts/[id]`).

---

## ✅ **Kết quả mong đợi**
Trang “Tạo hợp đồng” cho phép landlord:
- Chọn loại hợp đồng (ROOM / MOTEL)
- Tự động hiển thị trường tương ứng
- Gửi đúng payload cho backend
- Tạo hợp đồng thành công với các giá trị optional được bỏ qua nếu không nhập.


