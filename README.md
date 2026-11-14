# 🅿️ SmartPark — Hệ Thống Hỗ Trợ Quản Lý Bãi Xe, Vị Trí Đỗ & Quá Trình Xe Vào/Ra

> **Đồ án môn Công nghệ Phần mềm** — Đề tài: **Hệ Thống Hỗ Trợ Quản Lý Bãi Xe, Vị Trí Đỗ & Quá Trình Xe Vào/Ra (`SmartParking_management`)**

---

## 📋 Giới Thiệu

**SmartPark (`SmartParking_management`)** là hệ thống web thương mại hỗ trợ quản lý bãi đỗ xe thông minh & trạm sạc xe điện quy mô **150 chỗ đỗ** chia làm **4 phân khu** (`ZONE EV` — Khu Chuyên biệt Xe Điện 37 chỗ, `ZONE NT` — Khu Ngoài Trời 65 chỗ, `ZONE TH` — Tầng Hầm B1 40 chỗ chỉ nhận xe xăng theo quy định PCCC, và `ZONE VIP` — Khu VIP Mái Che 8 chỗ).

Hệ thống số hóa quy trình từ tra cứu sơ đồ chỗ trống thời gian thực, lọc vị trí đỗ theo khu vực/loại phương tiện (kèm khóa an toàn PCCC với xe điện tại tầng hầm), xem bảng giá theo giờ & gói vé tháng cố định chỗ, đăng ký/đăng nhập phân quyền 6 vai trò, đặt lịch trước & xuất vé QR đến kiểm soát cổng vào/ra (QR Check-in / Check-out), tính phí tự động và thống kê doanh thu.

---

## 🛠️ Công Nghệ Sử Dụng

| Thành phần | Công nghệ |
| :--- | :--- |
| **Framework** | **ASP.NET Core MVC (.NET 8.0 / 9.0 / 10.0 — hỗ trợ từ .NET 10.0 trở xuống)** |
| **Ngôn ngữ** | **C#** (Microsoft Visual Studio 2022 / 2026) |
| **Database** | **PostgreSQL (Supabase Cloud)** / In-Memory Seed (`DbInitializer` Local Fallback) |
| **Data Access** | `AppDbContext` (Supabase PostgREST API & `System.Text.Json`) |
| **Authentication** | Xác thực theo Tên đăng nhập & Phân quyền 6 vai trò (`ADMIN`, `MANAGER`, `GATE_STAFF`, `ACCOUNTANT`, `TECHNICIAN`, `CUSTOMER`) |
| **UI / Frontend** | Razor Views (`.cshtml`), HTML5, CSS3 (Minimalist SaaS phối Xanh dương Navy – Trắng – Đen), JavaScript (ES6+), Lucide Icons |

---

## 👥 Vai Trò Người Dùng (6 Roles)

| Vai trò | Mã Role | Mô tả chức năng nghiệp vụ |
| :--- | :--- | :--- |
| **Quản trị viên hệ thống** | `ADMIN` | Quản trị toàn bộ hệ thống, phân quyền tài khoản nhân sự & khách hàng, cấu hình phân khu và thông số vận hành toàn bãi |
| **Quản lý ca / Điều hành** | `MANAGER` | Giám sát công suất lấp đầy 150 ô đỗ theo thời gian thực, điều phối phân khu (`EV`, `NT`, `TH`, `VIP`), xử lý tình huống quá giờ hoặc sự cố tại bãi |
| **Nhân viên trực cổng** | `GATE_STAFF` | Kiểm soát cổng vào/ra, quét mã vé QR đặt trước để Check-in, ghi nhận xe vãng lai, thực hiện Check-out và xác nhận thu phí tại cổng |
| **Kế toán / Thu ngân** | `ACCOUNTANT` | Đối soát doanh thu gửi xe theo giờ, phí sạc điện (`4.500đ/kWh`), phụ phí chiếm trụ sạc & gói vé tháng; xuất hóa đơn và báo cáo tài chính |
| **Kỹ thuật viên & An toàn PCCC** | `TECHNICIAN` | Kiểm tra, bảo trì 12 trụ sạc VinFast tại `Zone EV`, khóa/mở bảo trì ô đỗ hư hỏng và giám sát quy định an toàn PCCC tại Tầng hầm B1 |
| **Khách hàng gửi xe** | `CUSTOMER` | Xem sơ đồ 150 chỗ trống trực quan, lọc theo khu vực/loại xe, tra cứu bảng giá, quản lý phương tiện cá nhân, đặt chỗ trước & nhận vé QR |

---

## 🔐 Tài Khoản Test (Demo Kiểm Thử Nhanh)

Trên trang Đăng nhập (`/Account/Login`), hệ thống tích hợp sẵn **6 nút chọn nhanh tài khoản mẫu** tương ứng với 6 vai trò.
Mật khẩu mặc định chung cho tất cả tài khoản mẫu: **`123456`**

