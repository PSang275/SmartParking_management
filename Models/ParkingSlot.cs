using System.Text.Json.Serialization;

namespace SmartParking_management.Models;

public class ParkingSlot
{
    [JsonPropertyName("id")]
    public long Id { get; set; }

    [JsonPropertyName("zone_id")]
    public long ZoneId { get; set; }

    [JsonPropertyName("slot_code")]
    public string SlotCode { get; set; } = string.Empty;

    [JsonPropertyName("vehicle_type")]
    public string VehicleType { get; set; } = "CAR";

    [JsonPropertyName("status")]
    public string Status { get; set; } = "AVAILABLE";

    [JsonPropertyName("current_plate")]
    public string? CurrentPlate { get; set; }

    [JsonPropertyName("updated_at")]
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}
