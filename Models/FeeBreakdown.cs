using System.Text.Json.Serialization;

namespace SmartParking_management.Models;

public class FeeBreakdown
{
    [JsonPropertyName("raw_minutes")]
    public int RawMinutes { get; set; }

    [JsonPropertyName("billed_hours")]
    public double BilledHours { get; set; }

    [JsonPropertyName("hourly_rate")]
    public int HourlyRate { get; set; }

    [JsonPropertyName("base_fee")]
    public int BaseFee { get; set; }

    [JsonPropertyName("overtime_surcharge")]
    public int OvertimeSurcharge { get; set; }

    [JsonPropertyName("total_fee")]
    public int TotalFee { get; set; }

    [JsonPropertyName("engine")]
    public string Engine { get; set; } = "Tính tự động theo khung 30 phút";

    public static FeeBreakdown Calculate(int hourlyRate, int durationMinutes, bool isOvertime = false)
    {
        int clampedMinutes = Math.Max(durationMinutes, 1);
        int halfHourBlocks = (clampedMinutes + 29) / 30;
        double billedHours = Math.Max(1.0, halfHourBlocks * 0.5);
        int baseFee = (int)Math.Round(billedHours * hourlyRate);
        int surcharge = isOvertime ? (int)Math.Round(baseFee * 0.20) : 0;

        return new FeeBreakdown
        {
            RawMinutes = clampedMinutes,
            BilledHours = billedHours,
            HourlyRate = hourlyRate,
            BaseFee = baseFee,
            OvertimeSurcharge = surcharge,
            TotalFee = baseFee + surcharge
        };
    }
}
