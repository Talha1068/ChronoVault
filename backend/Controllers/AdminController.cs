using ChronoVault.Api.Data;
using ChronoVault.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ChronoVault.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "admin")]
public class AdminController(ChronoVaultDbContext dbContext) : ControllerBase
{
    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var totalProducts = await dbContext.Products.CountAsync();
        var totalOrders = await dbContext.Orders.CountAsync();
        var totalUsers = await dbContext.Users.CountAsync(u => u.Role == "customer");
        var totalRevenue = await dbContext.Orders.SumAsync(o => (int?)o.TotalAmount) ?? 0;
        var pendingOrders = await dbContext.Orders.CountAsync(o => o.Status == "Pending");
        var lowStockCount = await dbContext.Products.CountAsync(p => p.StockQuantity <= 5);
        var recentOrders = await dbContext.Orders
            .OrderByDescending(o => o.OrderDate)
            .Take(5)
            .Select(o => new
            {
                orderId = o.OrderId,
                orderNumber = "CHR-" + o.OrderId.ToString("D6"),
                status = o.Status,
                totalAmount = o.TotalAmount,
                orderDate = o.OrderDate,
                customerEmail = o.CustomerEmail
            })
            .ToListAsync();

        return Ok(new
        {
            totalProducts,
            totalOrders,
            totalUsers,
            totalRevenue,
            pendingOrders,
            lowStockCount,
            recentOrders
        });
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await dbContext.Users
            .OrderBy(u => u.UserId)
            .Select(u => new
            {
                id = u.UserId,
                name = u.FullName,
                email = u.Email,
                phone = u.PhoneNumber,
                address = u.Address,
                role = u.Role,
                orderCount = dbContext.Orders.Count(o => o.UserId == u.UserId),
                totalSpent = dbContext.Orders.Where(o => o.UserId == u.UserId).Sum(o => (int?)o.TotalAmount) ?? 0
            })
            .ToListAsync();

