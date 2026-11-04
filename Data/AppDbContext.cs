using System.Net.Http.Headers;
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
        _httpClient.Timeout = TimeSpan.FromSeconds(4);
        if (!string.IsNullOrEmpty(AnonKey))
        {
            _httpClient.DefaultRequestHeaders.Remove("apikey");
            _httpClient.DefaultRequestHeaders.Add("apikey", AnonKey);
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", AnonKey);
        }
    }

    public async Task<List<T>> QueryTableAsync<T>(string relativeQuery, Func<List<T>> fallback)
    {
        try
        {
            using var response = await _httpClient.GetAsync(relativeQuery);
            if (response.IsSuccessStatusCode)
            {
                var json = await response.Content.ReadAsStringAsync();
                var data = JsonSerializer.Deserialize<List<T>>(json);
                if (data is not null && data.Count > 0)
                {
                    return data;
                }
            }
        }
        catch
        {
            // Fallback gracefully to DbInitializer if offline
        }
        return fallback();
    }

    public Task<List<ParkingZone>> GetZonesAsync() =>
        QueryTableAsync("parking_zones?select=*&order=id.asc", _initializer.GetDefaultZones);

    public Task<List<ParkingSlot>> GetSlotsAsync() =>
        QueryTableAsync("parking_slots?select=*&order=id.asc", _initializer.GetDefaultSlots);

    public Task<List<Vehicle>> GetVehiclesAsync() =>
        QueryTableAsync("vehicles?select=*&order=id.asc", _initializer.GetDefaultVehicles);

    public Task<List<Booking>> GetBookingsAsync() =>
        QueryTableAsync<Booking>("bookings?select=*&order=id.desc", () => []);

    public Task<List<ParkingSession>> GetSessionsAsync() =>
        QueryTableAsync<ParkingSession>("parking_sessions?select=*&order=id.desc", () => []);

    public Task<List<User>> GetUsersAsync() =>
        QueryTableAsync("app_users?select=*&order=id.asc", _initializer.GetDefaultUsers);

    public async Task<SmartParkingViewModel> BuildViewModelAsync(string activeTab, string pageTitle, string pageSubtitle)
    {
        var zonesTask = GetZonesAsync();
        var slotsTask = GetSlotsAsync();
        var vehiclesTask = GetVehiclesAsync();
        var bookingsTask = GetBookingsAsync();
        var sessionsTask = GetSessionsAsync();
        var usersTask = GetUsersAsync();

        await Task.WhenAll(zonesTask, slotsTask, vehiclesTask, bookingsTask, sessionsTask, usersTask);

        return new SmartParkingViewModel
        {
            ActiveTab = activeTab,
            PageTitle = pageTitle,
            PageSubtitle = pageSubtitle,
            SupabaseProjectId = SupabaseProjectId,
            SupabaseUrl = SupabaseUrl,
            Zones = zonesTask.Result,
            Slots = slotsTask.Result,
            Vehicles = vehiclesTask.Result,
            Bookings = bookingsTask.Result,
            Sessions = sessionsTask.Result,
            Users = usersTask.Result
        };
    }
}
