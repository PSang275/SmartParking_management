using SmartParking_management.Models;

namespace SmartParking_management.Data;

public class DbInitializer
{
    public List<ParkingZone> GetDefaultZones() =>
    [
        new() { Id = 1, ZoneCode = "ZONE-A", ZoneName = "Khu A - Tầng Hầm B1 (Ô tô)", VehicleType = "CAR", HourlyRate = 20000, OvernightRate = 120000, Description = "Khu đỗ xe ô tô tiêu chuẩn có mái che, camera AI giám sát" },
        new() { Id = 2, ZoneCode = "ZONE-B", ZoneName = "Khu B - Sảnh Chính (Xe máy)", VehicleType = "MOTORBIKE", HourlyRate = 5000, OvernightRate = 30000, Description = "Khu đỗ xe máy trung tâm, quét mã QR tự động" },
        new() { Id = 3, ZoneCode = "ZONE-C", ZoneName = "Khu C - Khu VIP Ngoài Trời (Ô tô)", VehicleType = "CAR", HourlyRate = 25000, OvernightRate = 150000, Description = "Khu đỗ ô tô rộng rãi sát cổng chính, tích hợp sạc điện" }
    ];

    public List<ParkingSlot> GetDefaultSlots() =>
    [
        new() { Id = 1, ZoneId = 1, SlotCode = "A-01", VehicleType = "CAR", Status = "OCCUPIED", CurrentPlate = "51K-888.99" },
        new() { Id = 2, ZoneId = 1, SlotCode = "A-02", VehicleType = "CAR", Status = "AVAILABLE" },
        new() { Id = 3, ZoneId = 1, SlotCode = "A-03", VehicleType = "CAR", Status = "RESERVED", CurrentPlate = "30H-123.45" },
        new() { Id = 4, ZoneId = 1, SlotCode = "A-04", VehicleType = "CAR", Status = "AVAILABLE" },
        new() { Id = 5, ZoneId = 1, SlotCode = "A-05", VehicleType = "CAR", Status = "MAINTENANCE" },
        new() { Id = 6, ZoneId = 2, SlotCode = "B-01", VehicleType = "MOTORBIKE", Status = "OCCUPIED", CurrentPlate = "59X3-678.90" },
        new() { Id = 7, ZoneId = 2, SlotCode = "B-02", VehicleType = "MOTORBIKE", Status = "AVAILABLE" },
        new() { Id = 8, ZoneId = 2, SlotCode = "B-03", VehicleType = "MOTORBIKE", Status = "AVAILABLE" },
        new() { Id = 9, ZoneId = 2, SlotCode = "B-04", VehicleType = "MOTORBIKE", Status = "RESERVED", CurrentPlate = "59T2-345.67" },
        new() { Id = 10, ZoneId = 2, SlotCode = "B-05", VehicleType = "MOTORBIKE", Status = "AVAILABLE" },
        new() { Id = 11, ZoneId = 3, SlotCode = "C-01", VehicleType = "CAR", Status = "AVAILABLE" },
        new() { Id = 12, ZoneId = 3, SlotCode = "C-02", VehicleType = "CAR", Status = "AVAILABLE" },
        new() { Id = 13, ZoneId = 3, SlotCode = "C-03", VehicleType = "CAR", Status = "OCCUPIED", CurrentPlate = "65A-555.66" }
    ];

    public List<Vehicle> GetDefaultVehicles() =>
    [
        new() { Id = 1, OwnerName = "Nguyễn Phước Sang", OwnerPhone = "0901234567", LicensePlate = "51K-888.99", VehicleType = "CAR", Brand = "VinFast VF8", Color = "Trắng", IsDefault = true },
        new() { Id = 2, OwnerName = "Võ Việt Thắng", OwnerPhone = "0912345678", LicensePlate = "30H-123.45", VehicleType = "CAR", Brand = "Mazda CX-5", Color = "Đỏ", IsDefault = true },
        new() { Id = 3, OwnerName = "Đoàn Tiến Đạt", OwnerPhone = "0987654321", LicensePlate = "59X3-678.90", VehicleType = "MOTORBIKE", Brand = "Honda SH 160i", Color = "Đen", IsDefault = true }
    ];

    public List<User> GetDefaultUsers() =>
    [
        new() { Id = 1, Username = "admin", PasswordHash = "123456", FullName = "Nguyễn Phước Sang (Admin)", Phone = "0901234567", Role = "ADMIN" },
        new() { Id = 2, Username = "manager", PasswordHash = "123456", FullName = "Võ Việt Thắng (Quản lý ca)", Phone = "0912345678", Role = "MANAGER" },
        new() { Id = 3, Username = "gate_staff", PasswordHash = "123456", FullName = "Đoàn Tiến Đạt (NV Trực cổng)", Phone = "0987654321", Role = "GATE_STAFF" },
        new() { Id = 4, Username = "accountant", PasswordHash = "123456", FullName = "Lê Thị Thu Ngân (Kế toán)", Phone = "0904567890", Role = "ACCOUNTANT" },
        new() { Id = 5, Username = "technician", PasswordHash = "123456", FullName = "Trần Kỹ Thuật (Trạm sạc & PCCC)", Phone = "0905678901", Role = "TECHNICIAN" },
        new() { Id = 6, Username = "customer", PasswordHash = "123456", FullName = "Phạm Minh Khách (Khách hàng)", Phone = "0906789012", Role = "CUSTOMER" }
    ];
}
