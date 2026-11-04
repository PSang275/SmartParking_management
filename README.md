# 🅿️ SmartPark — Hệ Thống Hỗ Trợ Quản Lý Bãi Xe, Vị Trí Đỗ & Quá Trình Xe Vào/Ra

> **Đồ án môn Công nghệ Phần mềm** — Đề tài: **Hệ Thống Hỗ Trợ Quản Lý Bãi Xe, Vị Trí Đỗ & Quá Trình Xe Vào/Ra (`SmartParking_management`)**

---

## 📋 Giới Thiệu

**SmartPark (`SmartParking_management`)** là ứng dụng web quản lý bãi đỗ xe thông minh toàn diện, hỗ trợ xuyên suốt quy trình từ kiểm tra sơ đồ chỗ trống thời gian thực, đăng ký phương tiện, đặt chỗ đỗ xe trực tuyến và cấp mã vé QR đến kiểm soát cổng xe vào/ra (QR Check-in / Check-out), tính phí đỗ xe tự động, xuất hóa đơn thanh toán, thống kê doanh thu và quản trị hệ thống với các vai trò người dùng được phân quyền chặt chẽ.

---

## 🛠️ Công Nghệ Sử Dụng

| Thành phần | Công nghệ |
| :--- | :--- |
| **Framework** | **ASP.NET Core 10.0 MVC** |
| **Ngôn ngữ** | **C#** (Microsoft Visual Studio 2026) |
| **Database** | **PostgreSQL (Supabase Cloud)** / In-Memory Seed (`DbInitializer` Local Fallback) |
| **Data Access** | `AppDbContext` (Supabase PostgREST API & `System.Text.Json`) |
| **Authentication** | Cookie / Session Role-based Authentication (`ADMIN`, `STAFF`, `CUSTOMER`) |
| **QR Engine** | `qrcode-generator` (Vector SVG QR Code chuẩn ISO/IEC 18004) |
| **UI / Frontend** | Razor Views (`.cshtml`), Modern CSS3 Glassmorphism, HTML5 Native `<dialog>`, Light/Dark Mode |

---

## 👥 Vai Trò Người Dùng

| Role | Mô tả | Giao diện |
| :--- | :--- | :--- |
| 🚗 **Khách gửi xe / Chủ phương tiện (Customer)** | Xem sơ đồ bãi xe trực quan (Khu A, B, C), lọc chỗ trống, đăng ký phương tiện, đặt chỗ online & nhận vé QR, xem lịch sử gửi xe | Trang chủ & Cổng đặt chỗ công khai |
| 📋 **Nhân viên trực cổng (Staff / Gate Operator)** | Quét/nhập mã QR xác nhận xe đặt trước vào bãi (`QR-BK-...`), tiếp nhận xe vãng lai (Walk-in) & cấp vé lượt (`QR-IN-...`) | Cổng kiểm soát QR Check-in / Out |
| 💰 **Thu ngân / Kế toán bãi xe (Cashier / Accountant)** | Tính phí đỗ xe tự động theo block 0.5h & phụ phí quá giờ 20%, xác nhận thanh toán (Tiền mặt / Chuyển khoản QR), xuất biên lai & báo cáo doanh thu | Phân hệ Tính phí & Hóa đơn (`/Invoice`) |
| 🔧 **Quản trị viên bãi xe (Admin)** | Quản lý khu vực đỗ (Khu A/B/C), thêm ô đỗ mới, khóa/mở bảo trì vị trí đỗ (`AVAILABLE` / `MAINTENANCE`), quản lý người dùng & cấu hình bảng giá | Admin Dashboard (`/Admin`, `/ParkingSlot`) |

---

## 🔐 Tài Khoản Test (Demo)

Mật khẩu mặc định cho tất cả tài khoản: **`123456`**

| Vai trò | Username | Email |
| :--- | :--- | :--- |
| **Admin (Team Lead)** | `PSang275` | `admin@smartpark.vn` |
| **Nhân viên vận hành 1 (PO)** | `vovietthang11-ops` | `staff.thang@smartpark.vn` |
| **Nhân viên vận hành 2 (SM)** | `Tiendat264` | `staff.dat@smartpark.vn` |
| **Thu ngân / Kế toán** | `cashier_smartpark` | `ketoan@smartpark.vn` |
| **Khách gửi xe 1 (Ô tô)** | `khachhang01` | `khachhang01@gmail.com` |
| **Khách gửi xe 2 (Xe máy)** | `khachhang02` | `khachhang02@gmail.com` |

