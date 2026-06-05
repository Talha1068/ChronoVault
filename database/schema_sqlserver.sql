IF DB_ID('ChronoVaultDb') IS NULL
BEGIN
    CREATE DATABASE ChronoVaultDb;
END
GO

USE ChronoVaultDb;
GO

IF OBJECT_ID('OrderItems', 'U') IS NOT NULL DROP TABLE OrderItems;
IF OBJECT_ID('Orders', 'U') IS NOT NULL DROP TABLE Orders;
IF OBJECT_ID('Products', 'U') IS NOT NULL DROP TABLE Products;
IF OBJECT_ID('Categories', 'U') IS NOT NULL DROP TABLE Categories;
IF OBJECT_ID('Users', 'U') IS NOT NULL DROP TABLE Users;
GO

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
    Status NVARCHAR(50) NOT NULL DEFAULT 'Placed',
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
