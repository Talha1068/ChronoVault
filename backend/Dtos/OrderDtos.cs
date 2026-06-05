namespace ChronoVault.Api.Dtos;

public record OrderItemRequest(int ProductId, int Quantity);
public record CreateOrderRequest(
    List<OrderItemRequest> Items,
    string ShippingAddress,
    string CustomerEmail,
    string CustomerPhone,
    string PaymentMethod
);
public record CreateOrderResponse(string Message, int OrderId, string OrderNumber);

public record OrderSummaryDto(
    int OrderId,
    string OrderNumber,
    string Status,
    int TotalAmount,
    string ShippingAddress,
    string CustomerEmail,
    string CustomerPhone,
    DateTime OrderDate,
    string PaymentMethod,
    string PaymentStatus
);

public record OrderItemDto(int ProductId, string ProductName, int Quantity, int UnitPrice);

public record OrderDetailsDto(OrderSummaryDto Order, List<OrderItemDto> Items);

public record UpdateOrderStatusRequest(string Status);
