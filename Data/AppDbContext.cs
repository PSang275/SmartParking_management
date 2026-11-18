using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using SmartParking_management.Models;
using SmartParking_management.Models.ViewModels;

namespace SmartParking_management.Data;

public class AppDbContext
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _config;
    private readonly DbInitializer _initializer;

    public string DefaultConnection => _config.GetConnectionString("DefaultConnection") ?? "";
    public string SqliteConnection => _config.GetConnectionString("SqliteConnection") ?? "Data Source=SmartParking.db";
    public string SupabaseUrl => _config["Supabase:Url"] ?? "https://jgvegymigpbgqmoylljf.supabase.co";
    public string SupabaseProjectId => _config["Supabase:ProjectId"] ?? "jgvegymigpbgqmoylljf";
    public string AnonKey => _config["Supabase:AnonKey"] ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpndmVneW1pZ3BiZ3Ftb3lsbGpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM3ODA3NDcsImV4cCI6MjEwOTM1Njc0N30.mvoavuNlw6V4ONaYht546D1-_tgehSDwh_GvQ7tubQ8";

    public AppDbContext(HttpClient httpClient, IConfiguration config, DbInitializer initializer)
    {
        _httpClient = httpClient;
        _config = config;
        _initializer = initializer;

        _httpClient.BaseAddress = new Uri($"{SupabaseUrl.TrimEnd('/')}/rest/v1/");
        _httpClient.Timeout = TimeSpan.FromSeconds(3);
        if (!string.IsNullOrEmpty(AnonKey))
        {
            _httpClient.DefaultRequestHeaders.Remove("apikey");
            _httpClient.DefaultRequestHeaders.Add("apikey", AnonKey);
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", AnonKey);
        }
    }

    public Task<List<ParkingZone>> GetZonesAsync() =>
        Task.FromResult(_initializer.GetDefaultZones());

    public Task<List<ParkingSlot>> GetSlotsAsync() =>
        Task.FromResult(_initializer.GetDefaultSlots());

    public Task<List<Vehicle>> GetVehiclesAsync() =>
        Task.FromResult(_initializer.GetDefaultVehicles());

    public Task<List<Booking>> GetBookingsAsync() =>
        Task.FromResult(_initializer.GetDefaultBookings());

    public Task<List<ParkingSession>> GetSessionsAsync() =>
        Task.FromResult(_initializer.GetDefaultSessions());

    public Task<List<User>> GetUsersAsync() =>
        Task.FromResult(_initializer.GetDefaultUsers());

    public Task<List<MonthlyPass>> GetMonthlyPassesAsync() =>
        Task.FromResult(_initializer.GetDefaultMonthlyPasses());

    // US07 & US08 (PSang275): Đặt chỗ đỗ xe trực tuyến theo khung giờ & Sinh mã vé QR
    public async Task<(bool Ok, string Message, Booking? Booking)> CreateBookingAsync(
        string slotCode,
        string licensePlate,
        string vehicleType,
        string customerName,
        string? customerPhone,
        DateTimeOffset startTime,
        DateTimeOffset endTime)
    {
        var res = _initializer.CreateBooking(slotCode, licensePlate, vehicleType, customerName, customerPhone, startTime, endTime);
        if (res.Ok && res.Booking is not null)
        {
            _ = TryPostSupabaseAsync("bookings", new
            {
                booking_code = res.Booking.BookingCode,
                customer_name = res.Booking.CustomerName,
                customer_phone = res.Booking.CustomerPhone,
                license_plate = res.Booking.LicensePlate,
                vehicle_type = res.Booking.VehicleType,
                slot_id = res.Booking.SlotId,
                slot_code = res.Booking.SlotCode,
                start_time = res.Booking.StartTime,
                end_time = res.Booking.EndTime,
                status = res.Booking.Status
            });
        }
        return await Task.FromResult(res);
    }

    // US11 (PSang275): Check-out & tính phí tự động
    public Task<(bool Ok, string Message, FeeBreakdown? Breakdown)> CalculateCheckoutFeeAsync(
        string queryCodeOrPlate,
        double? customDurationHours,
        double? customOvertimeHours,
        double? evKwh,
        int? idleMinutes)
    {
        var res = _initializer.CalculateCheckoutFee(queryCodeOrPlate, customDurationHours, customOvertimeHours, evKwh, idleMinutes);
        return Task.FromResult(res);
    }

    // US28 (PSang275): Đăng ký & gia hạn gói vé tháng cố định chỗ (khóa trùng ô)
    public Task<(bool Ok, string Message, MonthlyPass? Pass)> RegisterMonthlyPassAsync(
        string customerName,
        string customerPhone,
        string licensePlate,
        string vehicleType,
        string slotCode,
        int months)
    {
        var res = _initializer.RegisterMonthlyPass(customerName, customerPhone, licensePlate, vehicleType, slotCode, months);
        return Task.FromResult(res);
    }

    public Task<(bool Ok, string Message, MonthlyPass? Pass)> RenewMonthlyPassAsync(long passId, int addMonths)
    {
        var res = _initializer.RenewMonthlyPass(passId, addMonths);
        return Task.FromResult(res);
    }

    // US32 (PSang275): Quản lý danh sách tài khoản người dùng & phân quyền 6 vai trò
    public async Task<(bool Ok, string Message, User? User)> CreateUserAsync(
        string username,
        string fullName,
        string? phone,
        string? email,
        string role,
        string? password)
    {
        var res = _initializer.CreateUser(username, fullName, phone, email, role, password);
        if (res.Ok && res.User is not null)
        {
            _ = TryPostSupabaseAsync("app_users", new
            {
                username = res.User.Username,
                password_hash = res.User.PasswordHash,
                full_name = res.User.FullName,
                phone = res.User.Phone,
                email = res.User.Email,
                role = res.User.Role
            });
        }
        return await Task.FromResult(res);
    }

    public Task<(bool Ok, string Message, User? User)> UpdateUserRoleAndStatusAsync(
        long id,
        string? fullName,
        string? phone,
        string? role,
        string? status)
    {
        var res = _initializer.UpdateUserRoleAndStatus(id, fullName, phone, role, status);
        return Task.FromResult(res);
    }

    public Task<(bool Ok, string Message)> DeleteUserAsync(long id)
    {
        var res = _initializer.DeleteUser(id);
        return Task.FromResult(res);
    }

    private async Task TryPostSupabaseAsync(string table, object payload)
    {
        try
        {
            var json = JsonSerializer.Serialize(payload);
            using var content = new StringContent(json, Encoding.UTF8, "application/json");
            await _httpClient.PostAsync(table, content);
        }
        catch
        {
            // Ignore remote sync error if offline
        }
    }

    public async Task<SmartParkingViewModel> BuildViewModelAsync(string activeTab, string pageTitle, string pageSubtitle, string currentRole = "ADMIN")
    {
        return new SmartParkingViewModel
        {
            ActiveTab = activeTab,
            CurrentRole = currentRole,
            PageTitle = pageTitle,
            PageSubtitle = pageSubtitle,
            SupabaseProjectId = SupabaseProjectId,
            SupabaseUrl = SupabaseUrl,
            Zones = await GetZonesAsync(),
            Slots = await GetSlotsAsync(),
            Vehicles = await GetVehiclesAsync(),
            Bookings = await GetBookingsAsync(),
            Sessions = await GetSessionsAsync(),
            Users = await GetUsersAsync(),
            MonthlyPasses = await GetMonthlyPassesAsync()
        };
    }
}
