using Microsoft.AspNetCore.Mvc;
using SmartParking_management.Data;

namespace SmartParking_management.Controllers;

public class InvoiceController(AppDbContext db) : Controller
{
    [HttpGet]
    public async Task<IActionResult> Index()
    {
        var vm = await db.BuildViewModelAsync(
            activeTab: "history-tab",
            pageTitle: "Lịch sử Xe Vào / Ra & Hóa đơn Thanh toán",
            pageSubtitle: "InvoiceController • Tra cứu biên lai thanh toán và lịch sử phiên gửi xe (parking_sessions)");
        return View("~/Views/Home/Index.cshtml", vm);
    }
}
