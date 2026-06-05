using ChronoVault.Api.Data;
using ChronoVault.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ChronoVault.Api.Services;

public class DatabaseInitializer(ChronoVaultDbContext dbContext)
{
    public async Task SeedAsync()
    {
        await dbContext.Database.EnsureCreatedAsync();
        await EnsureExtendedSchemaAsync();
        await EnsureDefaultAdminAsync();

        if (await dbContext.Products.AnyAsync())
        {
            return;
        }

        var categories = new[]
        {
            new Category { CategoryName = "Luxury", Description = "Luxury watches" },
            new Category { CategoryName = "Sports", Description = "Sports watches" },
            new Category { CategoryName = "Classic", Description = "Classic watches" },
            new Category { CategoryName = "Aviation", Description = "Aviation watches" }
        };
        await dbContext.Categories.AddRangeAsync(categories);
        await dbContext.SaveChangesAsync();

        int CategoryId(string name) => categories.First(c => c.CategoryName == name).CategoryId;

        var products = new[]
        {
            new Product { CategoryId = CategoryId("Luxury"), Name = "Chronograph Elite", Brand = "Rolex", Model = "CE-100", Description = "A masterpiece of precision, featuring a sleek black dial with gold accents. Perfect for formal occasions or daily wear, offering unmatched reliability.", Price = 4500, StockQuantity = 15, ImageUrl = "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=2080&auto=format&fit=crop", Rating = 4.8, Reviews = 124 },
            new Product { CategoryId = CategoryId("Sports"), Name = "Ocean Diver Pro", Brand = "Omega", Model = "OD-220", Description = "Built for the depths, this dive watch boasts 300m water resistance, a luminescent dial, and a robust stainless steel bracelet.", Price = 3200, StockQuantity = 12, ImageUrl = "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?q=80&w=2080&auto=format&fit=crop", Rating = 4.9, Reviews = 89 },
            new Product { CategoryId = CategoryId("Classic"), Name = "Minimalist Heritage", Brand = "Daniel Wellington", Model = "MH-42", Description = "A clean, timeless design with a slim profile and a genuine leather strap. The epitome of modern minimalism.", Price = 250, StockQuantity = 30, ImageUrl = "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=2080&auto=format&fit=crop", Rating = 4.5, Reviews = 312 },
            new Product { CategoryId = CategoryId("Aviation"), Name = "Aero Pilot", Brand = "Breitling", Model = "AP-9", Description = "Designed for aviators, featuring a complex slide rule bezel, dual time zones, and exceptional readability at any altitude.", Price = 5400, StockQuantity = 0, ImageUrl = "https://images.unsplash.com/photo-1622434641406-a158123450f9?q=80&w=2080&auto=format&fit=crop", Rating = 4.7, Reviews = 67 },
            new Product { CategoryId = CategoryId("Sports"), Name = "Eclipse Nova", Brand = "Tag Heuer", Model = "EN-77", Description = "A striking all-black timepiece with subtle red accents. Sporty yet refined, perfect for the modern trendsetter.", Price = 1800, StockQuantity = 20, ImageUrl = "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?q=80&w=2080&auto=format&fit=crop", Rating = 4.6, Reviews = 156 },
            new Product { CategoryId = CategoryId("Luxury"), Name = "Vintage Gold Classic", Brand = "Patek Philippe", Model = "VG-500", Description = "An heirloom piece featuring an 18k gold case, moon phase complication, and a hand-stitched alligator strap.", Price = 12500, StockQuantity = 7, ImageUrl = "https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=2080&auto=format&fit=crop", Rating = 5.0, Reviews = 24 }
        };

        await dbContext.Products.AddRangeAsync(products);
        await dbContext.SaveChangesAsync();
    }

    private async Task EnsureDefaultAdminAsync()
    {
        var adminEmail = "admin@chronovault.com";
        var exists = await dbContext.Users.AnyAsync(u => u.Email == adminEmail);
        if (exists)
        {
            return;
        }

        dbContext.Users.Add(new User
        {
            FullName = "ChronoVault Admin",
            Email = adminEmail,
            Password = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
            Role = "admin",
            PhoneNumber = "0330-3457600",
            Address = "ChronoVault HQ"
        });
        await dbContext.SaveChangesAsync();
    }

