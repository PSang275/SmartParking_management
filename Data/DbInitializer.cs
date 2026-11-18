using SmartParking_management.Models;

namespace SmartParking_management.Data;

public class DbInitializer
{
    private readonly object _lock = new();
    private readonly List<ParkingZone> _zones;
    private readonly List<ParkingSlot> _slots;
    private readonly List<Vehicle> _vehicles;
    private readonly List<Booking> _bookings;
    private readonly List<ParkingSession> _sessions;
    private readonly List<User> _users;
    private readonly List<MonthlyPass> _monthlyPasses;

    private long _nextBookingId = 25;
    private long _nextUserId = 10;
    private long _nextPassId = 10;

    public DbInitializer()
    {
        _zones = BuildInitialZones();
        _slots = BuildInitial150Slots();
        _vehicles = BuildInitialVehicles();
        _bookings = BuildInitialBookings(_slots);
        _sessions = BuildInitialSessions();
        _users = BuildInitialUsers();
        _monthlyPasses = BuildInitialMonthlyPasses();
    }

    public List<ParkingZone> GetDefaultZones()
    {
        lock (_lock) return _zones.ToList();
    }

    public List<ParkingSlot> GetDefaultSlots()
    {
        lock (_lock) return _slots.ToList();
    }

    public List<Vehicle> GetDefaultVehicles()
    {
        lock (_lock) return _vehicles.OrderByDescending(v => v.IsDefault).ThenByDescending(v => v.Id).ToList();
    }

    public List<Booking> GetDefaultBookings()
    {
        lock (_lock) return _bookings.OrderByDescending(b => b.CreatedAt).ToList();
    }

    public List<ParkingSession> GetDefaultSessions()
    {
        lock (_lock) return _sessions.OrderByDescending(s => s.CheckInTime).ToList();
    }

    public List<User> GetDefaultUsers()
    {
        lock (_lock) return _users.OrderBy(u => u.Id).ToList();
    }

    public List<MonthlyPass> GetDefaultMonthlyPasses()
    {
        lock (_lock) return _monthlyPasses.OrderByDescending(m => m.CreatedAt).ToList();
    }

    // =========================================================================
    // US07 & US08 (PSang275): Đặt chỗ đỗ xe trực tuyến theo khung giờ dự kiến,
    // kiểm tra chống trùng lịch + khóa PCCC tầng hầm B1 & Sinh mã vé QR
    // =========================================================================
    public (bool Ok, string Message, Booking? Booking) CreateBooking(
        string slotCode,
        string licensePlate,
        string vehicleType,
        string customerName,
        string? customerPhone,
        DateTimeOffset startTime,
        DateTimeOffset endTime)
    {
        lock (_lock)
        {
            var cleanSlot = (slotCode ?? "").Trim().ToUpperInvariant();
            var cleanPlate = (licensePlate ?? "").Trim().ToUpperInvariant();

            if (string.IsNullOrWhiteSpace(cleanPlate) || cleanPlate.Length < 5)
            {
                return (false, "Vui lòng nhập biển số xe hợp lệ (ví dụ: 51K-888.99 hoặc 59X3-678.90).", null);
            }

            var slot = _slots.FirstOrDefault(s => s.SlotCode.Equals(cleanSlot, StringComparison.OrdinalIgnoreCase));
            if (slot is null)
            {
                return (false, $"Không tìm thấy vị trí ô đỗ {cleanSlot}.", null);
            }

            // Kiểm tra quy định PCCC Tầng hầm B1 (Zone TH không nhận xe điện)
            bool isEv = vehicleType is "EV_CAR" or "EV_BIKE" || slot.SlotCode.StartsWith("EV-");
            if (slot.ZoneId == 3 && (vehicleType == "EV_CAR" || vehicleType == "EV_BIKE"))
            {
                return (false, "Khóa an toàn PCCC: Tầng hầm B1 (Zone TH) chỉ nhận xe xăng, không nhận phương tiện xe điện.", null);
            }

            if (endTime <= startTime)
            {
                return (false, "Thời gian kết thúc (Giờ ra dự kiến) phải lớn hơn Giờ vào dự kiến.", null);
            }

            // Kiểm tra chống trùng ô cố định vé tháng
            if (_monthlyPasses.Any(m => m.Status == "ACTIVE" && m.SlotCode.Equals(cleanSlot, StringComparison.OrdinalIgnoreCase)))
            {
                return (false, $"Ô đỗ {cleanSlot} đã được khóa cố định cho khách hàng đăng ký gói vé tháng.", null);
            }

            // Kiểm tra chống trùng khung giờ đặt chỗ trên cùng ô đỗ
            var conflictOnSlot = _bookings.FirstOrDefault(b =>
                b.Status is "RESERVED" or "CHECKED_IN" &&
                b.SlotCode.Equals(cleanSlot, StringComparison.OrdinalIgnoreCase) &&
                startTime < b.EndTime && endTime > b.StartTime);

            if (conflictOnSlot is not null || slot.Status != "AVAILABLE")
            {
                return (false, $"Chống trùng lịch: Ô đỗ {slot.SlotCode} đã có lịch đặt hoặc đang có xe trong khung giờ này. Vui lòng chọn ô trống khác.", null);
            }

            // Kiểm tra chống trùng lịch cùng 1 biển số xe đặt 2 ô cùng khung giờ
            var conflictOnPlate = _bookings.FirstOrDefault(b =>
                b.Status is "RESERVED" or "CHECKED_IN" &&
                b.LicensePlate.Equals(cleanPlate, StringComparison.OrdinalIgnoreCase) &&
                startTime < b.EndTime && endTime > b.StartTime);

            if (conflictOnPlate is not null)
            {
                return (false, $"Biển số {cleanPlate} đã có vé đặt trước ({conflictOnPlate.BookingCode}) tại ô {conflictOnPlate.SlotCode} trong cùng khung giờ.", null);
            }

            var datePart = DateTime.Now.ToString("yyMMdd");
            var randPart = Guid.NewGuid().ToString("N")[..4].ToUpperInvariant();
            var bookingCode = $"QR-BK-{datePart}-{randPart}";

            var normalizedDbType = (vehicleType.Contains("BIKE") || slot.VehicleType == "MOTORBIKE") ? "MOTORBIKE" : "CAR";

            var booking = new Booking
            {
                Id = ++_nextBookingId,
                BookingCode = bookingCode,
                CustomerName = string.IsNullOrWhiteSpace(customerName) ? "Phạm Minh Khách" : customerName.Trim(),
                CustomerPhone = string.IsNullOrWhiteSpace(customerPhone) ? "0906789012" : customerPhone.Trim(),
                LicensePlate = cleanPlate,
                VehicleType = normalizedDbType,
                SlotId = slot.Id,
                SlotCode = slot.SlotCode,
                StartTime = startTime,
                EndTime = endTime,
                Status = "RESERVED",
                CreatedAt = DateTimeOffset.UtcNow
            };

            slot.Status = "RESERVED";
            slot.CurrentPlate = cleanPlate;
            slot.UpdatedAt = DateTimeOffset.UtcNow;

            _bookings.Insert(0, booking);

            return (true, $"Đặt chỗ thành công tại ô {slot.SlotCode}. Mã vé QR: {bookingCode}", booking);
        }
    }