| Vai trò | Tên hiển thị | Tên đăng nhập (`Username`) | Mật khẩu |
| :--- | :--- | :--- | :--- |
| **Admin (Quản Trị Viên)** | Nguyễn Phước Sang (Admin) | `admin` | `123456` |
| **Quản Lý Ca** | Võ Việt Thắng (Quản Lý Ca) | `manager` | `123456` |
| **NV Trực Cổng** | Đoàn Tiến Đạt (NV Trực Cổng) | `gate_staff` | `123456` |
| **Kế Toán** | Lê Thị Thu Ngân (Kế Toán) | `accountant` | `123456` |
| **Kỹ Thuật Viên** | Trần Kỹ Thuật (Kỹ Thuật Viên) | `technician` | `123456` |
| **Khách Hàng** | Phạm Minh Khách (Khách Hàng) | `customer` | `123456` |

---

## 📁 Cấu Trúc Dự Án

```text
SmartParking_management/
├── Controllers/
│   ├── HomeController.cs          # Trang chủ Sơ đồ bãi xe 150 chỗ, Bảng giá & API trạng thái
│   └── AccountController.cs       # Đăng nhập (/Account/Login) & Đăng ký (/Account/Register)
├── Models/
│   ├── User.cs / Vehicle.cs
│   ├── ParkingZone.cs / ParkingSlot.cs
│   ├── Booking.cs / ParkingSession.cs / FeeBreakdown.cs
│   └── ViewModels/
│       └── SmartParkingViewModel.cs
├── Views/
│   ├── Home/
│   │   └── PublicLanding.cshtml   # Giao diện Trang chủ, Sơ đồ 150 ô đỗ, Bộ lọc PCCC & Menu Account
│   ├── Account/
│   │   ├── Login.cshtml           # Giao diện Đăng nhập & Chọn nhanh 6 tài khoản mẫu
│   │   └── Register.cshtml        # Giao diện Đăng ký (Họ tên, Giới tính, SĐT, Xác nhận mật khẩu)
│   └── Shared/
│       └── _Layout.cshtml
├── Data/
│   ├── AppDbContext.cs            # Kết nối Supabase Cloud PostgreSQL & REST API
│   └── DbInitializer.cs           # Khởi tạo dữ liệu mẫu (Local Fallback & Seed Data)
├── Migrations/
│   └── 20261104093000_InitSmartParkSchema.sql
└── wwwroot/
    ├── css/
    │   └── public-landing.css     # Hệ thống giao diện Minimalist SaaS (Navy Blue - White - Black)
    ├── js/
    │   └── public-landing.js      # Xử lý sơ đồ 150 ô, lọc khu vực/loại xe/PCCC, tính vé tháng & Menu User
    └── images/
        └── parking-map-3d.webp    # Ảnh phối cảnh 3D bãi đỗ xe 4 phân khu
```

---

## 💻 Yêu Cầu Hệ Thống (Prerequisites)

- **.NET SDK** từ **.NET 10.0 trở xuống** (`.NET 8.0`, `.NET 9.0` hoặc `.NET 10.0`)
- **Visual Studio 2022 / 2026** hoặc **VS Code**
- Cơ sở dữ liệu: **PostgreSQL (Supabase Cloud)** hoặc chế độ Local Fallback (`DbInitializer`)
- Git

---

## ⚙️ Cài Đặt & Chạy Ứng Dụng

### 1. Clone dự án
```bash
git clone https://github.com/PSang275/SmartParking_management.git
cd SmartParking_management
```

### 2. Cấu hình Database (Supabase Cloud)
Ứng dụng hỗ trợ kết nối trực tiếp tới **PostgreSQL trên Supabase Cloud** (`jgvegymigpbgqmoylljf`) và tự động chuyển sang dữ liệu mẫu (`DbInitializer.cs`) nếu chạy offline. Cấu hình trong `appsettings.json`:

```json
{
  "Supabase": {
    "ProjectId": "jgvegymigpbgqmoylljf",
    "Url": "https://jgvegymigpbgqmoylljf.supabase.co",
    "PublishableKey": "sb_publishable_-c02GBdEgwYvZwFPeRyOvQ_0GUUJ0uO"
  }
}
```

### 3. Khởi tạo Schema CSDL
Schema 6 bảng (`app_users`, `parking_zones`, `parking_slots`, `vehicles`, `bookings`, `parking_sessions`) được định nghĩa tại:
```text
Migrations/20261104093000_InitSmartParkSchema.sql
```

### 4. Chạy ứng dụng
```bash
dotnet run
```
Ứng dụng sẽ khởi chạy tại địa chỉ: **`http://localhost:5080`** (hoặc nhấn **F5** trực tiếp trong **Visual Studio**).

---

## 📊 Kế Hoạch & Tiến Độ Phát Triển Theo Sprint

