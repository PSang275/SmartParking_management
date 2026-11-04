using Microsoft.AspNetCore.Mvc;
using SmartParking_management.Data;

namespace SmartParking_management.Controllers;

public class VehicleController(AppDbContext db) : Controller
{
    [HttpGet]
    public async Task<IActionResult> Index()
    {
        var vm = await db.BuildViewModelAsync(
            activeTab: "vehicles-tab",
            pageTitle: "Đăng ký & Quản lý Hồ sơ Phương tiện",
            pageSubtitle: "VehicleController • Lưu trữ biển số xe ô tô / xe máy trên Supabase Cloud");
        return View("~/Views/Home/Index.cshtml", vm);
    }
}