    // =========================================================================
    // US11 (PSang275): Check-out & tính phí tự động
    // (đơn giá khu, phụ phí quá giờ 1.5x sau 15p ân hạn, tiền điện sạc EV 4.500đ/kWh)
    // =========================================================================
    public (bool Ok, string Message, FeeBreakdown? Breakdown) CalculateCheckoutFee(
        string queryCodeOrPlate,
        double? customDurationHours,
        double? customOvertimeHours,
        double? evKwh,
        int? idleMinutes)
    {
        lock (_lock)
        {
            var q = (queryCodeOrPlate ?? "").Trim().ToUpperInvariant();
            if (string.IsNullOrWhiteSpace(q))
            {
                return (false, "Vui lòng quét mã QR bằng Camera hoặc nhập Mã vé / Biển số / Mã ô đỗ.", null);
            }

            var session = _sessions.FirstOrDefault(s =>
                s.QrToken.Equals(q, StringComparison.OrdinalIgnoreCase) ||
                s.LicensePlate.Equals(q, StringComparison.OrdinalIgnoreCase) ||
                s.SlotCode.Equals(q, StringComparison.OrdinalIgnoreCase));

            var booking = _bookings.FirstOrDefault(b =>
                b.BookingCode.Equals(q, StringComparison.OrdinalIgnoreCase) ||
                b.LicensePlate.Equals(q, StringComparison.OrdinalIgnoreCase) ||
                b.SlotCode.Equals(q, StringComparison.OrdinalIgnoreCase));

            var slotCode = session?.SlotCode ?? booking?.SlotCode ?? q;
            var slot = _slots.FirstOrDefault(s =>
                s.SlotCode.Equals(slotCode, StringComparison.OrdinalIgnoreCase) ||
                (s.CurrentPlate != null && s.CurrentPlate.Equals(q, StringComparison.OrdinalIgnoreCase)));

            if (session is null && booking is null && slot is null)
            {
                return (false, $"Không tìm thấy phiên đỗ xe hoặc vé QR khớp với mã \"{q}\".", null);
            }

            var resolvedSlotCode = slot?.SlotCode ?? session?.SlotCode ?? booking?.SlotCode ?? "EV-O01";
            var zoneId = slot?.ZoneId ?? (resolvedSlotCode.StartsWith("EV-") ? 1 : resolvedSlotCode.StartsWith("NT-") ? 2 : resolvedSlotCode.StartsWith("TH-") ? 3 : 4);
            var zone = _zones.FirstOrDefault(z => z.Id == zoneId) ?? _zones[0];

            var plate = session?.LicensePlate ?? booking?.LicensePlate ?? slot?.CurrentPlate ?? "51K-888.99";
            var customerName = session?.CustomerName ?? booking?.CustomerName ?? "Khách gửi xe SmartPark";
            var vehicleType = session?.VehicleType ?? booking?.VehicleType ?? slot?.VehicleType ?? "CAR";
            bool isMotorbike = vehicleType == "MOTORBIKE" || resolvedSlotCode.Contains("-X");

            var now = DateTimeOffset.UtcNow;
            var checkIn = session?.CheckInTime ?? booking?.StartTime ?? now.AddHours(-2.5);
            var expectedEnd = booking?.EndTime ?? checkIn.AddHours(2);

            int rawMinutes;
            if (customDurationHours.HasValue && customDurationHours.Value > 0)
            {
                rawMinutes = (int)Math.Round(customDurationHours.Value * 60);
            }
            else
            {
                rawMinutes = Math.Max(30, (int)Math.Round((now - checkIn).TotalMinutes));
            }

            // Làm tròn theo block 30 phút (tối thiểu 1.0 giờ)
            int halfHourBlocks = (rawMinutes + 29) / 30;
            double billedHours = Math.Max(1.0, halfHourBlocks * 0.5);

            int hourlyRate = isMotorbike ? 5000 : zone.HourlyRate;
            int baseFee;
            if (isMotorbike)
            {
                // Xe máy: 5.000đ / block 4 giờ
                int fourHourBlocks = Math.Max(1, (int)Math.Ceiling(billedHours / 4.0));
                baseFee = fourHourBlocks * 5000;
            }
            else
            {
                baseFee = (int)Math.Round(billedHours * hourlyRate);
            }

            // Tính phụ phí quá giờ 1.5x (sau 15 phút ân hạn)
            int overtimeMinutes = 0;
            double overtimeHours = 0;
            if (customOvertimeHours.HasValue && customOvertimeHours.Value >= 0)
            {
                overtimeMinutes = (int)Math.Round(customOvertimeHours.Value * 60);
            }
            else if (now > expectedEnd.AddMinutes(15))
            {
                overtimeMinutes = (int)Math.Round((now - expectedEnd).TotalMinutes);
            }

            int overtimeSurcharge = 0;
            if (overtimeMinutes > 15)
            {
                int otHalfBlocks = (overtimeMinutes + 29) / 30;
                overtimeHours = otHalfBlocks * 0.5;
                int unitRateForOt = isMotorbike ? 5000 : hourlyRate;
                overtimeSurcharge = (int)Math.Round(overtimeHours * unitRateForOt * 1.5);
            }

            // Tính tiền điện sạc EV (4.500đ/kWh) & phí chiếm trụ sạc (1.000đ/phút sau 10 phút)
            bool isEvZone = zone.ZoneCode == "ZONE-EV" || resolvedSlotCode.StartsWith("EV-");
            double actualKwh = evKwh ?? (isEvZone ? (isMotorbike ? 2.4 : 14.5) : 0);
            if (!isEvZone && (!evKwh.HasValue || evKwh.Value <= 0)) actualKwh = 0;

            const int evRatePerKwh = 4500;
            int evChargingFee = (int)Math.Round(actualKwh * evRatePerKwh);

            int rawIdleMins = Math.Max(0, idleMinutes ?? 0);
            int chargeableIdleMins = rawIdleMins > 10 ? (rawIdleMins - 10) : 0;
            int idleFee = chargeableIdleMins * 1000;

            int totalFee = baseFee + overtimeSurcharge + evChargingFee + idleFee;

            var summaryParts = new List<string>
            {
                isMotorbike
                    ? $"Phí đỗ xe máy ({billedHours:0.#}h): {baseFee:N0}đ"
                    : $"Phí đỗ theo giờ ({billedHours:0.#}h × {hourlyRate:N0}đ): {baseFee:N0}đ"
            };
            if (overtimeSurcharge > 0)
            {
                summaryParts.Add($"Phụ phí quá giờ 1.5x ({overtimeHours:0.#}h vượt sau 15p ân hạn): +{overtimeSurcharge:N0}đ");
            }
            if (evChargingFee > 0)
            {
                summaryParts.Add($"Điện sạc VinFast ({actualKwh:0.#} kWh × 4.500đ): +{evChargingFee:N0}đ");
            }
            if (idleFee > 0)
            {
                summaryParts.Add($"Phí chiếm trụ sạc ({chargeableIdleMins} phút × 1.000đ): +{idleFee:N0}đ");
            }

            var breakdown = new FeeBreakdown
            {
                QrToken = session?.QrToken ?? booking?.BookingCode ?? $"QR-IN-{resolvedSlotCode}",
                LicensePlate = plate,
                CustomerName = customerName,
                VehicleType = isMotorbike ? "MOTORBIKE" : "CAR",
                SlotCode = resolvedSlotCode,
                ZoneCode = zone.ZoneCode,
                ZoneName = zone.ZoneName,
                CheckInTime = checkIn,
                ExpectedEndTime = expectedEnd,
                CheckOutTime = now,
                RawMinutes = rawMinutes,
                BilledHours = billedHours,
                HourlyRate = hourlyRate,
                BaseFee = baseFee,
                OvertimeMinutes = overtimeMinutes,
                OvertimeHours = overtimeHours,
                OvertimeSurcharge = overtimeSurcharge,
                EvKwh = actualKwh,
                EvRatePerKwh = evRatePerKwh,
                EvChargingFee = evChargingFee,
                IdleMinutes = chargeableIdleMins,
                IdleFee = idleFee,
                TotalFee = totalFee,
                FormulaSummary = string.Join(" • ", summaryParts)
            };

            return (true, $"Đã tính phí tự động cho xe {plate} tại ô {resolvedSlotCode}.", breakdown);
        }
    }

