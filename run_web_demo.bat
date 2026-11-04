@echo off
chcp 65001 >nul
echo ============================================================================
echo   SMARTPARKING_MANAGEMENT - ASP.NET CORE MVC (VISUAL STUDIO 2026 + SUPABASE)
echo   Supabase Project: https://jgvegymigpbgqmoylljf.supabase.co
echo   Local MVC Server: http://localhost:5080
echo ============================================================================
start "" "http://localhost:5080"
dotnet run --project "%~dp0SmartParking_management.csproj" --urls "http://localhost:5080"