    private async Task EnsureExtendedSchemaAsync()
    {
        if (!dbContext.Database.IsSqlServer())
        {
            return;
        }

        const string createPaymentsTable = """
            IF OBJECT_ID('dbo.Payments', 'U') IS NULL
            BEGIN
                CREATE TABLE dbo.Payments(
                    PaymentId INT IDENTITY(1,1) PRIMARY KEY,
                    OrderId INT NOT NULL,
                    PaymentMethod NVARCHAR(50) NOT NULL,
                    Status NVARCHAR(50) NOT NULL,
                    Amount INT NOT NULL,
                    TransactionReference NVARCHAR(100) NULL,
                    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
                    CONSTRAINT FK_Payments_Orders_OrderId FOREIGN KEY (OrderId) REFERENCES dbo.Orders(OrderId)
                );
            END
            """;

        const string createResetTokensTable = """
            IF OBJECT_ID('dbo.PasswordResetTokens', 'U') IS NULL
            BEGIN
                CREATE TABLE dbo.PasswordResetTokens(
                    PasswordResetTokenId INT IDENTITY(1,1) PRIMARY KEY,
                    UserId INT NOT NULL,
                    Token NVARCHAR(200) NOT NULL,
                    ExpiresAtUtc DATETIME2 NOT NULL,
                    UsedAtUtc DATETIME2 NULL,
                    CONSTRAINT FK_PasswordResetTokens_Users_UserId FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId)
                );
            END
            """;

        const string createCartsTable = """
            IF OBJECT_ID('dbo.Carts', 'U') IS NULL
            BEGIN
                CREATE TABLE dbo.Carts(
                    CartId INT IDENTITY(1,1) PRIMARY KEY,
                    UserId INT NOT NULL UNIQUE,
                    CONSTRAINT FK_Carts_Users_UserId FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId)
                );
            END
            """;

        const string createCartItemsTable = """
            IF OBJECT_ID('dbo.CartItems', 'U') IS NULL
            BEGIN
                CREATE TABLE dbo.CartItems(
                    CartItemId INT IDENTITY(1,1) PRIMARY KEY,
                    CartId INT NOT NULL,
                    ProductId INT NOT NULL,
                    Quantity INT NOT NULL,
                    CONSTRAINT FK_CartItems_Carts_CartId FOREIGN KEY (CartId) REFERENCES dbo.Carts(CartId),
                    CONSTRAINT FK_CartItems_Products_ProductId FOREIGN KEY (ProductId) REFERENCES dbo.Products(ProductId),
                    CONSTRAINT UQ_CartItems_CartId_ProductId UNIQUE (CartId, ProductId)
                );
            END
            """;

        const string createWishlistsTable = """
            IF OBJECT_ID('dbo.Wishlists', 'U') IS NULL
            BEGIN
                CREATE TABLE dbo.Wishlists(
                    WishlistId INT IDENTITY(1,1) PRIMARY KEY,
                    UserId INT NOT NULL UNIQUE,
                    CONSTRAINT FK_Wishlists_Users_UserId FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId)
                );
            END
            """;

        const string createWishlistItemsTable = """
            IF OBJECT_ID('dbo.WishlistItems', 'U') IS NULL
            BEGIN
                CREATE TABLE dbo.WishlistItems(
                    WishlistItemId INT IDENTITY(1,1) PRIMARY KEY,
                    WishlistId INT NOT NULL,
                    ProductId INT NOT NULL,
                    CONSTRAINT FK_WishlistItems_Wishlists_WishlistId FOREIGN KEY (WishlistId) REFERENCES dbo.Wishlists(WishlistId),
                    CONSTRAINT FK_WishlistItems_Products_ProductId FOREIGN KEY (ProductId) REFERENCES dbo.Products(ProductId),
                    CONSTRAINT UQ_WishlistItems_WishlistId_ProductId UNIQUE (WishlistId, ProductId)
                );
            END
            """;

        await dbContext.Database.ExecuteSqlRawAsync(createPaymentsTable);
        await dbContext.Database.ExecuteSqlRawAsync(createResetTokensTable);
        await dbContext.Database.ExecuteSqlRawAsync(createCartsTable);
        await dbContext.Database.ExecuteSqlRawAsync(createCartItemsTable);
        await dbContext.Database.ExecuteSqlRawAsync(createWishlistsTable);
        await dbContext.Database.ExecuteSqlRawAsync(createWishlistItemsTable);
    }
}