    // =========================================================================
    // US28 (PSang275): Đăng ký & gia hạn gói vé tháng cố định chỗ
    // (ưu đãi 1-3-6-12 tháng: 0%, -5%, -10%, -15% & khóa trùng ô)
    // =========================================================================
    public static (int BasePrice, int DiscountPercent, int TotalAmount) ComputeMonthlyPassPricing(string zoneCode, string vehicleType, int months)
    {
        bool isBike = vehicleType is "MOTORBIKE" or "GAS_BIKE" or "EV_BIKE";
        bool isEv = vehicleType is "EV_CAR" or "EV_BIKE" || zoneCode == "ZONE-EV";

        int baseMonthly = isBike
            ? (isEv ? 300000 : 250000)
            : zoneCode switch
            {
                "ZONE-VIP" => 2200000,
                "ZONE-EV" => 1600000,
                "ZONE-TH" => 1500000,
                _ => 1200000
            };

        int discount = months switch
        {
            12 => 15,
            6 => 10,
            3 => 5,
            _ => 0
        };

        double factor = (100 - discount) / 100.0;
        int total = (int)Math.Round(baseMonthly * months * factor);
        return (baseMonthly, discount, total);
    }

    public (bool Ok, string Message, MonthlyPass? Pass) RegisterMonthlyPass(
        string customerName,
        string customerPhone,
        string licensePlate,
        string vehicleType,
        string slotCode,
        int months)
    {
        lock (_lock)
        {
            var cleanSlot = (slotCode ?? "").Trim().ToUpperInvariant();
            var cleanPlate = (licensePlate ?? "").Trim().ToUpperInvariant();

            if (string.IsNullOrWhiteSpace(cleanPlate) || cleanPlate.Length < 5)
            {
                return (false, "Vui lòng nhập biển số xe hợp lệ để đăng ký gói vé tháng.", null);
            }

            if (months is not (1 or 3 or 6 or 12))
            {
                months = 1;
            }

            var slot = _slots.FirstOrDefault(s => s.SlotCode.Equals(cleanSlot, StringComparison.OrdinalIgnoreCase));
            if (slot is null)
            {
                return (false, $"Không tìm thấy mã ô đỗ {cleanSlot}.", null);
            }

            // Kiểm tra khóa PCCC tầng hầm B1 với xe điện
            bool isEv = vehicleType is "EV_CAR" or "EV_BIKE";
            if (slot.ZoneId == 3 && isEv)
            {
                return (false, "Khóa an toàn PCCC: Tầng hầm B1 (Zone TH) không nhận đăng ký vé tháng cho xe điện.", null);
            }

            // Kiểm tra khóa trùng ô
            var existingPassOnSlot = _monthlyPasses.FirstOrDefault(m =>
                m.Status == "ACTIVE" &&
                m.SlotCode.Equals(cleanSlot, StringComparison.OrdinalIgnoreCase));

            if (existingPassOnSlot is not null || slot.Status != "AVAILABLE")
            {
                return (false, $"Khóa trùng ô: Vị trí {cleanSlot} đã có xe cố định hoặc không còn trống. Vui lòng chọn ô trống khác.", null);
            }

            var existingPassOnPlate = _monthlyPasses.FirstOrDefault(m =>
                m.Status == "ACTIVE" &&
                m.LicensePlate.Equals(cleanPlate, StringComparison.OrdinalIgnoreCase));

            if (existingPassOnPlate is not null)
            {
                return (false, $"Biển số {cleanPlate} đang có gói vé tháng hiệu lực ({existingPassOnPlate.PassCode}) tại ô {existingPassOnPlate.SlotCode}. Bạn có thể bấm Gia hạn gói hiện có.", null);
            }

            var zone = _zones.FirstOrDefault(z => z.Id == slot.ZoneId) ?? _zones[1];
            var (baseMonthly, discount, total) = ComputeMonthlyPassPricing(zone.ZoneCode, vehicleType, months);

            var passCode = $"QR-MP-{DateTime.Now:yyMMdd}-{Guid.NewGuid().ToString("N")[..4].ToUpperInvariant()}";
            var now = DateTimeOffset.UtcNow;

            var pass = new MonthlyPass
            {
                Id = ++_nextPassId,
                PassCode = passCode,
                CustomerName = string.IsNullOrWhiteSpace(customerName) ? "Phạm Minh Khách" : customerName.Trim(),
                CustomerPhone = string.IsNullOrWhiteSpace(customerPhone) ? "0906789012" : customerPhone.Trim(),
                LicensePlate = cleanPlate,
                VehicleType = vehicleType,
                ZoneCode = zone.ZoneCode,
                SlotCode = slot.SlotCode,
                Months = months,
                DiscountPercent = discount,
                MonthlyBasePrice = baseMonthly,
                TotalAmount = total,
                StartDate = now,
                EndDate = now.AddMonths(months),
                Status = "ACTIVE",
                CreatedAt = now
            };

            // Khóa ô đỗ cố định cho vé tháng
            slot.Status = "RESERVED";
            slot.CurrentPlate = cleanPlate;
            slot.UpdatedAt = now;

            _monthlyPasses.Insert(0, pass);
            return (true, $"Đăng ký thành công gói vé tháng {months} tháng tại ô cố định {slot.SlotCode} (Ưu đãi -{discount}%).", pass);
        }
    }

