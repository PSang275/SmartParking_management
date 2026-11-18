using System.Text.Json.Serialization;

namespace SmartParking_management.Models;

public class FeeBreakdown
{
    [JsonPropertyName("qr_token")]
    public string QrToken { get; set; } = string.Empty;

    [JsonPropertyName("license_plate")]
    public string LicensePlate { get; set; } = string.Empty;

    [JsonPropertyName("customer_name")]
    public string CustomerName { get; set; } = string.Empty;

    [JsonPropertyName("vehicle_type")]
    public string VehicleType { get; set; } = "CAR";

    [JsonPropertyName("slot_code")]
    public string SlotCode { get; set; } = string.Empty;

    [JsonPropertyName("zone_code")]
    public string ZoneCode { get; set; } = string.Empty;

    [JsonPropertyName("zone_name")]
    public string ZoneName { get; set; } = string.Empty;

    [JsonPropertyName("check_in_time")]
    public DateTimeOffset CheckInTime { get; set; }

    [JsonPropertyName("expected_end_time")]
    public DateTimeOffset? ExpectedEndTime { get; set; }

    [JsonPropertyName("check_out_time")]
    public DateTimeOffset CheckOutTime { get; set; }

    [JsonPropertyName("raw_minutes")]
    public int RawMinutes { get; set; }

    [JsonPropertyName("billed_hours")]
    public double BilledHours { get; set; }

    [JsonPropertyName("hourly_rate")]
    public int HourlyRate { get; set; }

    [JsonPropertyName("base_fee")]
    public int BaseFee { get; set; }

    [JsonPropertyName("overtime_minutes")]
    public int OvertimeMinutes { get; set; }

    [JsonPropertyName("overtime_hours")]
    public double OvertimeHours { get; set; }

    [JsonPropertyName("overtime_surcharge")]
    public int OvertimeSurcharge { get; set; }

    [JsonPropertyName("ev_kwh")]
    public double EvKwh { get; set; }

    [JsonPropertyName("ev_rate_per_kwh")]
    public int EvRatePerKwh { get; set; } = 4500;

    [JsonPropertyName("ev_charging_fee")]
    public int EvChargingFee { get; set; }

    [JsonPropertyName("idle_minutes")]
    public int IdleMinutes { get; set; }

    [JsonPropertyName("idle_fee")]
    public int IdleFee { get; set; }

    [JsonPropertyName("total_fee")]
    public int TotalFee { get; set; }

    [JsonPropertyName("formula_summary")]
    public string FormulaSummary { get; set; } = string.Empty;
}
