namespace SmartParking_management.Models.ViewModels;

public class SmartParkingViewModel
{
    public string ActiveTab { get; set; } = "map-tab";
    public string PageTitle { get; set; } = "Sơ đồ Bãi xe & Kiểm tra Chỗ trống Thời gian thực";
    public string PageSubtitle { get; set; } = "Kiến trúc ASP.NET Core MVC (C#) đồng bộ trực tiếp Supabase Cloud PostgreSQL";
    public string SupabaseProjectId { get; set; } = "jgvegymigpbgqmoylljf";
    public string SupabaseUrl { get; set; } = "https://jgvegymigpbgqmoylljf.supabase.co";

    public List<ParkingZone> Zones { get; set; } = [];
    public List<ParkingSlot> Slots { get; set; } = [];
    public List<Vehicle> Vehicles { get; set; } = [];
    public List<Booking> Bookings { get; set; } = [];
    public List<ParkingSession> Sessions { get; set; } = [];
    public List<User> Users { get; set; } = [];

    public int TotalSlots => Slots.Count;
    public int AvailableSlots => Slots.Count(s => s.Status == "AVAILABLE");
    public int BusySlots => Slots.Count(s => s.Status is "OCCUPIED" or "RESERVED");
    public int TotalRevenue => Sessions.Where(s => s.Status == "COMPLETED").Sum(s => s.FeeAmount);
}