---

## 📁 Cấu Trúc Dự Án

```text
SmartParking_management/
├── Controllers/
│   ├── HomeController.cs          # Trang chủ sơ đồ bãi xe trực quan & REST API
│   ├── AccountController.cs       # Đăng nhập, đăng ký, hồ sơ & phân quyền
│   ├── BookingController.cs       # Đặt chỗ đỗ xe online, cấp mã vé QR-BK
│   ├── ParkingSlotController.cs   # Quản lý danh mục vị trí đỗ & khu vực (Khu A, B, C)
│   ├── CheckInOutController.cs    # Cổng kiểm soát QR Check-in / Check-out & tính phí
│   ├── VehicleController.cs       # Đăng ký & quản lý hồ sơ phương tiện (Ô tô, Xe máy)
│   ├── InvoiceController.cs       # Lịch sử phiên gửi xe, biên lai & hóa đơn thanh toán
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
│   └── DbInitializer.cs           # Khởi tạo dữ liệu mẫu (Local Fallback & Seed Data)
├── Migrations/
│   └── 20261104093000_InitSmartParkSchema.sql
├── wwwroot/
│   ├── css/ (styles.css)
│   ├── js/ (app.js, qrcode.js)
│   └── uploads/qrcodes/           # Lưu trữ hình ảnh thẻ vé QR & biên lai điện tử
└── TestData/                      # Dữ liệu kiểm thử & kịch bản test (Sprint 1, 2, 3)
```

---

## 💻 Yêu Cầu Hệ Thống (Prerequisites)