    public (bool Ok, string Message, MonthlyPass? Pass) RenewMonthlyPass(long passId, int addMonths)
    {
        lock (_lock)
        {
            var pass = _monthlyPasses.FirstOrDefault(m => m.Id == passId);
            if (pass is null)
            {
                return (false, "Không tìm thấy gói vé tháng cần gia hạn.", null);
            }

            if (addMonths is not (1 or 3 or 6 or 12))
            {
                addMonths = 3;
            }

            var (baseMonthly, discount, addedAmount) = ComputeMonthlyPassPricing(pass.ZoneCode, pass.VehicleType, addMonths);
            pass.Months += addMonths;
            pass.DiscountPercent = Math.Max(pass.DiscountPercent, discount);
            pass.MonthlyBasePrice = baseMonthly;
            pass.TotalAmount += addedAmount;
            pass.EndDate = (pass.EndDate > DateTimeOffset.UtcNow ? pass.EndDate : DateTimeOffset.UtcNow).AddMonths(addMonths);
            pass.Status = "ACTIVE";

            return (true, $"Đã gia hạn gói vé tháng {pass.PassCode} (Ô {pass.SlotCode}) thêm {addMonths} tháng (Ưu đãi kỳ gia hạn -{discount}%).", pass);
        }
    }

    // =========================================================================
    // US32 (PSang275): Quản lý danh sách tài khoản người dùng & phân quyền 6 vai trò
    // Quy tắc bảo mật: Chỉ duy nhất 01 tài khoản ADMIN gốc, không cho tạo thêm hoặc gán vai trò ADMIN
    // =========================================================================
    private static readonly HashSet<string> ValidAssignableRoles = new(StringComparer.OrdinalIgnoreCase)
    {
        "MANAGER", "GATE_STAFF", "ACCOUNTANT", "TECHNICIAN", "CUSTOMER"
    };

