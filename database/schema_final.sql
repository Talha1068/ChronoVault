-- ChronoVault Complete Schema (SQL Server)
-- Compatible with ASP.NET Core backend EF models
-- Phase 3: Final integrated schema

IF DB_ID('ChronoVaultDb') IS NULL
BEGIN
    CREATE DATABASE ChronoVaultDb;
END
GO

USE ChronoVaultDb;
GO

-- Drop existing tables in dependency order
IF OBJECT_ID('WishlistItems', 'U') IS NOT NULL DROP TABLE WishlistItems;
IF OBJECT_ID('Wishlists', 'U') IS NOT NULL DROP TABLE Wishlists;
IF OBJECT_ID('CartItems', 'U') IS NOT NULL DROP TABLE CartItems;
IF OBJECT_ID('Carts', 'U') IS NOT NULL DROP TABLE Carts;
IF OBJECT_ID('Payments', 'U') IS NOT NULL DROP TABLE Payments;
IF OBJECT_ID('PasswordResetTokens', 'U') IS NOT NULL DROP TABLE PasswordResetTokens;
IF OBJECT_ID('OrderItems', 'U') IS NOT NULL DROP TABLE OrderItems;
IF OBJECT_ID('Orders', 'U') IS NOT NULL DROP TABLE Orders;
IF OBJECT_ID('Products', 'U') IS NOT NULL DROP TABLE Products;
IF OBJECT_ID('Categories', 'U') IS NOT NULL DROP TABLE Categories;
IF OBJECT_ID('Users', 'U') IS NOT NULL DROP TABLE Users;
GO

-- Core Tables
CREATE TABLE Users (
    UserId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    Password NVARCHAR(255) NOT NULL,
    PhoneNumber NVARCHAR(20) NULL,
    Address NVARCHAR(255) NULL,
    Role NVARCHAR(20) NOT NULL DEFAULT 'customer'
);

CREATE TABLE Categories (
    CategoryId INT IDENTITY(1,1) PRIMARY KEY,
    CategoryName NVARCHAR(50) NOT NULL UNIQUE,
    Description NVARCHAR(255) NULL
);

CREATE TABLE Products (
    ProductId INT IDENTITY(1,1) PRIMARY KEY,
    CategoryId INT NOT NULL,
    Name NVARCHAR(100) NOT NULL,
    Brand NVARCHAR(50) NOT NULL,
    Model NVARCHAR(50) NULL,
    Description NVARCHAR(500) NULL,
    Price INT NOT NULL,
    StockQuantity INT NOT NULL DEFAULT 0,
    ImageUrl NVARCHAR(255) NULL,
    Rating FLOAT NOT NULL DEFAULT 0,
    Reviews INT NOT NULL DEFAULT 0,
    FOREIGN KEY (CategoryId) REFERENCES Categories(CategoryId)
);

CREATE TABLE Orders (
    OrderId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    TotalAmount INT NOT NULL,
    ShippingAddress NVARCHAR(255) NOT NULL,
    Status NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    OrderDate DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CustomerEmail NVARCHAR(100) NOT NULL,
    CustomerPhone NVARCHAR(20) NOT NULL,
    FOREIGN KEY (UserId) REFERENCES Users(UserId)
);

CREATE TABLE OrderItems (
    ItemId INT IDENTITY(1,1) PRIMARY KEY,
    OrderId INT NOT NULL,
    ProductId INT NOT NULL,
    Quantity INT NOT NULL,
    UnitPrice INT NOT NULL,
    FOREIGN KEY (OrderId) REFERENCES Orders(OrderId),
    FOREIGN KEY (ProductId) REFERENCES Products(ProductId)
);

CREATE TABLE Payments (
    PaymentId INT IDENTITY(1,1) PRIMARY KEY,
    OrderId INT NOT NULL,
    PaymentMethod NVARCHAR(50) NOT NULL,
    Status NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    Amount INT NOT NULL,
    TransactionReference NVARCHAR(100) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    FOREIGN KEY (OrderId) REFERENCES Orders(OrderId)
);

