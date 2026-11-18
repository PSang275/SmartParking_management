using System.Text.Json.Serialization;

namespace SmartParking_management.Models;

public class MonthlyPass
{
    [JsonPropertyName("id")]
    public long Id { get; set; }

    [JsonPropertyName("pass_code")]
    public string PassCode { get; set; } = string.Empty;

    [JsonPropertyName("customer_name")]
    public string CustomerName { get; set; } = string.Empty;

    [JsonPropertyName("customer_phone")]
    public string CustomerPhone { get; set; } = string.Empty;

    [JsonPropertyName("license_plate")]
    public string LicensePlate { get; set; } = string.Empty;

    [JsonPropertyName("vehicle_type")]
    public string VehicleType { get; set; } = "CAR";

    [JsonPropertyName("zone_code")]
    public string ZoneCode { get; set; } = "ZONE-NT";

    [JsonPropertyName("slot_code")]
    public string SlotCode { get; set; } = string.Empty;

    [JsonPropertyName("months")]
    public int Months { get; set; } = 1;

    [JsonPropertyName("discount_percent")]
    public int DiscountPercent { get; set; }

    [JsonPropertyName("monthly_base_price")]
    public int MonthlyBasePrice { get; set; }

    [JsonPropertyName("total_amount")]
    public int TotalAmount { get; set; }

    [JsonPropertyName("start_date")]
    public DateTimeOffset StartDate { get; set; } = DateTimeOffset.UtcNow;

    [JsonPropertyName("end_date")]
    public DateTimeOffset EndDate { get; set; } = DateTimeOffset.UtcNow.AddMonths(1);

    [JsonPropertyName("status")]
    public string Status { get; set; } = "ACTIVE";

    [JsonPropertyName("created_at")]
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
