using System.Text.Json.Serialization;

namespace SmartParking_management.Models;

public class ParkingSession
{
    [JsonPropertyName("id")]
    public long Id { get; set; }

    [JsonPropertyName("qr_token")]
    public string QrToken { get; set; } = string.Empty;

    [JsonPropertyName("booking_id")]
    public long? BookingId { get; set; }

    [JsonPropertyName("slot_id")]
    public long SlotId { get; set; }

    [JsonPropertyName("slot_code")]
    public string SlotCode { get; set; } = string.Empty;

    [JsonPropertyName("license_plate")]
    public string LicensePlate { get; set; } = string.Empty;

    [JsonPropertyName("vehicle_type")]
    public string VehicleType { get; set; } = "CAR";

    [JsonPropertyName("customer_name")]
    public string? CustomerName { get; set; }

    [JsonPropertyName("check_in_time")]
    public DateTimeOffset CheckInTime { get; set; } = DateTimeOffset.UtcNow;

    [JsonPropertyName("check_out_time")]
    public DateTimeOffset? CheckOutTime { get; set; }

    [JsonPropertyName("duration_hours")]
    public decimal DurationHours { get; set; }

    [JsonPropertyName("fee_amount")]
    public int FeeAmount { get; set; }

    [JsonPropertyName("payment_method")]
    public string PaymentMethod { get; set; } = "CASH";

    [JsonPropertyName("status")]
    public string Status { get; set; } = "ACTIVE";

    [JsonPropertyName("notes")]
    public string? Notes { get; set; }
}
