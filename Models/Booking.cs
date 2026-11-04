using System.Text.Json.Serialization;

namespace SmartParking_management.Models;

public class Booking
{
    [JsonPropertyName("id")]
    public long Id { get; set; }

    [JsonPropertyName("booking_code")]
    public string BookingCode { get; set; } = string.Empty;

    [JsonPropertyName("user_id")]
    public long? UserId { get; set; }

    [JsonPropertyName("customer_name")]
    public string CustomerName { get; set; } = string.Empty;

    [JsonPropertyName("customer_phone")]
    public string? CustomerPhone { get; set; }

    [JsonPropertyName("license_plate")]
    public string LicensePlate { get; set; } = string.Empty;

    [JsonPropertyName("vehicle_type")]
    public string VehicleType { get; set; } = "CAR";

    [JsonPropertyName("slot_id")]
    public long SlotId { get; set; }

    [JsonPropertyName("slot_code")]
    public string SlotCode { get; set; } = string.Empty;

    [JsonPropertyName("start_time")]
    public DateTimeOffset StartTime { get; set; } = DateTimeOffset.UtcNow;

    [JsonPropertyName("end_time")]
    public DateTimeOffset EndTime { get; set; } = DateTimeOffset.UtcNow.AddHours(2);

    [JsonPropertyName("status")]
    public string Status { get; set; } = "RESERVED";

    [JsonPropertyName("created_at")]
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
