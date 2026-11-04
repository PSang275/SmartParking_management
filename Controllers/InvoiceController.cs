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
            pageSubtitle: "Tra cứu biên lai thanh toán và lịch sử các lượt gửi xe tại bãi");
        return View("~/Views/Home/Index.cshtml", vm);
    }
}
