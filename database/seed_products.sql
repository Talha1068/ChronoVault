USE ChronoVaultDb;
GO

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
