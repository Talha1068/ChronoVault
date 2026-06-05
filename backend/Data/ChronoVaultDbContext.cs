using ChronoVault.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ChronoVault.Api.Data;

public class ChronoVaultDbContext(DbContextOptions<ChronoVaultDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Wishlist> Wishlists => Set<Wishlist>();
    public DbSet<WishlistItem> WishlistItems => Set<WishlistItem>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>().ToTable("Users").HasKey(u => u.UserId);
        modelBuilder.Entity<Category>().ToTable("Categories").HasKey(c => c.CategoryId);
        modelBuilder.Entity<Product>().ToTable("Products").HasKey(p => p.ProductId);
        modelBuilder.Entity<Order>().ToTable("Orders").HasKey(o => o.OrderId);
        modelBuilder.Entity<OrderItem>().ToTable("OrderItems").HasKey(oi => oi.ItemId);
        modelBuilder.Entity<Cart>().ToTable("Carts").HasKey(c => c.CartId);
        modelBuilder.Entity<CartItem>().ToTable("CartItems").HasKey(ci => ci.CartItemId);
        modelBuilder.Entity<Wishlist>().ToTable("Wishlists").HasKey(w => w.WishlistId);
        modelBuilder.Entity<WishlistItem>().ToTable("WishlistItems").HasKey(wi => wi.WishlistItemId);
        modelBuilder.Entity<Payment>().ToTable("Payments").HasKey(p => p.PaymentId);
        modelBuilder.Entity<PasswordResetToken>().ToTable("PasswordResetTokens").HasKey(t => t.PasswordResetTokenId);

        modelBuilder.Entity<Product>()
            .HasOne(p => p.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.CategoryId);

        modelBuilder.Entity<Order>()
            .HasOne(o => o.User)
            .WithMany()
            .HasForeignKey(o => o.UserId);

        modelBuilder.Entity<OrderItem>()
            .HasOne(oi => oi.Order)
            .WithMany(o => o.OrderItems)
            .HasForeignKey(oi => oi.OrderId);

        modelBuilder.Entity<OrderItem>()
            .HasOne(oi => oi.Product)
            .WithMany()
            .HasForeignKey(oi => oi.ProductId);

        modelBuilder.Entity<Payment>()
            .HasOne(p => p.Order)
            .WithMany()
            .HasForeignKey(p => p.OrderId);

        modelBuilder.Entity<Cart>()
            .HasOne(c => c.User)
            .WithMany()
            .HasForeignKey(c => c.UserId);

        modelBuilder.Entity<CartItem>()
            .HasOne(ci => ci.Cart)
            .WithMany(c => c.Items)
            .HasForeignKey(ci => ci.CartId);

        modelBuilder.Entity<CartItem>()
            .HasOne(ci => ci.Product)
            .WithMany()
            .HasForeignKey(ci => ci.ProductId);

        modelBuilder.Entity<Wishlist>()
            .HasOne(w => w.User)
            .WithMany()
            .HasForeignKey(w => w.UserId);

        modelBuilder.Entity<WishlistItem>()
            .HasOne(wi => wi.Wishlist)
            .WithMany(w => w.Items)
            .HasForeignKey(wi => wi.WishlistId);

        modelBuilder.Entity<WishlistItem>()
            .HasOne(wi => wi.Product)
            .WithMany()
            .HasForeignKey(wi => wi.ProductId);

        modelBuilder.Entity<PasswordResetToken>()
            .HasOne(t => t.User)
            .WithMany()
            .HasForeignKey(t => t.UserId);
    }
}
