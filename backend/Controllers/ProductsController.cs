using ChronoVault.Api.Data;
using ChronoVault.Api.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ChronoVault.Api.Controllers;

[ApiController]
[Route("api/products")]
public class ProductsController(ChronoVaultDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetProducts()
    {
        var products = await dbContext.Products
            .Include(p => p.Category)
            .OrderBy(p => p.ProductId)
            .Select(p => new ProductDto(
                p.ProductId,
                p.Name,
                p.Brand,
                p.Model,
                p.Description,
                p.Price,
                p.StockQuantity,
                p.ImageUrl,
                p.Category != null ? p.Category.CategoryName : "Unknown",
                p.Rating,
                p.Reviews,
                p.StockQuantity > 0
            ))
            .ToListAsync();

        return Ok(products);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetProduct(int id)
    {
        var product = await dbContext.Products
            .Include(p => p.Category)
            .Where(p => p.ProductId == id)
            .Select(p => new ProductDto(
                p.ProductId,
                p.Name,
                p.Brand,
                p.Model,
                p.Description,
                p.Price,
                p.StockQuantity,
                p.ImageUrl,
                p.Category != null ? p.Category.CategoryName : "Unknown",
                p.Rating,
                p.Reviews,
                p.StockQuantity > 0
            ))
            .FirstOrDefaultAsync();

        return product is null ? NotFound(new { message = "Product not found" }) : Ok(product);
    }
}