### Sprint 1 (29/10/2026 – 05/11/2026) — Khởi tạo Dự án, Giao diện Sơ đồ 150 chỗ & Đăng nhập/Đăng ký 6 Vai trò (7 US / 36 SP)
- Khởi tạo CSDL PostgreSQL trên Supabase Cloud & cấu trúc dự án ASP.NET Core MVC (`US01`).
- Thiết kế giao diện Trang chủ & Sơ đồ bãi xe **150 chỗ** thời gian thực chia theo 4 phân khu: `ZONE EV` (37 chỗ), `ZONE NT` (65 chỗ), `ZONE TH` (40 chỗ), `ZONE VIP` (8 chỗ) (`US02`).
- Bộ lọc & tìm kiếm chỗ trống theo khu vực, loại phương tiện (tự động khóa an toàn PCCC đối với Tầng hầm B1 khi chọn Ô tô điện / Xe máy điện), trạng thái ô và mã ô (`US03`).
- Xem chi tiết thông tin từng vị trí đỗ (mã ô, phân khu, loại xe, đơn giá, trạng thái) và bảng giá gửi theo giờ / gói vé tháng cố định chỗ ưu đãi 1–3–6–12 tháng (`US04`).
- Xây dựng trang Đăng ký tài khoản (họ tên, giới tính, số điện thoại, mật khẩu & xác nhận lại mật khẩu) và trang Đăng nhập hệ thống (`US16`).
- Thiết lập khung phân quyền 6 vai trò (`Admin`, `Quản lý ca`, `NV Trực cổng`, `Kế toán`, `Kỹ thuật viên`, `Khách hàng`), bộ tài khoản mẫu kiểm thử nhanh và Menu dropdown tài khoản trên thanh điều hướng (`US17`).
- Hoàn thiện giao diện phong cách Minimalist SaaS phối màu Xanh dương – Trắng – Đen, hiệu ứng chuyển động mượt và tương thích Responsive trên máy tính / điện thoại (`US31`).

### Sprint 2 (06/11/2026 – 18/11/2026) — Quản lý Phương tiện, Đặt chỗ & Vé QR, Check-in/Check-out & Tính phí Tự động (13 US / 43 SP)
- Đăng ký thông tin phương tiện (biển số, loại xe, hãng, màu xe) và quản lý danh sách phương tiện đã lưu của khách hàng (`US05`, `US06`).
- Đặt chỗ đỗ xe trực tuyến theo khung giờ dự kiến, kiểm tra chống trùng lịch và phát hành mã vé QR đặt trước (`US07`, `US08`).
- Kiểm soát xe vào bãi bằng mã QR đặt trước (QR Check-in), tiếp nhận xe vãng lai kèm cấp vé QR và tích hợp quét mã QR bằng camera thiết bị cho nhân viên trực cổng (`US09`, `US10`, `US21`).
- Xử lý Check-out & tính phí đỗ xe tự động theo đơn giá từng phân khu, phụ phí quá giờ (`1.5x` sau 15 phút ân hạn), phí điện sạc EV (`4.500đ/kWh`), xác nhận thanh toán và tự động giải phóng ô đỗ về trạng thái trống (`US11`, `US12`).
- Tra cứu lịch sử các lượt xe vào/ra, quản lý vị trí đỗ (thêm ô mới, khóa bảo trì / mở lại ô đỗ), hủy/gia hạn lịch đặt chỗ trước giờ hẹn và xem hóa đơn cá nhân (`US13`, `US14`, `US18`, `US19`).

### Sprint 3 (19/11/2026 – 27/11/2026) — Quản trị Admin, Gói Vé Tháng, Báo cáo Thống kê & Kiểm thử (13 US / 36 SP)
- Xây dựng Dashboard thống kê doanh thu & tỷ lệ lấp đầy, biểu đồ trực quan hóa doanh thu & lưu lượng xe theo ngày/tháng (Chart.js) và xuất báo cáo ra file Excel/CSV cho Kế toán (`US15`, `US26`, `US27`).
- Hệ thống thông báo nhắc giờ sắp hết hạn đặt chỗ / cảnh báo sạc đầy EV để tránh phí chiếm trụ sạc, và chức năng đăng ký/gia hạn gói vé tháng cố định chỗ (`US20`, `US28`).
- Cấu hình bảng giá theo phân khu, đơn giá kWh & phụ phí trụ sạc; quản lý danh mục phân khu đỗ xe; in/xuất hóa đơn thanh toán PDF và bộ lọc lịch sử toàn bãi nâng cao (`US22`, `US23`, `US24`, `US25`).
- Quản lý danh sách tài khoản người dùng & phân quyền 6 vai trò trên trang Admin, viết bộ Test Cases nghiệm thu, hoàn thiện tài liệu hướng dẫn và đóng gói bản Release bảo vệ đồ án ngày **28/11/2026** (`US29`, `US30`, `US32`, `US33`).

---

## 👥 Thành Viên Nhóm Phát Triển

| STT | Họ và Tên | GitHub Account | Vai trò (Role) |
| :---: | :--- | :--- | :--- |
| 1 | **Nguyễn Phước Sang** | [@PSang275](https://github.com/PSang275) | **Team Lead / Developer** |
| 2 | **Võ Việt Thắng** | [@vovietthang11-ops](https://github.com/vovietthang11-ops) | **Product Owner / Developer** |
| 3 | **Đoàn Tiến Đạt** | [@Tiendat264](https://github.com/Tiendat264) | **Scrum Master / Developer** |
