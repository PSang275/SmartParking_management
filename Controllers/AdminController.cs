using Microsoft.AspNetCore.Mvc;
using SmartParking_management.Data;

namespace SmartParking_management.Controllers;

public class AdminController(AppDbContext db) : Controller
{
    [HttpGet]
    public async Task<IActionResult> Index()
    {
        var vm = await db.BuildViewModelAsync(
            activeTab: "dashboard-tab",
            pageTitle: "Dashboard Thống kê Doanh thu & Hiệu suất Bãi xe",
            pageSubtitle: "Phân tích công suất lấp đầy khu A/B/C và báo cáo doanh thu thời gian thực");
        return View("~/Views/Home/Index.cshtml", vm);
    }
}
