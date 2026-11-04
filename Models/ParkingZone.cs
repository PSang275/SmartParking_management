using System.Text.Json.Serialization;

namespace SmartParking_management.Models;

public class ParkingZone
{
    [JsonPropertyName("id")]
    public long Id { get; set; }

    [JsonPropertyName("zone_code")]
    public string ZoneCode { get; set; } = string.Empty;

    [JsonPropertyName("zone_name")]
    public string ZoneName { get; set; } = string.Empty;

    [JsonPropertyName("vehicle_type")]
    public string VehicleType { get; set; } = "CAR";

    [JsonPropertyName("hourly_rate")]
    public int HourlyRate { get; set; } = 20000;

    [JsonPropertyName("overnight_rate")]
    public int OvernightRate { get; set; } = 100000;

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("created_at")]
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
