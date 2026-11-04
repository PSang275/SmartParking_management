using Microsoft.AspNetCore.Mvc;
using SmartParking_management.Data;
using SmartParking_management.Models;

namespace SmartParking_management.Controllers;

public class CheckInOutController(AppDbContext db) : Controller
{
    [HttpGet]
    public async Task<IActionResult> Index()
    {
        var vm = await db.BuildViewModelAsync(
            activeTab: "qr-tab",
            pageTitle: "Cổng Kiểm soát QR Check-in / Check-out & Tính phí",
            pageSubtitle: "CheckInOutController • Quét mã QR vào/ra bãi và tính phí tự động theo block 0.5h");
        return View("~/Views/Home/Index.cshtml", vm);
    }

    [HttpGet]
    public IActionResult CalculateFee(int rate = 25000, int minutes = 145, bool overtime = false)
    {
        return Json(FeeBreakdown.Calculate(rate, minutes, overtime));
    }
}
