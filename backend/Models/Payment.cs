namespace ChronoVault.Api.Models;

public class Payment
{
    public int PaymentId { get; set; }
    public int OrderId { get; set; }
    public string PaymentMethod { get; set; } = "COD";
    public string Status { get; set; } = "Pending";
    public int Amount { get; set; }
    public string? TransactionReference { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Order? Order { get; set; }
}