    public (bool Ok, string Message, User? User) CreateUser(
        string username,
        string fullName,
        string? phone,
        string? email,
        string role,
        string? password)
    {
        lock (_lock)
        {
            var cleanUser = (username ?? "").Trim().ToLowerInvariant();
            if (string.IsNullOrWhiteSpace(cleanUser) || cleanUser.Length < 3)
            {
                return (false, "Tên đăng nhập phải có ít nhất 3 ký tự.", null);
            }

            if (_users.Any(u => u.Username.Equals(cleanUser, StringComparison.OrdinalIgnoreCase)))
            {
                return (false, $"Tên đăng nhập \"{cleanUser}\" đã tồn tại trên hệ thống.", null);
            }

            var normalizedRole = (role ?? "CUSTOMER").Trim().ToUpperInvariant();
            if (normalizedRole == "ADMIN")
            {
                return (false, "Hệ thống chỉ cho phép duy nhất 01 tài khoản Quản trị viên (ADMIN). Không thể tạo thêm Admin.", null);
            }
            if (!ValidAssignableRoles.Contains(normalizedRole))
            {
                normalizedRole = "CUSTOMER";
            }

            var newUser = new User
            {
                Id = ++_nextUserId,
                Username = cleanUser,
                PasswordHash = string.IsNullOrWhiteSpace(password) ? "123456" : password.Trim(),
                FullName = string.IsNullOrWhiteSpace(fullName) ? cleanUser : fullName.Trim(),
                Phone = string.IsNullOrWhiteSpace(phone) ? "0901234567" : phone.Trim(),
                Email = string.IsNullOrWhiteSpace(email) ? $"{cleanUser}@smartpark.vn" : email.Trim(),
                Role = normalizedRole,
                Status = "ACTIVE",
                CreatedAt = DateTimeOffset.UtcNow
            };

            _users.Add(newUser);
            return (true, $"Đã tạo tài khoản \"{newUser.Username}\" với vai trò {newUser.Role}.", newUser);
        }
    }

    public (bool Ok, string Message, User? User) UpdateUserRoleAndStatus(
        long id,
        string? fullName,
        string? phone,
        string? role,
        string? status)
    {
        lock (_lock)
        {
            var user = _users.FirstOrDefault(u => u.Id == id);
            if (user is null)
            {
                return (false, "Không tìm thấy tài khoản người dùng.", null);
            }

            if (!string.IsNullOrWhiteSpace(fullName))
            {
                user.FullName = fullName.Trim();
            }

            if (!string.IsNullOrWhiteSpace(phone))
            {
                user.Phone = phone.Trim();
            }

            if (!string.IsNullOrWhiteSpace(role))
            {
                var normalizedRole = role.Trim().ToUpperInvariant();
                if (normalizedRole == "ADMIN" && !user.Username.Equals("admin", StringComparison.OrdinalIgnoreCase))
                {
                    return (false, "Hệ thống chỉ cho phép duy nhất 01 tài khoản Quản trị viên (ADMIN). Không thể gán quyền Admin cho tài khoản khác.", null);
                }
                if (user.Username.Equals("admin", StringComparison.OrdinalIgnoreCase) && normalizedRole != "ADMIN")
                {
                    return (false, "Không thể hạ quyền tài khoản Quản trị viên gốc (admin).", null);
                }
                if (ValidAssignableRoles.Contains(normalizedRole))
                {
                    user.Role = normalizedRole;
                }
            }

            if (!string.IsNullOrWhiteSpace(status))
            {
                var normalizedStatus = status.Trim().ToUpperInvariant();
                if (normalizedStatus is "ACTIVE" or "LOCKED")
                {
                    if (user.Username.Equals("admin", StringComparison.OrdinalIgnoreCase) && normalizedStatus == "LOCKED")
                    {
                        return (false, "Không thể khóa tài khoản Quản trị viên gốc (admin).", null);
                    }
                    user.Status = normalizedStatus;
                }
            }

            return (true, $"Đã cập nhật phân quyền tài khoản \"{user.Username}\" ({user.Role} • {user.Status}).", user);
        }
    }

    public (bool Ok, string Message) DeleteUser(long id)
    {
        lock (_lock)
        {
            var user = _users.FirstOrDefault(u => u.Id == id);
            if (user is null)
            {
                return (false, "Không tìm thấy tài khoản cần xóa.");
            }

            if (user.Username.Equals("admin", StringComparison.OrdinalIgnoreCase))
            {
                return (false, "Không thể xóa tài khoản Quản trị viên gốc (admin).");
            }

            _users.Remove(user);
            return (true, $"Đã xóa tài khoản \"{user.Username}\".");
        }
    }

