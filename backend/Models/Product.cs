namespace ChronoVault.Api.Models;

public class Product
{
    public int ProductId { get; set; }
    public int CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string? Model { get; set; }
    public string? Description { get; set; }
    public int Price { get; set; }
    public int StockQuantity { get; set; }
    public string? ImageUrl { get; set; }
    public double Rating { get; set; }
    public int Reviews { get; set; }
    public Category? Category { get; set; }
}
