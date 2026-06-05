using ChronoVault.Api.Data;
using ChronoVault.Api.Dtos;
using ChronoVault.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ChronoVault.Api.Controllers;

[ApiController]
[Route("api/orders")]
public class OrdersController(ChronoVaultDbContext dbContext) : ControllerBase
{
    private static readonly HashSet<string> AllowedStatuses = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];
    private static readonly HashSet<string> AllowedPaymentMethods = ["COD", "ONLINE"];

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
        {
            return Unauthorized(new { message = "Invalid authentication token" });
        }

        if (request.Items.Count == 0 || string.IsNullOrWhiteSpace(request.ShippingAddress))
        {
            return BadRequest(new { message = "Incomplete order details" });
        }

        if (!AllowedPaymentMethods.Contains(request.PaymentMethod?.Trim().ToUpperInvariant() ?? string.Empty))
        {
            return BadRequest(new { message = "Payment method must be COD or ONLINE" });
        }

        var user = await dbContext.Users.FirstOrDefaultAsync(u => u.UserId == userId);
        if (user is null)
        {
            return NotFound(new { message = "User not found" });
        }

        var productIds = request.Items.Select(i => i.ProductId).Distinct().ToList();
        var products = await dbContext.Products.Where(p => productIds.Contains(p.ProductId)).ToListAsync();
        if (products.Count != productIds.Count)
        {
            return NotFound(new { message = "One or more products were not found" });
        }

        foreach (var item in request.Items)
        {
            if (item.Quantity <= 0)
            {
                return BadRequest(new { message = "Item quantity must be greater than zero" });
            }
            var product = products.First(p => p.ProductId == item.ProductId);
            if (product.StockQuantity < item.Quantity)
            {
                return BadRequest(new { message = $"Insufficient stock for product {item.ProductId}" });
            }
        }

        var totalAmount = request.Items.Sum(item =>
        {
            var product = products.First(p => p.ProductId == item.ProductId);
            return product.Price * item.Quantity;
        });

        var order = new Order
        {
            UserId = userId,
            TotalAmount = totalAmount,
            ShippingAddress = request.ShippingAddress,
            CustomerEmail = request.CustomerEmail,
            CustomerPhone = request.CustomerPhone,
            Status = "Pending",
            OrderDate = DateTime.UtcNow
        };

        dbContext.Orders.Add(order);
        await dbContext.SaveChangesAsync();

        foreach (var item in request.Items)
        {
            var product = products.First(p => p.ProductId == item.ProductId);
            product.StockQuantity -= item.Quantity;

            dbContext.OrderItems.Add(new OrderItem
            {
                OrderId = order.OrderId,
                ProductId = product.ProductId,
                Quantity = item.Quantity,
                UnitPrice = product.Price
            });
        }

        var normalizedPaymentMethod = request.PaymentMethod?.Trim().ToUpperInvariant() ?? "COD";
        dbContext.Payments.Add(new Payment
        {
            OrderId = order.OrderId,
            Amount = order.TotalAmount,
            PaymentMethod = normalizedPaymentMethod,
            Status = normalizedPaymentMethod == "ONLINE" ? "Paid" : "Pending",
            TransactionReference = normalizedPaymentMethod == "ONLINE" ? $"TXN-{Guid.NewGuid():N}" : null,
            CreatedAt = DateTime.UtcNow
        });

        await dbContext.SaveChangesAsync();

        return Created(string.Empty, new CreateOrderResponse("Order placed successfully", order.OrderId, $"CHR-{order.OrderId:000000}"));
    }

    [HttpGet("my")]
    [Authorize]
    public async Task<IActionResult> GetMyOrders()
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
        {
            return Unauthorized(new { message = "Invalid authentication token" });
        }

        var orders = await dbContext.Orders
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.OrderDate)
            .Select(o => new OrderSummaryDto(
                o.OrderId,
                $"CHR-{o.OrderId:000000}",
                o.Status,
                o.TotalAmount,
                o.ShippingAddress,
                o.CustomerEmail,
                o.CustomerPhone,
                o.OrderDate,
                dbContext.Payments.Where(p => p.OrderId == o.OrderId).Select(p => p.PaymentMethod).FirstOrDefault() ?? "COD",
                dbContext.Payments.Where(p => p.OrderId == o.OrderId).Select(p => p.Status).FirstOrDefault() ?? "Pending"
            ))
            .ToListAsync();

        return Ok(orders);
    }

    [HttpGet("{orderId:int}")]
    [Authorize]
    public async Task<IActionResult> GetOrderById(int orderId)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
        {
            return Unauthorized(new { message = "Invalid authentication token" });
        }

        var role = User.FindFirstValue(ClaimTypes.Role) ?? "customer";

        var order = await dbContext.Orders
            .FirstOrDefaultAsync(o => o.OrderId == orderId);

        if (order is null)
        {
            return NotFound(new { message = "Order not found" });
        }

        if (role != "admin" && order.UserId != userId)
        {
            return Forbid();
        }

        var items = await dbContext.OrderItems
            .Where(oi => oi.OrderId == orderId)
            .Join(
                dbContext.Products,
                oi => oi.ProductId,
                p => p.ProductId,
                (oi, p) => new OrderItemDto(p.ProductId, p.Name, oi.Quantity, oi.UnitPrice)
            )
            .ToListAsync();

        var payment = await dbContext.Payments
            .Where(p => p.OrderId == order.OrderId)
            .OrderByDescending(p => p.CreatedAt)
            .FirstOrDefaultAsync();

        var summary = new OrderSummaryDto(
            order.OrderId,
            $"CHR-{order.OrderId:000000}",
            order.Status,
            order.TotalAmount,
            order.ShippingAddress,
            order.CustomerEmail,
            order.CustomerPhone,
            order.OrderDate,
            payment?.PaymentMethod ?? "COD",
            payment?.Status ?? "Pending"
        );

        return Ok(new OrderDetailsDto(summary, items));
    }

    [HttpPut("{orderId:int}/status")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> UpdateOrderStatus(int orderId, [FromBody] UpdateOrderStatusRequest request)
    {
        var status = request.Status?.Trim() ?? string.Empty;
        if (!AllowedStatuses.Contains(status))
        {
            return BadRequest(new { message = "Invalid order status" });
        }

        var order = await dbContext.Orders.FirstOrDefaultAsync(o => o.OrderId == orderId);
        if (order is null)
        {
            return NotFound(new { message = "Order not found" });
        }

        order.Status = status;
        await dbContext.SaveChangesAsync();

        return Ok(new { message = "Order status updated", orderId, status });
    }
}
