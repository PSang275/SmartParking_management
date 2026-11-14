using Microsoft.AspNetCore.Mvc;
using SmartParking_management.Data;

namespace SmartParking_management.Controllers;

public class HomeController(AppDbContext db) : Controller
{
    [HttpGet]
    public async Task<IActionResult> Index()
    {
        var vm = await db.BuildViewModelAsync(
            activeTab: "public-landing",
            pageTitle: "SmartPark — Đỗ xe thông minh, không lo hết chỗ",
            pageSubtitle: "Tìm & Đặt chỗ đỗ xe thông minh trong 30 giây");
        return View("~/Views/Home/PublicLanding.cshtml", vm);
    }

    [HttpGet("/api/status")]
    public IActionResult ApiStatus() => Json(new
    {
        status = "online",
        engine = "SmartPark Auto-Sync Engine",
        supabase_project = db.SupabaseProjectId,
        supabase_url = db.SupabaseUrl
    });

    [HttpGet("/api/slots")]
    public async Task<IActionResult> GetSlots()
    {
        var slots = await db.GetSlotsAsync();
        return Json(slots);
    }
}
