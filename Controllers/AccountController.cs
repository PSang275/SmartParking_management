using Microsoft.AspNetCore.Mvc;
using SmartParking_management.Data;

namespace SmartParking_management.Controllers;

public class AccountController(AppDbContext db) : Controller
{
    [HttpGet]
    public async Task<IActionResult> Login()
    {
        var users = await db.GetUsersAsync();
        return View(users);
    }

    [HttpGet]
    public IActionResult Register()
    {
        return View();
    }

    [HttpGet]
    public async Task<IActionResult> Profile()
    {
        var users = await db.GetUsersAsync();
        return View(users);
    }
}
