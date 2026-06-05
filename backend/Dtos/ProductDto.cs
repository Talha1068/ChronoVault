namespace ChronoVault.Api.Dtos;

public record ProductDto(
    int Id,
    string Name,
    string Brand,
    string? Model,
    string? Description,
    int Price,
    int StockQuantity,
    string? Image,
    string Category,
    double Rating,
    int Reviews,
    bool InStock
);