- [.NET 10.0 SDK](https://dotnet.microsoft.com/download/dotnet/10.0) trở lên (hoặc **Microsoft Visual Studio 2026**)
- Cơ sở dữ liệu: **PostgreSQL (Supabase Cloud)** hoặc chế độ Local Fallback (`DbInitializer`)
- Git

---

## ⚙️ Cài Đặt & Chạy Ứng Dụng

### 1. Clone dự án
```bash
git clone https://github.com/PSang275/SmartParking_management.git
cd SmartParking_management
```

### 2. Cấu hình Database (Supabase Cloud & Bảo mật)
Ứng dụng hỗ trợ kết nối trực tiếp tới **PostgreSQL trên Supabase Cloud** (`jgvegymigpbgqmoylljf`) và tự động chuyển sang dữ liệu mẫu (`DbInitializer.cs`) nếu chạy offline. Có thể thiết lập khóa kết nối qua `dotnet user-secrets`:

```bash
dotnet user-secrets init
dotnet user-secrets set "Supabase:Url" "https://jgvegymigpbgqmoylljf.supabase.co"
dotnet user-secrets set "Supabase:AnonKey" "YOUR_SUPABASE_KEY_HERE"
```

Hoặc kiểm tra cấu hình trong `appsettings.json`:
```json
{
  "Supabase": {
    "ProjectId": "jgvegymigpbgqmoylljf",
    "Url": "https://jgvegymigpbgqmoylljf.supabase.co",
    "PublishableKey": "sb_publishable_-c02GBdEgwYvZwFPeRyOvQ_0GUUJ0uO"
  }
}
```

### 3. Khởi tạo Schema & Dữ liệu mẫu
Schema 6 bảng (`app_users`, `parking_zones`, `parking_slots`, `vehicles`, `bookings`, `parking_sessions`) được định nghĩa tại:
```text
Migrations/20261104093000_InitSmartParkSchema.sql
```

### 4. Chạy ứng dụng
```bash
dotnet run
```
Ứng dụng sẽ khởi chạy tại địa chỉ: **`http://localhost:5080`** (hoặc nhấn **F5** trực tiếp trong **Visual Studio 2026**).

---

## 📊 Tiến Độ Phát Triển (Sprint Summary)

### Sprint 1 (29/10/2026 – 05/11/2026) — Nền tảng, Sơ đồ Bãi xe & Quy trình Đặt chỗ / QR Cơ bản (Hoàn thành ✅ - 15 US / 49 SP)
> **Người phụ trách:** Leader **Nguyễn Phước Sang (`@PSang275`)**
- Khởi tạo CSDL PostgreSQL trên Supabase Cloud & kiến trúc ASP.NET Core 10.0 MVC (`US01`).
- Trang chủ Sơ đồ bãi xe trực quan theo Khu A/B/C, bộ lọc tìm kiếm nhanh và xem chi tiết ô đỗ & bảng giá (`US02`, `US03`, `US04`).
- Đăng ký phương tiện mới (Ô tô / Xe máy) và quản lý danh sách phương tiện (`US05`, `US06`).
- Đặt chỗ đỗ xe trực tuyến theo khung giờ và phát hành thẻ vé mã QR SVG `QR-BK-...` (`US07`, `US08`).
- Cổng kiểm soát QR Check-in cho xe đã đặt trước và xe vãng lai Walk-in `QR-IN-...` (`US09`, `US10`).
- Tính phí đỗ xe tự động theo block 0.5h (`FeeBreakdown.cs`), xác nhận thanh toán và giải phóng ô đỗ về `AVAILABLE` (`US11`, `US12`).
- Tra cứu lịch sử xe vào/ra, quản lý vị trí đỗ (thêm ô, khóa bảo trì `MAINTENANCE`) và Dashboard thống kê cơ bản (`US13`, `US14`, `US15`).

### Sprint 2 (06/11/2026 – 18/11/2026 - Tuần 10 & 11) — Tài khoản, Phân quyền & Vận hành Nâng cao (Đang thực hiện ⏳ - 10 US / 36 SP)
- Đăng ký, đăng nhập tài khoản xác thực Supabase Auth và phân quyền theo vai trò Khách / Nhân viên / Admin (`US16`, `US17`).
- Khách hàng hủy hoặc gia hạn thời gian đặt chỗ trực tuyến, xem lịch sử & hóa đơn cá nhân và nhận cảnh báo sắp hết giờ (`US18`, `US19`, `US20`).
- Nhân viên vận hành quét mã QR trực tiếp bằng Camera trình duyệt và in/xuất biên lai hóa đơn PDF (`US21`, `US24`).
- Quản trị viên cấu hình bảng giá linh hoạt (giá giờ, giá qua đêm, phụ phí), quản lý khu vực đỗ và lọc lịch sử nâng cao (`US22`, `US23`, `US25`).

### Sprint 3 (19/11/2026 – 27/11/2026 - Tuần 12 & Chuẩn bị Vấn đáp 28/11) — Báo cáo Thống kê, Kiểm thử & Triển khai (Kế hoạch 📋 - 8 US / 30 SP)
- Biểu đồ phân tích doanh thu & lưu lượng xe theo ngày/tháng bằng Chart.js và xuất báo cáo ra file Excel/CSV (`US26`, `US27`).
- Đăng ký gói gửi xe định kỳ theo tháng dành cho khách hàng thân thiết (`US28`).
- Xây dựng bộ kịch bản kiểm thử tự động & Test Cases toàn diện, tối ưu giao diện Responsive & Light/Dark Mode (`US30`, `US31`).
- Quản lý khóa/mở tài khoản người dùng, hoàn thiện báo cáo tổng kết và đóng gói Release phục vụ thi vấn đáp kết thúc học phần ngày **28/11/2026** (`US29`, `US32`, `US33`).

---

## 👥 Thành Viên Nhóm Phát Triển

| STT | Họ và Tên | GitHub Account | Vai trò (Role) | Phạm vi phụ trách |
| :---: | :--- | :--- | :--- | :--- |
| 1 | **Nguyễn Phước Sang** | [@PSang275](https://github.com/PSang275) | **Team Lead / Developer** | Phụ trách toàn bộ Sprint 1 (US01–US15), quản lý GitHub & Supabase |
| 2 | **Võ Việt Thắng** | [@vovietthang11-ops](https://github.com/vovietthang11-ops) | **Product Owner / Developer** | Quản lý Product Backlog, phát triển các US trong Sprint 2 & Sprint 3 |
| 3 | **Đoàn Tiến Đạt** | [@Tiendat264](https://github.com/Tiendat264) | **Scrum Master / Developer** | Điều phối quy trình Scrum, phát triển các US trong Sprint 2 & Sprint 3 |
