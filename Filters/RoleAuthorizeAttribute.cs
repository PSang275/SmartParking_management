using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace SmartParking_management.Filters;

/// <summary>
/// Bộ lọc kiểm tra phân quyền theo vai trò người dùng (ADMIN, STAFF, CUSTOMER) - US17
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class RoleAuthorizeAttribute : ActionFilterAttribute
{
    private readonly string[] _allowedRoles;

    public RoleAuthorizeAttribute(params string[] allowedRoles)
    {
        _allowedRoles = allowedRoles;
    }

    public override void OnActionExecuting(ActionExecutingContext context)
    {
        var role = context.HttpContext.Request.Cookies["SmartPark_Role"] ?? "ADMIN";
        if (_allowedRoles.Length > 0 && !_allowedRoles.Contains(role, StringComparer.OrdinalIgnoreCase))
        {
            context.Result = new RedirectToActionResult("Login", "Account", null);
            return;
        }
        base.OnActionExecuting(context);
    }
}