    private static List<ParkingZone> BuildInitialZones() =>
    [
        new() { Id = 1, ZoneCode = "ZONE-EV", ZoneName = "Zone EV — Khu Chuyên biệt Xe Điện (Trụ sạc VinFast)", VehicleType = "CAR", HourlyRate = 20000, OvernightRate = 140000, Description = "37 chỗ (12 Ô tô điện EV-O01..O12 & 25 Xe máy điện EV-X01..X25) • 12 Trụ sạc VinFast 4.500đ/kWh • Vách ngăn PCCC" },
        new() { Id = 2, ZoneCode = "ZONE-NT", ZoneName = "Zone NT — Khu Ngoài Trời (Ô tô & Xe máy xăng)", VehicleType = "CAR", HourlyRate = 15000, OvernightRate = 100000, Description = "65 chỗ (20 Ô tô xăng NT-O01..O20 & 45 Xe máy xăng NT-X01..X45) • Bãi mặt đất thoáng rộng sát lối ra chính" },
        new() { Id = 3, ZoneCode = "ZONE-TH", ZoneName = "Zone TH — Tầng Hầm B1 (Chỉ nhận xe xăng - PCCC)", VehicleType = "CAR", HourlyRate = 20000, OvernightRate = 130000, Description = "40 chỗ (10 Ô tô xăng TH-O01..O10 & 30 Xe máy xăng TH-X01..X30) • Quy định an toàn PCCC không nhận xe điện" },
        new() { Id = 4, ZoneCode = "ZONE-VIP", ZoneName = "Zone VIP — Khu VIP Mái Che (Sát cổng chính)", VehicleType = "CAR", HourlyRate = 30000, OvernightRate = 180000, Description = "8 chỗ Ô tô xăng (VIP-O01..O08) • Có mái che riêng sát cổng kiểm soát, ưu tiên đặt lịch trước" }
    ];

    private static List<ParkingSlot> BuildInitial150Slots()
    {
        var list = new List<ParkingSlot>(150);
        long id = 1;

        var sampleOccupiedPlates = new[]
        {
            "51K-888.99", "30H-123.45", "59X3-678.90", "51H-889.99", "65A-555.66",
            "43A-789.01", "50F-246.80", "59T2-345.67", "60A-999.88", "51G-456.12",
            "59P2-456.78", "51L-333.22", "61A-112.23", "59S1-888.11", "72A-654.32"
        };
        var reservedPlates = new[]
        {
            "51K-901.23", "59E1-234.56", "30K-567.89", "51H-678.12", "59X1-345.89",
            "59M2-789.45", "59N1-456.23", "51G-890.34", "59U1-678.34", "51K-777.99", "30A-888.68"
        };
        int occIdx = 0;
        int resIdx = 0;

        void AddGroup(long zoneId, string zonePrefix, string typePrefix, int count, string dbVehicleType, (string Status, int Count)[] counts)
        {
            var pool = new List<string>(count);
            foreach (var item in counts)
            {
                for (int i = 0; i < item.Count; i++) pool.Add(item.Status);
            }

            var arranged = new string[count];
            int idx = 0;
            for (int i = 0; i < count; i++)
            {
                while (arranged[idx] != null) idx = (idx + 1) % count;
                arranged[idx] = pool[i];
                idx = (idx + 3) % count;
            }

            for (int i = 1; i <= count; i++)
            {
                var st = arranged[i - 1];
                string? plate = null;
                if (st == "OCCUPIED")
                {
                    plate = sampleOccupiedPlates[occIdx++ % sampleOccupiedPlates.Length];
                }
                else if (st == "RESERVED")
                {
                    plate = reservedPlates[resIdx++ % reservedPlates.Length];
                }

                list.Add(new ParkingSlot
                {
                    Id = id++,
                    ZoneId = zoneId,
                    SlotCode = $"{zonePrefix}-{typePrefix}{i:D2}",
                    VehicleType = dbVehicleType,
                    Status = st,
                    CurrentPlate = plate,
                    UpdatedAt = DateTimeOffset.UtcNow
                });
            }
        }

        // 1. ZONE EV (37 slots: 13 AVAILABLE, 22 OCCUPIED [incl. 12 charging], 2 RESERVED)
        AddGroup(1, "EV", "O", 12, "CAR", [("AVAILABLE", 4), ("OCCUPIED", 7), ("RESERVED", 1)]);
        AddGroup(1, "EV", "X", 25, "MOTORBIKE", [("AVAILABLE", 9), ("OCCUPIED", 15), ("RESERVED", 1)]);

        // 2. ZONE NT (65 slots: 23 AVAILABLE, 37 OCCUPIED, 5 RESERVED)
        AddGroup(2, "NT", "O", 20, "CAR", [("AVAILABLE", 7), ("OCCUPIED", 11), ("RESERVED", 2)]);
        AddGroup(2, "NT", "X", 45, "MOTORBIKE", [("AVAILABLE", 16), ("OCCUPIED", 26), ("RESERVED", 3)]);

        // 3. ZONE TH (40 slots: 13 AVAILABLE, 25 OCCUPIED, 2 RESERVED)
        AddGroup(3, "TH", "O", 10, "CAR", [("AVAILABLE", 3), ("OCCUPIED", 6), ("RESERVED", 1)]);
        AddGroup(3, "TH", "X", 30, "MOTORBIKE", [("AVAILABLE", 10), ("OCCUPIED", 19), ("RESERVED", 1)]);

        // 4. ZONE VIP (8 slots: 3 AVAILABLE, 3 OCCUPIED, 2 RESERVED)
        AddGroup(4, "VIP", "O", 8, "CAR", [("AVAILABLE", 3), ("OCCUPIED", 3), ("RESERVED", 2)]);

        return list;
    }

