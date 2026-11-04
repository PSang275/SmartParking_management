using Microsoft.AspNetCore.Mvc;
using SmartParking_management.Data;
using SmartParking_management.Models;

namespace SmartParking_management.Controllers;

public class HomeController(AppDbContext db) : Controller
{
    [HttpGet]
    public async Task<IActionResult> Index()
    {
        var vm = await db.BuildViewModelAsync(
            activeTab: "map-tab",
            pageTitle: "Sơ đồ Bãi xe & Kiểm tra Chỗ trống Thời gian thực",
            pageSubtitle: "Kiến trúc ASP.NET Core MVC (C#) đồng bộ trực tiếp Supabase Cloud PostgreSQL");
        return View(vm);
    }

    [HttpGet("/api/status")]
    public IActionResult ApiStatus() => Json(new
    {
        status = "online",
        engine = "ASP.NET Core MVC (.NET 10.0 - Visual Studio 2026)",
        architecture = "Model-View-Controller (MVC)",
        supabase_project = db.SupabaseProjectId,
        supabase_url = db.SupabaseUrl
    });

    [HttpGet("/api/calculate-fee")]
    public IActionResult CalculateFee([FromQuery] int rate = 20000, [FromQuery] int minutes = 60, [FromQuery] int overtime = 0)
    {
        var breakdown = FeeBreakdown.Calculate(rate, minutes, overtime == 1);
        return Json(breakdown);
    }

    [HttpGet("/api/slots")]
    public async Task<IActionResult> GetSlots()
    {
        var slots = await db.GetSlotsAsync();
        return Json(slots);
    }
}
