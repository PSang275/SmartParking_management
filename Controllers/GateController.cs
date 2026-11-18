using Microsoft.AspNetCore.Mvc;
using SmartParking_management.Data;

namespace SmartParking_management.Controllers;

public class GateController(AppDbContext db) : Controller
{
    [HttpGet("/Gate")]
    [HttpGet("/Gate/Index")]
    public async Task<IActionResult> Index()
    {
        var vm = await db.BuildViewModelAsync(
            activeTab: "checkout",
            pageTitle: "Trạm Kiểm Soát Cổng — Quét Camera QR & Tính Phí Tự Động",
            pageSubtitle: "Giao diện nghiệp vụ dành riêng cho Nhân viên Trực cổng (GATE_STAFF)",
            currentRole: "GATE_STAFF");
        return View("~/Views/Gate/Index.cshtml", vm);
    }
}
