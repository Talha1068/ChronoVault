# ChronoVault - Luxury Watch E-Commerce Platform

Full-stack e-commerce application for luxury watches with complete user + admin functionality.

## Tech Stack
- **Frontend**: React 19 + Vite + React Router 7 + Axios + Lucide Icons
- **Backend**: ASP.NET Core 9 (C#) + Entity Framework Core + SQL Server
- **Auth**: JWT Bearer Token Authentication
- **Database**: SQL Server (LocalDB / Express / Azure SQL)

## How to Run

### Backend (ASP.NET Core)
```bash
cd backend
dotnet restore
dotnet run
# API runs on https://localhost:5001
```
The backend auto-creates all database tables and seeds initial data on first run.

### Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
# Opens on http://localhost:3000
```

If your backend runs on a different port, create `.env`:
```
VITE_API_BASE_URL=https://localhost:YOUR_PORT
```

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@chronovault.com | Admin123! |
| Customer | Register via /signup | Your password |

## Features
- User: Home, Shop, Cart, Wishlist, Checkout, Orders, Order Details, Profile, Payments
- Admin: Dashboard, Products CRUD, Orders Management, Users, Categories CRUD
- Auth: JWT, Signup, Login, Forgot/Reset Password, Change Password
- Full backend-frontend integration with proper CORS, token handling, role guards
