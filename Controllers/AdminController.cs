using Microsoft.AspNetCore.Mvc;
using SmartParking_management.Data;

namespace SmartParking_management.Controllers;

public class AdminController(AppDbContext db) : Controller
{
    [HttpGet("/Admin")]
    [HttpGet("/Admin/Index")]
    public async Task<IActionResult> Index([FromQuery] string tab = "map")
    {
        var vm = await db.BuildViewModelAsync(
            activeTab: tab,
            pageTitle: "Trung tâm Quản trị Hệ thống & Phân quyền 6 Vai trò",
            pageSubtitle: "Giám sát sơ đồ 150 ô đỗ, quản lý danh sách tài khoản 6 vai trò và đồng bộ CSDL Supabase",
            currentRole: "ADMIN");
        return View("~/Views/Admin/Index.cshtml", vm);
    }

    // US31 (PSang275): Khung Layout & Sidebar phân nhánh tách biệt cho đủ 6 vai trò
    [HttpGet("/Workspace/{role}")]
    public async Task<IActionResult> RoleWorkspace(string role)
    {
        var normalized = (role ?? "MANAGER").Trim().ToUpperInvariant();
        if (normalized == "ADMIN") return Redirect("/Admin");
        if (normalized == "GATE_STAFF") return Redirect("/Gate");
        if (normalized == "CUSTOMER") return Redirect("/");

        var (title, subtitle) = normalized switch
        {
            "MANAGER" => ("Không gian Điều hành Ca trực", "Khung giao diện dành riêng cho Quản lý ca (MANAGER)"),
            "ACCOUNTANT" => ("Không gian Đối soát & Tài chính", "Khung giao diện dành riêng cho Kế toán bãi xe (ACCOUNTANT)"),
            "TECHNICIAN" => ("Không gian Kỹ thuật Trạm sạc & An toàn PCCC", "Khung giao diện dành riêng cho Kỹ thuật viên (TECHNICIAN)"),
            _ => ("Không gian Vận hành Hệ thống", "Khung giao diện phân nhánh theo vai trò")
        };

        var vm = await db.BuildViewModelAsync(
            activeTab: "workspace",
            pageTitle: title,
            pageSubtitle: subtitle,
            currentRole: normalized);
        return View("~/Views/Admin/RoleWorkspace.cshtml", vm);
    }

    [HttpGet("/api/state")]
    public async Task<IActionResult> GetState()
    {
        var vm = await db.BuildViewModelAsync("map", "", "");
        return Json(new
        {
            totalSlots = vm.TotalSlots,
            availableSlots = vm.AvailableSlots,
            busySlots = vm.BusySlots,
            totalRevenue = vm.TotalRevenue,
            zones = vm.Zones,
            slots = vm.Slots,
            bookings = vm.Bookings,
            sessions = vm.Sessions,
            users = vm.Users,
            monthlyPasses = vm.MonthlyPasses
        });
    }

    // US07 & US08 (PSang275): Đặt chỗ đỗ xe trực tuyến theo khung giờ & Sinh mã vé QR
    [HttpPost("/api/bookings")]
    public async Task<IActionResult> CreateBooking([FromBody] CreateBookingRequest req)
    {
        var start = req.StartTime ?? DateTimeOffset.UtcNow.AddMinutes(15);
        var end = req.EndTime ?? start.AddHours(2);

        var (ok, message, booking) = await db.CreateBookingAsync(
            req.SlotCode ?? "",
            req.LicensePlate ?? "",
            req.VehicleType ?? "CAR",
            req.CustomerName ?? "Phạm Minh Khách",
            req.CustomerPhone,
            start,
            end);

        if (!ok) return BadRequest(new { ok = false, message });
        return Ok(new { ok = true, message, booking });
    }

