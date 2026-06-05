CREATE DATABASE ChronoVault;
GO
USE ChronoVault;
GO
--active
--createdDate
--updatedDate
--createdBy
--updatedBy



CREATE TABLE Users (
    user_id INT PRIMARY KEY,
    full_name VARCHAR(100),
    email VARCHAR(100),
    password VARCHAR(100),
    phone_number VARCHAR(20),
    address VARCHAR(255),
    role VARCHAR(20)
);

CREATE TABLE Categories (
    category_id INT PRIMARY KEY,
    category_name VARCHAR(50),
    description VARCHAR(255)
);

CREATE TABLE Products (
    product_id INT PRIMARY KEY,
    category_id INT,
    name VARCHAR(100),
    brand VARCHAR(50),
    model VARCHAR(50),
    description VARCHAR(255),
    price INT,
    stock_quantity INT,
    image_url VARCHAR(255),
    FOREIGN KEY (category_id) REFERENCES Categories(category_id)
);

CREATE TABLE Cart (
    cart_id INT Primary key,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE CartProducts(
    cart_id INT,
    product_id INT,
    quantity INT,
    primary key(product_id,cart_id),
    FOREIGN KEY (product_id) REFERENCES Products(product_id),
    FOREIGN KEY (cart_id) REFERENCES Cart(cart_id)
);

CREATE TABLE Wishlist (
    wishlist_id INT PRIMARY KEY,
    user_id INT,
    
);


create table WishListProducts(
  wishlist_id int,
  product_id int,
  --quantity int,
  primary  key(product_id,wishlist_id),
  foreign key(wishlist_id) references Wishlist(wishlist_id),
  foreign key (product_id) references Products(product_id)

);
CREATE TABLE Orders (
    cart_id int,
    order_id INT PRIMARY KEY,
    user_id INT,
    total_amount INT,
    shipping_address VARCHAR(255),
    status VARCHAR(50),
    order_date DATE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)

);

--CREATE TABLE Order_Items (
--    item_id INT PRIMARY KEY,
--    order_id INT,
--    product_id INT,
--    quantity INT,
--    unit_price INT,
--    FOREIGN KEY (order_id) REFERENCES Orders(order_id),
--    FOREIGN KEY (product_id) REFERENCES Products(product_id)
--);

CREATE TABLE Payments (
    payment_id INT PRIMARY KEY,
    order_id INT,
    payment_method VARCHAR(50),
    amount INT,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id)
);