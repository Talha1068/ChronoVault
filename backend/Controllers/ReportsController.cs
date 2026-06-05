using ChronoVault.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ChronoVault.Api.Controllers;

[ApiController]
[Route("api/reports")]
[Authorize(Roles = "admin")]
public class ReportsController(ChronoVaultDbContext dbContext) : ControllerBase
{
    [HttpGet("sales-summary")]
    public async Task<IActionResult> GetSalesSummary()
    {
        var orders = dbContext.Orders.AsQueryable();

        var dailySales = await orders
            .GroupBy(o => o.OrderDate.Date)
            .Select(g => new { date = g.Key, totalOrders = g.Count(), totalRevenue = g.Sum(x => x.TotalAmount) })
            .OrderByDescending(x => x.date)
            .Take(30)
            .ToListAsync();

        var monthlySales = await orders
            .GroupBy(o => new { o.OrderDate.Year, o.OrderDate.Month })
            .Select(g => new { g.Key.Year, g.Key.Month, totalOrders = g.Count(), totalRevenue = g.Sum(x => x.TotalAmount) })
            .OrderByDescending(x => x.Year)
            .ThenByDescending(x => x.Month)
            .Take(12)
            .ToListAsync();

        var productSales = await dbContext.OrderItems
            .Join(dbContext.Products, oi => oi.ProductId, p => p.ProductId, (oi, p) => new { oi, p })
            .GroupBy(x => new { x.p.ProductId, x.p.Name })
            .Select(g => new
            {
                productId = g.Key.ProductId,
                productName = g.Key.Name,
                unitsSold = g.Sum(x => x.oi.Quantity),
                revenue = g.Sum(x => x.oi.Quantity * x.oi.UnitPrice)
            })
            .OrderByDescending(x => x.unitsSold)
            .Take(20)
            .ToListAsync();

        var customerHistory = await dbContext.Orders
            .GroupBy(o => o.CustomerEmail)
            .Select(g => new
            {
                customerEmail = g.Key,
                ordersCount = g.Count(),
                totalSpent = g.Sum(x => x.TotalAmount)
            })
            .OrderByDescending(x => x.totalSpent)
            .Take(20)
            .ToListAsync();

        var totalRevenue = await dbContext.Orders.SumAsync(o => (int?)o.TotalAmount) ?? 0;

        return Ok(new
        {
            totalRevenue,
            dailySales,
            monthlySales,
            productSales,
            customerHistory
        });
    }
}
