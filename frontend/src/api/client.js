import axios from "axios";

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL || "https://localhost:5001";
const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, "");

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: { "Content-Type": "application/json" },
});

const getErrorMessage = (error, fallback = "Request failed") =>
  error?.response?.data?.message || fallback;

const withAuth = (token) => ({
  headers: token ? { Authorization: `Bearer ${token}` } : {},
});

export const api = {
  getProducts: async () => (await apiClient.get("/products")).data,
  getProductById: async (id) => (await apiClient.get(`/products/${id}`)).data,

  signup: async (body) => {
    try { return (await apiClient.post("/auth/signup", body)).data; }
    catch (e) { throw new Error(getErrorMessage(e)); }
  },
  login: async (body) => {
    try { return (await apiClient.post("/auth/login", body)).data; }
    catch (e) { throw new Error(getErrorMessage(e)); }
  },
  forgotPassword: async (email) => {
    try { return (await apiClient.post("/auth/forgot-password", { email })).data; }
    catch (e) { throw new Error(getErrorMessage(e, "Failed to request password reset")); }
  },
  resetPassword: async (token, newPassword) => {
    try { return (await apiClient.post("/auth/reset-password", { token, newPassword })).data; }
    catch (e) { throw new Error(getErrorMessage(e, "Failed to reset password")); }
  },

  getProfile: async (token) => {
    try { return (await apiClient.get("/profile", withAuth(token))).data; }
    catch (e) { throw new Error(getErrorMessage(e, "Failed to load profile")); }
  },
  updateProfile: async (body, token) => {
    try { return (await apiClient.put("/profile", body, withAuth(token))).data; }
    catch (e) { throw new Error(getErrorMessage(e, "Failed to update profile")); }
  },
  changePassword: async (body, token) => {
    try { return (await apiClient.put("/profile/password", body, withAuth(token))).data; }
    catch (e) { throw new Error(getErrorMessage(e, "Failed to change password")); }
  },

  createOrder: async (body, token) => {
    try { return (await apiClient.post("/orders", body, withAuth(token))).data; }
    catch (e) { throw new Error(getErrorMessage(e)); }
  },
  getMyOrders: async (token) => {
    try { return (await apiClient.get("/orders/my", withAuth(token))).data; }
    catch (e) { throw new Error(getErrorMessage(e, "Failed to load orders")); }
  },
  getOrderById: async (orderId, token) => {
    try { return (await apiClient.get(`/orders/${orderId}`, withAuth(token))).data; }
    catch (e) { throw new Error(getErrorMessage(e, "Failed to load order details")); }
  },

  getCart: async (token) => (await apiClient.get("/cart", withAuth(token))).data,
  upsertCartItem: async (productId, quantity, token) =>
    (await apiClient.post("/cart/items", { productId, quantity }, withAuth(token))).data,
  removeCartItem: async (productId, token) =>
    (await apiClient.delete(`/cart/items/${productId}`, withAuth(token))).data,

  getWishlist: async (token) => (await apiClient.get("/wishlist", withAuth(token))).data,
  addWishlistItem: async (productId, token) =>
    (await apiClient.post("/wishlist/items", { productId }, withAuth(token))).data,
  removeWishlistItem: async (productId, token) =>
    (await apiClient.delete(`/wishlist/items/${productId}`, withAuth(token))).data,

  getMyPayments: async (token) => (await apiClient.get("/payments/my", withAuth(token))).data,
  getValues: async () => {
    try { return (await apiClient.get("/values")).data; }
    catch (e) { throw new Error(getErrorMessage(e, "Failed to load API values")); }
  },

  getAdminDashboard: async (token) => (await apiClient.get("/admin/dashboard", withAuth(token))).data,
  getAdminProducts: async (token) => (await apiClient.get("/admin/products", withAuth(token))).data,
  getAdminCategories: async (token) => (await apiClient.get("/admin/categories", withAuth(token))).data,
  getAdminUsers: async (token) => (await apiClient.get("/admin/users", withAuth(token))).data,
  getAdminOrders: async (token) => (await apiClient.get("/admin/orders", withAuth(token))).data,
  createCategory: async (body, token) => (await apiClient.post("/admin/categories", body, withAuth(token))).data,
  updateCategory: async (id, body, token) => (await apiClient.put(`/admin/categories/${id}`, body, withAuth(token))).data,
  deleteCategory: async (id, token) => (await apiClient.delete(`/admin/categories/${id}`, withAuth(token))).data,
  createAdminProduct: async (body, token) => (await apiClient.post("/admin/products", body, withAuth(token))).data,
  updateAdminProduct: async (id, body, token) => (await apiClient.put(`/admin/products/${id}`, body, withAuth(token))).data,
  deleteAdminProduct: async (id, token) => (await apiClient.delete(`/admin/products/${id}`, withAuth(token))).data,
  getLowStock: async (token, threshold = 5) => (await apiClient.get(`/admin/inventory/low-stock?threshold=${threshold}`, withAuth(token))).data,
  updateOrderStatus: async (id, status, token) => (await apiClient.put(`/orders/${id}/status`, { status }, withAuth(token))).data,
  getSalesSummary: async (token) => (await apiClient.get("/reports/sales-summary", withAuth(token))).data,
};
