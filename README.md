# 🅿️ SmartParking_management — Hệ Thống Hỗ Trợ Quản Lý Bãi Xe, Vị Trí Đỗ & Quá Trình Xe Vào/Ra (MVC)

> **Đồ án môn học:** Công nghệ Phần mềm (HUFLIT)  
> **Kiến trúc & Công nghệ:** **ASP.NET Core MVC (C#)** trên **Microsoft Visual Studio 2026**  
> **Cơ sở dữ liệu đám mây:** **Supabase Cloud PostgreSQL** (`https://jgvegymigpbgqmoylljf.supabase.co`)  
> **Quy mô nhóm:** 3 Thành viên cùng cộng tác qua Git / GitHub (`SmartParking_management`)

---

## 📁 Cấu Trúc Dự Án (Chuẩn Mô Hình MVC)

```text
SmartParking_management/
├── Controllers/
│   ├── HomeController.cs          # Trang chủ, sơ đồ bãi xe trực quan & REST API
│   ├── AccountController.cs       # Đăng nhập, đăng ký, hồ sơ phân quyền
│   ├── BookingController.cs       # Đặt chỗ đỗ xe online, xuất thẻ vé QR
│   ├── ParkingSlotController.cs   # Quản lý vị trí đỗ & khu vực (Khu A, B, C)
│   ├── CheckInOutController.cs    # Quét mã QR xe vào/ra & tính phí tự động
│   ├── VehicleController.cs       # Đăng ký & quản lý phương tiện (ô tô, xe máy)
│   ├── InvoiceController.cs       # Lịch sử phiên gửi xe & hóa đơn thanh toán
│   └── AdminController.cs         # Dashboard thống kê doanh thu & công suất bãi xe
├── Models/
│   ├── User.cs / Vehicle.cs
│   ├── ParkingZone.cs / ParkingSlot.cs
│   ├── Booking.cs / ParkingSession.cs / FeeBreakdown.cs
│   └── ViewModels/
│       └── SmartParkingViewModel.cs
├── Views/
│   ├── Shared/ (_Layout.cshtml)
│   ├── Home/ (Index.cshtml, _LiveMapPartial.cshtml)
│   ├── Account/ (Login.cshtml, Register.cshtml, Profile.cshtml)
│   ├── Booking/ (Book.cshtml, MyBookings.cshtml)
│   ├── ParkingSlot/ (Index.cshtml)
│   ├── CheckInOut/ (Index.cshtml)
│   ├── Vehicle/ (Index.cshtml)
│   ├── Invoice/ (Index.cshtml)
│   └── Admin/ (Index.cshtml)
├── Data/
│   ├── AppDbContext.cs            # Kết nối trực tiếp Supabase Cloud PostgreSQL
│   └── DbInitializer.cs           # Dữ liệu khởi tạo mặc định (Seed Data)
├── Migrations/
│   └── 20261104093000_InitSmartParkSchema.sql
├── wwwroot/
│   ├── css/ (styles.css)
│   ├── js/ (app.js, qrcode.js)
│   └── uploads/qrcodes/           # Lưu trữ hình ảnh vé QR & hóa đơn
└── TestData/                      # Dữ liệu kiểm thử & kịch bản test Sprint 1, 2, 3
```

---

## 🌟 Các Chức Năng Cốt Lõi (8 Phân Hệ MVC)

1. **🗺️ Kiểm tra chỗ trống trực quan (`HomeController`):**
   - Hiển thị sơ đồ bãi xe thời gian thực theo 3 khu vực (**Khu A — Ô tô tầng hầm B1**, **Khu B — Xe máy sảnh chính**, **Khu C — Ô tô VIP ngoài trời**).
   - Mã hóa màu sắc trực quan: `AVAILABLE` (Xanh lá - Trống), `RESERVED` (Cam - Đã đặt trước), `OCCUPIED` (Đỏ - Đang có xe), `MAINTENANCE` (Xám - Bảo trì).
2. **📅 Đặt chỗ trước trực tuyến (`BookingController`):**
   - Chọn phương tiện, chọn ô đỗ trống, khung giờ dự kiến đến và rời bãi.
   - Tự động ước tính chi phí đỗ xe qua `Models/FeeBreakdown.cs` và sinh thẻ vé **QR Code (`QR-BK-...`)** định dạng Vector SVG.
3. **📷 QR Check-in / Check-out (`CheckInOutController`):**
   - **Check-in từ phiếu đặt trước:** Quét/chọn mã `QR-BK-...` → chuyển trạng thái phiếu sang `CHECKED_IN`, khóa ô đỗ `OCCUPIED` và mở phiên gửi xe `ACTIVE`.
   - **Check-in khách vãng lai (Walk-in):** Nhập biển số xe → cấp vé lượt `QR-IN-...` và gán ô đỗ trống tự động.
   - **Check-out & Giải phóng ô:** Quét mã `QR-IN-...` hoặc chọn xe đang đỗ → tính phí tự động, xuất hóa đơn chi tiết và giải phóng ô về `AVAILABLE`.
4. **🧮 Tính phí đỗ xe tự động (`Models/FeeBreakdown.cs`):**
   - Áp dụng đơn giá theo khu vực (`20.000đ/h` Khu A, `5.000đ/h` Khu B, `25.000đ/h` Khu C).
   - Làm tròn theo block `0.5 giờ` (tối thiểu `1.0 giờ`), tự động cộng phụ phí `20%` nếu vượt quá thời gian đặt trước.
5. **🚗 Đăng ký phương tiện (`VehicleController`):**
   - Thêm mới, tra cứu và xóa phương tiện (`license_plate`, `vehicle_type`, `brand`, `color`, `owner_name`) lưu trực tiếp trên Supabase.
6. **🅿️ Quản lý vị trí đỗ & Khu vực (`ParkingSlotController`):**
   - Thêm ô đỗ mới vào từng khu vực, chuyển đổi nhanh trạng thái `AVAILABLE` ↔ `MAINTENANCE`.
7. **📜 Lịch sử vào/ra & Hóa đơn (`InvoiceController`):**
   - Tra cứu toàn bộ lịch sử phiên gửi xe, lọc theo trạng thái (`ACTIVE` / `COMPLETED`), xem lại biên lai QR.
8. **📊 Dashboard Thống kê (`AdminController`):**
   - Tổng hợp doanh thu thực tế, tỷ lệ lấp đầy theo từng khu vực A/B/C và phân bổ trạng thái ô đỗ.

---

## ☁️ Thông Tin Kết Nối Supabase Cloud (Dành Cho 3 Thành Viên)

- **Project Name:** `SmartPark-DB`
- **Project ID:** `jgvegymigpbgqmoylljf`
- **Project URL:** `https://jgvegymigpbgqmoylljf.supabase.co`
- **Publishable Key:** `sb_publishable_-c02GBdEgwYvZwFPeRyOvQ_0GUUJ0uO`
- **6 Bảng dữ liệu đã tạo & nạp sẵn Seed Data:** `app_users`, `vehicles`, `parking_zones`, `parking_slots`, `bookings`, `parking_sessions`.

---

## 🚀 Hướng Dẫn Chạy Đồ Án Trên Visual Studio 2026

1. Mở file [`SmartParking_management.sln`](./SmartParking_management.sln) bằng **Microsoft Visual Studio 2026**.
2. Nhấn **F5** (hoặc nút **▶ SmartParking_management (HTTP)** trên thanh công cụ).
3. Visual Studio sẽ tự động build ứng dụng **ASP.NET Core MVC** và mở trình duyệt tại `http://localhost:5080`.
4. Ngoài ra có thể nhấp đúp trực tiếp vào [`run_web_demo.bat`](./run_web_demo.bat) để khởi chạy nhanh.

---

## 👥 Phân Chia Công Việc Nhóm 3 Thành Viên

| STT | Họ và Tên | GitHub Account | Vai trò (Role) | Ngày tham gia |
|---|---|---|---|---|
| 1 | **Nguyễn Phước Sang** | [@PSang275](https://github.com/PSang275) | Dev / Team Lead | 05/11/2026 |
| 2 | **Võ Việt Thắng** | [@vovietthang11-ops](https://github.com/vovietthang11-ops) | Dev / Product Owner | 05/11/2026 |
| 3 | **Đoàn Tiến Đạt** | [@Tiendat264](https://github.com/Tiendat264) | Dev / Scrum Master | 05/11/2026 |

- **Sprint 1** (`PSang275`): toàn bộ chức năng cơ bản US01–US15.
- **Sprint 2 & 3** (`vovietthang11-ops`, `Tiendat264`): các chức năng còn lại theo file Excel phân chia công việc.
