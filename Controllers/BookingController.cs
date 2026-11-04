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
            pageSubtitle: "Chọn vị trí đỗ xe đang trống theo khung giờ và nhận thẻ vé mã QR tức thì");
        return View("~/Views/Home/Index.cshtml", vm);
    }

    [HttpGet]
    public async Task<IActionResult> MyBookings()
    {
        var vm = await db.BuildViewModelAsync(
            activeTab: "booking-tab",
            pageTitle: "Danh sách Phiếu Đặt chỗ của Khách hàng",
            pageSubtitle: "Tra cứu trạng thái phiếu đặt chỗ và mã vé QR vào bãi");
        return View("~/Views/Home/Index.cshtml", vm);
    }
}