    private static List<Vehicle> BuildInitialVehicles() =>
    [
        new() { Id = 1, OwnerName = "Nguyễn Phước Sang", OwnerPhone = "0901234567", LicensePlate = "51K-888.99", VehicleType = "CAR", Brand = "VinFast VF8 Eco", Color = "Trắng", IsDefault = true, CreatedAt = DateTimeOffset.UtcNow.AddDays(-5) },
        new() { Id = 2, OwnerName = "Phạm Minh Khách", OwnerPhone = "0906789012", LicensePlate = "51K-901.23", VehicleType = "CAR", Brand = "VinFast VF9 Plus", Color = "Xanh Navy", IsDefault = true, CreatedAt = DateTimeOffset.UtcNow.AddDays(-4) },
        new() { Id = 3, OwnerName = "Võ Việt Thắng", OwnerPhone = "0912345678", LicensePlate = "30K-567.89", VehicleType = "CAR", Brand = "Mazda CX-5", Color = "Đỏ", IsDefault = false, CreatedAt = DateTimeOffset.UtcNow.AddDays(-3) },
        new() { Id = 4, OwnerName = "Đoàn Tiến Đạt", OwnerPhone = "0987654321", LicensePlate = "59E1-234.56", VehicleType = "MOTORBIKE", Brand = "VinFast Feliz S", Color = "Bạc", IsDefault = false, CreatedAt = DateTimeOffset.UtcNow.AddDays(-2) }
    ];

    private static List<Booking> BuildInitialBookings(List<ParkingSlot> slots)
    {
        var reservedSlots = slots.Where(s => s.Status == "RESERVED").ToList();
        var customers = new (string Name, string Phone)[]
        {
            ("Phạm Minh Khách", "0906789012"),
            ("Nguyễn Hoàng Nam", "0913456789"),
            ("Trần Thu Hà", "0988123456"),
            ("Lê Quốc Bảo", "0909334455"),
            ("Vũ Minh Tuấn", "0977665544"),
            ("Đặng Thảo Vy", "0933221100")
        };

        var list = new List<Booking>();
        long bId = 1;
        foreach (var s in reservedSlots)
        {
            var cust = customers[(int)(bId - 1) % customers.Length];
            list.Add(new Booking
            {
                Id = bId,
                BookingCode = $"QR-BK-261118-{1000 + bId}",
                CustomerName = cust.Name,
                CustomerPhone = cust.Phone,
                LicensePlate = s.CurrentPlate ?? $"51K-90{bId:D1}.23",
                VehicleType = s.VehicleType,
                SlotId = s.Id,
                SlotCode = s.SlotCode,
                StartTime = DateTimeOffset.UtcNow.AddMinutes(-90),
                EndTime = DateTimeOffset.UtcNow.AddMinutes(30),
                Status = "RESERVED",
                CreatedAt = DateTimeOffset.UtcNow.AddMinutes(-20 * bId)
            });
            bId++;
        }
        return list;
    }

