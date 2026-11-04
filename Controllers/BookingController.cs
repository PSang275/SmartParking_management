using Microsoft.AspNetCore.Mvc;
using SmartParking_management.Data;

namespace SmartParking_management.Controllers;

public class BookingController(AppDbContext db) : Controller
{
    [HttpGet]
    public async Task<IActionResult> Index() => await Book();

    [HttpGet]
    public async Task<IActionResult> Book()
    {
        var vm = await db.BuildViewModelAsync(
            activeTab: "booking-tab",
            pageTitle: "Đặt chỗ Đỗ xe Trực tuyến & Cấp mã QR",
            pageSubtitle: "BookingController • Quản lý đặt trước vị trí đỗ và phát hành thẻ vé QR SVG");
        return View("~/Views/Home/Index.cshtml", vm);
    }

    [HttpGet]
    public async Task<IActionResult> MyBookings()
    {
        var vm = await db.BuildViewModelAsync(
            activeTab: "booking-tab",
            pageTitle: "Danh sách Phiếu Đặt chỗ của Khách hàng",
            pageSubtitle: "BookingController • Tra cứu trạng thái RESERVED / CHECKED_IN / COMPLETED");
        return View("~/Views/Home/Index.cshtml", vm);
    }
}