        return Ok(users);
    }

    [HttpGet("orders")]
    public async Task<IActionResult> GetAllOrders()
    {
        var orders = await dbContext.Orders
            .OrderByDescending(o => o.OrderDate)
            .Select(o => new
            {
                orderId = o.OrderId,
                orderNumber = "CHR-" + o.OrderId.ToString("D6"),
                status = o.Status,
                totalAmount = o.TotalAmount,
                shippingAddress = o.ShippingAddress,
                customerEmail = o.CustomerEmail,
                customerPhone = o.CustomerPhone,
                orderDate = o.OrderDate,
                paymentMethod = dbContext.Payments.Where(p => p.OrderId == o.OrderId).Select(p => p.PaymentMethod).FirstOrDefault() ?? "COD",
                paymentStatus = dbContext.Payments.Where(p => p.OrderId == o.OrderId).Select(p => p.Status).FirstOrDefault() ?? "Pending",
                userName = dbContext.Users.Where(u => u.UserId == o.UserId).Select(u => u.FullName).FirstOrDefault() ?? "Unknown",
                itemCount = dbContext.OrderItems.Count(oi => oi.OrderId == o.OrderId)
            })
            .ToListAsync();

        return Ok(orders);
    }

    [HttpGet("products")]
    public async Task<IActionResult> GetProducts()
    {
        var products = await dbContext.Products
            .Include(p => p.Category)
            .OrderBy(p => p.ProductId)
            .Select(p => new
            {
                id = p.ProductId,
                name = p.Name,
                brand = p.Brand,
                model = p.Model,
                description = p.Description,
                price = p.Price,
                stockQuantity = p.StockQuantity,
                image = p.ImageUrl,
                categoryId = p.CategoryId,
                category = p.Category != null ? p.Category.CategoryName : "Unknown"
            })
            .ToListAsync();

        return Ok(products);
    }

    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await dbContext.Categories
            .OrderBy(c => c.CategoryName)
            .Select(c => new { id = c.CategoryId, name = c.CategoryName, description = c.Description })
            .ToListAsync();
        return Ok(categories);
    }

    [HttpPost("categories")]
    public async Task<IActionResult> CreateCategory([FromBody] Category category)
    {
        if (string.IsNullOrWhiteSpace(category.CategoryName))
        {
            return BadRequest(new { message = "Category name is required" });
        }

        var exists = await dbContext.Categories.AnyAsync(c => c.CategoryName == category.CategoryName.Trim());
        if (exists)
        {
            return Conflict(new { message = "Category already exists" });
        }

        var newCategory = new Category
        {
            CategoryName = category.CategoryName.Trim(),
            Description = category.Description?.Trim()
        };

        dbContext.Categories.Add(newCategory);
        await dbContext.SaveChangesAsync();
        return Ok(new { id = newCategory.CategoryId, name = newCategory.CategoryName, description = newCategory.Description });
    }

    [HttpPut("categories/{id:int}")]
    public async Task<IActionResult> UpdateCategory(int id, [FromBody] Category request)
    {
        if (string.IsNullOrWhiteSpace(request.CategoryName))
        {
            return BadRequest(new { message = "Category name is required" });
        }

        var category = await dbContext.Categories.FirstOrDefaultAsync(c => c.CategoryId == id);
        if (category is null)
        {
            return NotFound(new { message = "Category not found" });
        }

        category.CategoryName = request.CategoryName.Trim();
        category.Description = request.Description?.Trim();
        await dbContext.SaveChangesAsync();
        return Ok(new { message = "Category updated" });
    }

    [HttpDelete("categories/{id:int}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var category = await dbContext.Categories
            .Include(c => c.Products)
            .FirstOrDefaultAsync(c => c.CategoryId == id);
        if (category is null)
        {
            return NotFound(new { message = "Category not found" });
        }

        if (category.Products.Count > 0)
        {
            return BadRequest(new { message = "Cannot delete category with existing products" });
        }

        dbContext.Categories.Remove(category);
        await dbContext.SaveChangesAsync();
        return Ok(new { message = "Category deleted" });
    }

    [HttpPost("products")]
    public async Task<IActionResult> CreateProduct([FromBody] Product product)
    {
        if (string.IsNullOrWhiteSpace(product.Name) || string.IsNullOrWhiteSpace(product.Brand))
        {
            return BadRequest(new { message = "Product name and brand are required" });
        }

        var categoryExists = await dbContext.Categories.AnyAsync(c => c.CategoryId == product.CategoryId);
        if (!categoryExists)
        {
            return BadRequest(new { message = "Category not found" });
        }

        dbContext.Products.Add(product);
        await dbContext.SaveChangesAsync();
        return Ok(new { id = product.ProductId });
    }

    [HttpPut("products/{id:int}")]
    public async Task<IActionResult> UpdateProduct(int id, [FromBody] Product request)
    {
        var product = await dbContext.Products.FirstOrDefaultAsync(p => p.ProductId == id);
        if (product is null)
        {
            return NotFound(new { message = "Product not found" });
        }

        product.Name = request.Name.Trim();
        product.Brand = request.Brand.Trim();
        product.Model = request.Model?.Trim();
        product.Description = request.Description?.Trim();
        product.Price = request.Price;
        product.StockQuantity = request.StockQuantity;
        product.ImageUrl = request.ImageUrl?.Trim();
        product.CategoryId = request.CategoryId;
        await dbContext.SaveChangesAsync();

        return Ok(new { message = "Product updated" });
    }

    [HttpDelete("products/{id:int}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var product = await dbContext.Products.FirstOrDefaultAsync(p => p.ProductId == id);
        if (product is null)
        {
            return NotFound(new { message = "Product not found" });
        }

        dbContext.Products.Remove(product);
        await dbContext.SaveChangesAsync();
        return Ok(new { message = "Product deleted" });
    }

    [HttpGet("inventory/low-stock")]
    public async Task<IActionResult> GetLowStock([FromQuery] int threshold = 5)
    {
        var lowStock = await dbContext.Products
            .Where(p => p.StockQuantity <= threshold)
            .OrderBy(p => p.StockQuantity)
            .Select(p => new
            {
                id = p.ProductId,
                name = p.Name,
                brand = p.Brand,
                stockQuantity = p.StockQuantity
            })
            .ToListAsync();

        return Ok(lowStock);
    }
}
