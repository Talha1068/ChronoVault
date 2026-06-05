namespace ChronoVault.Api.Models;

public class Order
{
    public int OrderId { get; set; }
    public int UserId { get; set; }
    public int TotalAmount { get; set; }
    public string ShippingAddress { get; set; } = string.Empty;
    public string Status { get; set; } = "Placed";
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public User? User { get; set; }
    public List<OrderItem> OrderItems { get; set; } = [];
}
