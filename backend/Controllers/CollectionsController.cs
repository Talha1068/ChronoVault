using ChronoVault.Api.Data;
using ChronoVault.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ChronoVault.Api.Controllers;

[ApiController]
[Authorize]
[Route("api")]
public class CollectionsController(ChronoVaultDbContext dbContext) : ControllerBase
{
    public record CartItemRequest(int ProductId, int Quantity);
    public record WishlistItemRequest(int ProductId);

    [HttpGet("cart")]
    public async Task<IActionResult> GetCart()
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
        {
            return Unauthorized(new { message = "Invalid authentication token" });
        }

        var cart = await EnsureCartAsync(userId);
        var items = await dbContext.CartItems
            .Where(ci => ci.CartId == cart.CartId)
            .Join(dbContext.Products, ci => ci.ProductId, p => p.ProductId, (ci, p) => new
            {
                productId = p.ProductId,
                name = p.Name,
                brand = p.Brand,
                price = p.Price,
                image = p.ImageUrl,
                quantity = ci.Quantity,
                inStock = p.StockQuantity > 0
            })
            .ToListAsync();

        return Ok(new
        {
            items,
            total = items.Sum(i => i.price * i.quantity)
        });
    }

    [HttpPost("cart/items")]
    public async Task<IActionResult> AddOrUpdateCartItem([FromBody] CartItemRequest request)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
        {
            return Unauthorized(new { message = "Invalid authentication token" });
        }

        if (request.Quantity <= 0)
        {
            return BadRequest(new { message = "Quantity must be greater than 0" });
        }

        var product = await dbContext.Products.FirstOrDefaultAsync(p => p.ProductId == request.ProductId);
        if (product is null)
        {
            return NotFound(new { message = "Product not found" });
        }

        if (request.Quantity > product.StockQuantity)
        {
            return BadRequest(new { message = "Requested quantity exceeds stock" });
        }

        var cart = await EnsureCartAsync(userId);
        var existing = await dbContext.CartItems.FirstOrDefaultAsync(ci => ci.CartId == cart.CartId && ci.ProductId == request.ProductId);
        if (existing is null)
        {
            dbContext.CartItems.Add(new CartItem { CartId = cart.CartId, ProductId = request.ProductId, Quantity = request.Quantity });
        }
        else
        {
            existing.Quantity = request.Quantity;
        }

        await dbContext.SaveChangesAsync();
        return Ok(new { message = "Cart updated" });
    }

    [HttpDelete("cart/items/{productId:int}")]
    public async Task<IActionResult> RemoveCartItem(int productId)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
        {
            return Unauthorized(new { message = "Invalid authentication token" });
        }

        var cart = await EnsureCartAsync(userId);
        var item = await dbContext.CartItems.FirstOrDefaultAsync(ci => ci.CartId == cart.CartId && ci.ProductId == productId);
        if (item is null)
        {
            return NotFound(new { message = "Item not found in cart" });
        }

        dbContext.CartItems.Remove(item);
        await dbContext.SaveChangesAsync();
        return Ok(new { message = "Item removed from cart" });
    }

    [HttpGet("wishlist")]
    public async Task<IActionResult> GetWishlist()
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
        {
            return Unauthorized(new { message = "Invalid authentication token" });
        }

        var wishlist = await EnsureWishlistAsync(userId);
        var items = await dbContext.WishlistItems
            .Where(wi => wi.WishlistId == wishlist.WishlistId)
            .Join(dbContext.Products, wi => wi.ProductId, p => p.ProductId, (wi, p) => new
            {
                productId = p.ProductId,
                name = p.Name,
                brand = p.Brand,
                price = p.Price,
                image = p.ImageUrl,
                inStock = p.StockQuantity > 0
            })
            .ToListAsync();

        return Ok(items);
    }

    [HttpPost("wishlist/items")]
    public async Task<IActionResult> AddWishlistItem([FromBody] WishlistItemRequest request)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
        {
            return Unauthorized(new { message = "Invalid authentication token" });
        }

        var productExists = await dbContext.Products.AnyAsync(p => p.ProductId == request.ProductId);
        if (!productExists)
        {
            return NotFound(new { message = "Product not found" });
        }

        var wishlist = await EnsureWishlistAsync(userId);
        var exists = await dbContext.WishlistItems.AnyAsync(wi => wi.WishlistId == wishlist.WishlistId && wi.ProductId == request.ProductId);
        if (!exists)
        {
            dbContext.WishlistItems.Add(new WishlistItem { WishlistId = wishlist.WishlistId, ProductId = request.ProductId });
            await dbContext.SaveChangesAsync();
        }

        return Ok(new { message = "Wishlist updated" });
    }

    [HttpDelete("wishlist/items/{productId:int}")]
    public async Task<IActionResult> RemoveWishlistItem(int productId)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
        {
            return Unauthorized(new { message = "Invalid authentication token" });
        }

        var wishlist = await EnsureWishlistAsync(userId);
        var item = await dbContext.WishlistItems.FirstOrDefaultAsync(wi => wi.WishlistId == wishlist.WishlistId && wi.ProductId == productId);
        if (item is null)
        {
            return NotFound(new { message = "Wishlist item not found" });
        }

        dbContext.WishlistItems.Remove(item);
        await dbContext.SaveChangesAsync();
        return Ok(new { message = "Wishlist updated" });
    }

    [HttpGet("payments/my")]
    public async Task<IActionResult> GetMyPayments()
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
        {
            return Unauthorized(new { message = "Invalid authentication token" });
        }

        var payments = await dbContext.Payments
            .Join(dbContext.Orders, p => p.OrderId, o => o.OrderId, (p, o) => new { p, o })
            .Where(x => x.o.UserId == userId)
            .OrderByDescending(x => x.p.CreatedAt)
            .Select(x => new
            {
                paymentId = x.p.PaymentId,
                orderNumber = $"CHR-{x.o.OrderId:000000}",
                amount = x.p.Amount,
                method = x.p.PaymentMethod,
                status = x.p.Status,
                transactionReference = x.p.TransactionReference,
                createdAt = x.p.CreatedAt
            })
            .ToListAsync();

        return Ok(payments);
    }

    private async Task<Cart> EnsureCartAsync(int userId)
    {
        var cart = await dbContext.Carts.FirstOrDefaultAsync(c => c.UserId == userId);
        if (cart is not null)
        {
            return cart;
        }

        cart = new Cart { UserId = userId };
        dbContext.Carts.Add(cart);
        await dbContext.SaveChangesAsync();
        return cart;
    }

    private async Task<Wishlist> EnsureWishlistAsync(int userId)
    {
        var wishlist = await dbContext.Wishlists.FirstOrDefaultAsync(w => w.UserId == userId);
        if (wishlist is not null)
        {
            return wishlist;
        }

        wishlist = new Wishlist { UserId = userId };
        dbContext.Wishlists.Add(wishlist);
        await dbContext.SaveChangesAsync();
        return wishlist;
    }
}
