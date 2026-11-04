using Microsoft.AspNetCore.Mvc;
using SmartParking_management.Data;

namespace SmartParking_management.Controllers;

public class ParkingSlotController(AppDbContext db) : Controller
{
    [HttpGet]
    public async Task<IActionResult> Index()
    {
        var vm = await db.BuildViewModelAsync(
            activeTab: "slots-tab",
            pageTitle: "Quản lý Vị trí Đỗ xe & Khu vực (Khu A / B / C)",
            pageSubtitle: "ParkingSlotController • Thêm ô đỗ mới, điều chỉnh trạng thái AVAILABLE / MAINTENANCE");
        return View("~/Views/Home/Index.cshtml", vm);
    }
}
