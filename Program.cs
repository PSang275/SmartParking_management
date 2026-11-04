using SmartParking_management.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container (ASP.NET Core MVC)
builder.Services.AddControllersWithViews();
builder.Services.AddHttpClient<AppDbContext>();
builder.Services.AddSingleton<DbInitializer>();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
}

app.UseStaticFiles();
app.UseRouting();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