    private static List<ParkingSession> BuildInitialSessions() =>
    [
        // Active sessions waiting for Check-out fee calculation (US11 & US21)
        new() { Id = 1, QrToken = "QR-IN-261118-2001", BookingId = 1, SlotId = 2, SlotCode = "EV-O02", LicensePlate = "51K-888.99", VehicleType = "CAR", CustomerName = "Nguyễn Phước Sang", CheckInTime = DateTimeOffset.UtcNow.AddHours(-2.5), DurationHours = 2.5m, FeeAmount = 0, PaymentMethod = "QR_TRANSFER", Status = "ACTIVE", Notes = "Ô tô điện đang đỗ & sạc tại trụ VinFast #02 (18.5 kWh)" },
        new() { Id = 2, QrToken = "QR-IN-261118-2002", BookingId = 2, SlotId = 39, SlotCode = "NT-O02", LicensePlate = "30H-123.45", VehicleType = "CAR", CustomerName = "Nguyễn Hoàng Nam", CheckInTime = DateTimeOffset.UtcNow.AddHours(-3.5), DurationHours = 3.5m, FeeAmount = 0, PaymentMethod = "CASH", Status = "ACTIVE", Notes = "Ô tô xăng khu Ngoài trời (Quá giờ đặt trước 1.0 giờ)" },
        new() { Id = 3, QrToken = "QR-IN-261118-2003", BookingId = 3, SlotId = 144, SlotCode = "VIP-O02", LicensePlate = "65A-555.66", VehicleType = "CAR", CustomerName = "Lê Thị Thu Ngân", CheckInTime = DateTimeOffset.UtcNow.AddHours(-2.0), DurationHours = 2.0m, FeeAmount = 0, PaymentMethod = "QR_TRANSFER", Status = "ACTIVE", Notes = "Khu VIP Mái che sát cổng chính" },
        new() { Id = 4, QrToken = "QR-IN-261118-2004", BookingId = 4, SlotId = 104, SlotCode = "TH-O02", LicensePlate = "51H-889.99", VehicleType = "CAR", CustomerName = "Trần Minh Quân", CheckInTime = DateTimeOffset.UtcNow.AddHours(-1.5), DurationHours = 1.5m, FeeAmount = 0, PaymentMethod = "QR_TRANSFER", Status = "ACTIVE", Notes = "Ô tô xăng Tầng hầm B1" },
        // Completed sessions
        new() { Id = 5, QrToken = "QR-BK-261118-0981", BookingId = null, SlotId = 3, SlotCode = "EV-O03", LicensePlate = "50F-246.80", VehicleType = "CAR", CustomerName = "Phạm Minh Khách", CheckInTime = DateTimeOffset.UtcNow.AddHours(-4), CheckOutTime = DateTimeOffset.UtcNow.AddHours(-2), DurationHours = 2.0m, FeeAmount = 107500, PaymentMethod = "QR_TRANSFER", Status = "COMPLETED", Notes = "Đỗ 2h + sạc 15 kWh" },
        new() { Id = 6, QrToken = "QR-BK-261118-0982", BookingId = null, SlotId = 40, SlotCode = "NT-O03", LicensePlate = "43A-789.01", VehicleType = "CAR", CustomerName = "Vũ Minh Tuấn", CheckInTime = DateTimeOffset.UtcNow.AddHours(-5), CheckOutTime = DateTimeOffset.UtcNow.AddHours(-2), DurationHours = 3.0m, FeeAmount = 45000, PaymentMethod = "CASH", Status = "COMPLETED", Notes = "Đỗ 3h khu NT" },
        new() { Id = 7, QrToken = "QR-BK-261118-0983", BookingId = null, SlotId = 145, SlotCode = "VIP-O03", LicensePlate = "60A-999.88", VehicleType = "CAR", CustomerName = "Đặng Thảo Vy", CheckInTime = DateTimeOffset.UtcNow.AddHours(-4), CheckOutTime = DateTimeOffset.UtcNow.AddHours(-1.5), DurationHours = 2.5m, FeeAmount = 75000, PaymentMethod = "QR_TRANSFER", Status = "COMPLETED", Notes = "Khu VIP Mái che" }
    ];

    private static List<User> BuildInitialUsers() =>
    [
        new() { Id = 1, Username = "admin", PasswordHash = "123456", FullName = "Nguyễn Phước Sang (Admin)", Phone = "0901234567", Email = "sang.admin@smartpark.vn", Role = "ADMIN", Status = "ACTIVE" },
        new() { Id = 2, Username = "manager", PasswordHash = "123456", FullName = "Võ Việt Thắng (Quản Lý Ca)", Phone = "0912345678", Email = "thang.manager@smartpark.vn", Role = "MANAGER", Status = "ACTIVE" },
        new() { Id = 3, Username = "gate_staff", PasswordHash = "123456", FullName = "Đoàn Tiến Đạt (NV Trực Cổng)", Phone = "0987654321", Email = "dat.gate@smartpark.vn", Role = "GATE_STAFF", Status = "ACTIVE" },
        new() { Id = 4, Username = "accountant", PasswordHash = "123456", FullName = "Lê Thị Thu Ngân (Kế Toán)", Phone = "0904567890", Email = "ngan.acc@smartpark.vn", Role = "ACCOUNTANT", Status = "ACTIVE" },
        new() { Id = 5, Username = "technician", PasswordHash = "123456", FullName = "Trần Kỹ Thuật (Kỹ Thuật Viên)", Phone = "0905678901", Email = "kythuat.ev@smartpark.vn", Role = "TECHNICIAN", Status = "ACTIVE" },
        new() { Id = 6, Username = "customer", PasswordHash = "123456", FullName = "Phạm Minh Khách (Khách Hàng)", Phone = "0906789012", Email = "minhkhach@smartpark.vn", Role = "CUSTOMER", Status = "ACTIVE" }
    ];

    private static List<MonthlyPass> BuildInitialMonthlyPasses() =>
    [
        new()
        {
            Id = 1,
            PassCode = "QR-MP-261101-8801",
            CustomerName = "Phạm Minh Khách",
            CustomerPhone = "0906789012",
            LicensePlate = "51K-901.23",
            VehicleType = "EV_CAR",
            ZoneCode = "ZONE-EV",
            SlotCode = "EV-O04",
            Months = 3,
            DiscountPercent = 5,
            MonthlyBasePrice = 1600000,
            TotalAmount = 4560000,
            StartDate = DateTimeOffset.UtcNow.AddDays(-17),
            EndDate = DateTimeOffset.UtcNow.AddMonths(3).AddDays(-17),
            Status = "ACTIVE",
            CreatedAt = DateTimeOffset.UtcNow.AddDays(-17)
        },
        new()
        {
            Id = 2,
            PassCode = "QR-MP-261105-8802",
            CustomerName = "Lê Thị Thu Ngân",
            CustomerPhone = "0904567890",
            LicensePlate = "51K-777.99",
            VehicleType = "GAS_CAR",
            ZoneCode = "ZONE-VIP",
            SlotCode = "VIP-O05",
            Months = 6,
            DiscountPercent = 10,
            MonthlyBasePrice = 2200000,
            TotalAmount = 11880000,
            StartDate = DateTimeOffset.UtcNow.AddDays(-13),
            EndDate = DateTimeOffset.UtcNow.AddMonths(6).AddDays(-13),
            Status = "ACTIVE",
            CreatedAt = DateTimeOffset.UtcNow.AddDays(-13)
        }
    ];
}
