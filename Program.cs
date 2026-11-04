using SmartParking_management.Data;

// Ensure ContentRootPath and WebRootPath always resolve to the project folder containing wwwroot,
// even when Visual Studio launches the executable from bin/Debug/net10.0 in Folder View.
var contentRoot = Directory.GetCurrentDirectory();
if (!Directory.Exists(Path.Combine(contentRoot, "wwwroot")))
{
    var dir = new DirectoryInfo(AppContext.BaseDirectory);
    while (dir is not null)
    {
        if (Directory.Exists(Path.Combine(dir.FullName, "wwwroot")))
        {
            contentRoot = dir.FullName;
            break;
        }
        dir = dir.Parent;
    }
}

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    ContentRootPath = contentRoot,
    WebRootPath = Path.Combine(contentRoot, "wwwroot")
});

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