-- Cart & Wishlist
CREATE TABLE Carts (
    CartId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL UNIQUE,
    FOREIGN KEY (UserId) REFERENCES Users(UserId)
);

CREATE TABLE CartItems (
    CartItemId INT IDENTITY(1,1) PRIMARY KEY,
    CartId INT NOT NULL,
    ProductId INT NOT NULL,
    Quantity INT NOT NULL,
    FOREIGN KEY (CartId) REFERENCES Carts(CartId),
    FOREIGN KEY (ProductId) REFERENCES Products(ProductId),
    CONSTRAINT UQ_CartItems_CartId_ProductId UNIQUE (CartId, ProductId)
);

CREATE TABLE Wishlists (
    WishlistId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL UNIQUE,
    FOREIGN KEY (UserId) REFERENCES Users(UserId)
);

CREATE TABLE WishlistItems (
    WishlistItemId INT IDENTITY(1,1) PRIMARY KEY,
    WishlistId INT NOT NULL,
    ProductId INT NOT NULL,
    FOREIGN KEY (WishlistId) REFERENCES Wishlists(WishlistId),
    FOREIGN KEY (ProductId) REFERENCES Products(ProductId),
    CONSTRAINT UQ_WishlistItems_WishlistId_ProductId UNIQUE (WishlistId, ProductId)
);

-- Password Reset
CREATE TABLE PasswordResetTokens (
    PasswordResetTokenId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    Token NVARCHAR(200) NOT NULL,
    ExpiresAtUtc DATETIME2 NOT NULL,
    UsedAtUtc DATETIME2 NULL,
    FOREIGN KEY (UserId) REFERENCES Users(UserId)
);
GO

-- Seed Data
INSERT INTO Categories (CategoryName, Description)
VALUES
('Luxury', 'Luxury watches'),
('Sports', 'Sports watches'),
('Classic', 'Classic watches'),
('Aviation', 'Aviation watches');

INSERT INTO Products (CategoryId, Name, Brand, Model, Description, Price, StockQuantity, ImageUrl, Rating, Reviews)
VALUES
((SELECT CategoryId FROM Categories WHERE CategoryName = 'Luxury'), 'Chronograph Elite', 'Rolex', 'CE-100', 'A masterpiece of precision, featuring a sleek black dial with gold accents.', 4500, 15, 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=2080&auto=format&fit=crop', 4.8, 124),
((SELECT CategoryId FROM Categories WHERE CategoryName = 'Sports'), 'Ocean Diver Pro', 'Omega', 'OD-220', 'Built for the depths with 300m water resistance and luminescent dial.', 3200, 12, 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?q=80&w=2080&auto=format&fit=crop', 4.9, 89),
((SELECT CategoryId FROM Categories WHERE CategoryName = 'Classic'), 'Minimalist Heritage', 'Daniel Wellington', 'MH-42', 'A clean, timeless design with a slim profile and leather strap.', 250, 30, 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=2080&auto=format&fit=crop', 4.5, 312),
((SELECT CategoryId FROM Categories WHERE CategoryName = 'Aviation'), 'Aero Pilot', 'Breitling', 'AP-9', 'Designed for aviators with dual time zones and high readability.', 5400, 0, 'https://images.unsplash.com/photo-1622434641406-a158123450f9?q=80&w=2080&auto=format&fit=crop', 4.7, 67),
((SELECT CategoryId FROM Categories WHERE CategoryName = 'Sports'), 'Eclipse Nova', 'Tag Heuer', 'EN-77', 'A striking all-black timepiece with subtle red accents.', 1800, 20, 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?q=80&w=2080&auto=format&fit=crop', 4.6, 156),
((SELECT CategoryId FROM Categories WHERE CategoryName = 'Luxury'), 'Vintage Gold Classic', 'Patek Philippe', 'VG-500', 'An heirloom piece featuring an 18k gold case and moon phase.', 12500, 7, 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=2080&auto=format&fit=crop', 5.0, 24);
GO
