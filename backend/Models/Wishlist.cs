namespace ChronoVault.Api.Models;

public class Wishlist
{
    public int WishlistId { get; set; }
    public int UserId { get; set; }
    public User? User { get; set; }
    public List<WishlistItem> Items { get; set; } = [];
}