    // US11 (PSang275): Check-out & tính phí tự động (đơn giá khu, phụ phí quá giờ 1.5x, tiền điện sạc EV)
    [HttpPost("/api/checkout-calculate")]
    public async Task<IActionResult> CalculateCheckout([FromBody] CalculateCheckoutRequest req)
    {
        var (ok, message, breakdown) = await db.CalculateCheckoutFeeAsync(
            req.Query ?? "",
            req.DurationHours,
            req.OvertimeHours,
            req.EvKwh,
            req.IdleMinutes);

        if (!ok) return BadRequest(new { ok = false, message });
        return Ok(new { ok = true, message, breakdown });
    }

    // US28 (PSang275): Đăng ký & gia hạn gói vé tháng cố định chỗ (ưu đãi 1-3-6-12 tháng, khóa trùng ô)
    [HttpGet("/api/monthly-passes")]
    public async Task<IActionResult> GetMonthlyPasses()
    {
        var passes = await db.GetMonthlyPassesAsync();
        return Ok(passes);
    }

    [HttpPost("/api/monthly-passes")]
    public async Task<IActionResult> RegisterMonthlyPass([FromBody] RegisterMonthlyPassRequest req)
    {
        var (ok, message, pass) = await db.RegisterMonthlyPassAsync(
            req.CustomerName ?? "Phạm Minh Khách",
            req.CustomerPhone ?? "0906789012",
            req.LicensePlate ?? "",
            req.VehicleType ?? "GAS_CAR",
            req.SlotCode ?? "",
            req.Months);

        if (!ok) return BadRequest(new { ok = false, message });
        return Ok(new { ok = true, message, pass });
    }

    [HttpPost("/api/monthly-passes/{id:long}/renew")]
    public async Task<IActionResult> RenewMonthlyPass(long id, [FromBody] RenewMonthlyPassRequest req)
    {
        var (ok, message, pass) = await db.RenewMonthlyPassAsync(id, req.AddMonths);
        if (!ok) return BadRequest(new { ok = false, message });
        return Ok(new { ok = true, message, pass });
    }

    // US32 (PSang275): Quản lý danh sách tài khoản người dùng & phân quyền 6 vai trò
    [HttpGet("/api/users")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await db.GetUsersAsync();
        return Ok(users);
    }

    [HttpPost("/api/users")]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest req)
    {
        var (ok, message, user) = await db.CreateUserAsync(
            req.Username ?? "",
            req.FullName ?? "",
            req.Phone,
            req.Email,
            req.Role ?? "CUSTOMER",
            req.Password);

        if (!ok) return BadRequest(new { ok = false, message });
        return Ok(new { ok = true, message, user });
    }

    [HttpPut("/api/users/{id:long}")]
    public async Task<IActionResult> UpdateUser(long id, [FromBody] UpdateUserRequest req)
    {
        var (ok, message, user) = await db.UpdateUserRoleAndStatusAsync(
            id,
            req.FullName,
            req.Phone,
            req.Role,
            req.Status);

        if (!ok) return BadRequest(new { ok = false, message });
        return Ok(new { ok = true, message, user });
    }

    [HttpDelete("/api/users/{id:long}")]
    public async Task<IActionResult> DeleteUser(long id)
    {
        var (ok, message) = await db.DeleteUserAsync(id);
        if (!ok) return BadRequest(new { ok = false, message });
        return Ok(new { ok = true, message, id });
    }
}

public record CreateBookingRequest(
    string? SlotCode,
    string? LicensePlate,
    string? VehicleType,
    string? CustomerName,
    string? CustomerPhone,
    DateTimeOffset? StartTime,
    DateTimeOffset? EndTime);

public record CalculateCheckoutRequest(
    string? Query,
    double? DurationHours,
    double? OvertimeHours,
    double? EvKwh,
    int? IdleMinutes);

public record RegisterMonthlyPassRequest(
    string? CustomerName,
    string? CustomerPhone,
    string? LicensePlate,
    string? VehicleType,
    string? SlotCode,
    int Months);

public record RenewMonthlyPassRequest(int AddMonths);

public record CreateUserRequest(
    string? Username,
    string? FullName,
    string? Phone,
    string? Email,
    string? Role,
    string? Password);

public record UpdateUserRequest(
    string? FullName,
    string? Phone,
    string? Role,
    string? Status);
