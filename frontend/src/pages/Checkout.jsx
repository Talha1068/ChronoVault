import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { api } from '../api/client';
import './Checkout.css';

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useContext(CartContext);
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    paymentMethod: 'COD',
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    document.title = 'Checkout | Chronos';
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10,}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone number must be at least 10 digits';
    }
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP Code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submit = async () => {
      if (!validateForm()) return;
      if (!user?.id) {
        setApiError('Please login before placing an order.');
        return;
      }

      try {
        const result = await api.createOrder(
          {
            items: cart.map((item) => ({ productId: Number(item.id), quantity: item.quantity })),
            shippingAddress: `${formData.address}, ${formData.city}, ${formData.zipCode}`,
            customerEmail: formData.email,
            customerPhone: formData.phone,
            paymentMethod: formData.paymentMethod,
          },
          token
        );
        clearCart();
        navigate('/order-confirmation', {
          state: {
            orderNumber: result.orderNumber,
            customerEmail: formData.email,
            paymentMethod: formData.paymentMethod,
          },
        });
      } catch (error) {
        setApiError(error.message);
      }
    };
    submit();
  };

  if (cart.length === 0) return null;

  return (
    <div className="checkout-page container animate-fade-in">
      <h1 className="page-title">Checkout</h1>
      
      <div className="checkout-container">
        <form className="checkout-form" onSubmit={handleSubmit} noValidate>
          <h3>Shipping Information</h3>
          {apiError && <span className="error-text" style={{ display: 'block', marginBottom: '1rem' }}>{apiError}</span>}
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input 
                type="text" 
                name="firstName"
                className={`form-control ${errors.firstName ? 'error-border' : ''}`}
                value={formData.firstName}
                onChange={handleChange}
              />
              {errors.firstName && <span className="error-text">{errors.firstName}</span>}
            </div>
            
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input 
                type="text" 
                name="lastName"
                className={`form-control ${errors.lastName ? 'error-border' : ''}`}
                value={formData.lastName}
                onChange={handleChange}
              />
              {errors.lastName && <span className="error-text">{errors.lastName}</span>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                name="email"
                className={`form-control ${errors.email ? 'error-border' : ''}`}
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>
            
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input 
                type="tel" 
                name="phone"
                className={`form-control ${errors.phone ? 'error-border' : ''}`}
                value={formData.phone}
                onChange={handleChange}
              />
              {errors.phone && <span className="error-text">{errors.phone}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Street Address</label>
            <input 
              type="text" 
              name="address"
              className={`form-control ${errors.address ? 'error-border' : ''}`}
              value={formData.address}
              onChange={handleChange}
            />
            {errors.address && <span className="error-text">{errors.address}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">City</label>
              <input 
                type="text" 
                name="city"
                className={`form-control ${errors.city ? 'error-border' : ''}`}
                value={formData.city}
                onChange={handleChange}
              />
              {errors.city && <span className="error-text">{errors.city}</span>}
            </div>
            
            <div className="form-group">
              <label className="form-label">ZIP / Postal Code</label>
              <input 
                type="text" 
                name="zipCode"
                className={`form-control ${errors.zipCode ? 'error-border' : ''}`}
                value={formData.zipCode}
                onChange={handleChange}
              />
              {errors.zipCode && <span className="error-text">{errors.zipCode}</span>}
            </div>
          </div>

          <h3 style={{ marginTop: '2rem' }}>Payment Method</h3>
          <div className="payment-method">
            <input
              type="radio"
              id="cod"
              name="paymentMethod"
              checked={formData.paymentMethod === 'COD'}
              onChange={() => setFormData((prev) => ({ ...prev, paymentMethod: 'COD' }))}
            />
            <label htmlFor="cod">Cash on Delivery (COD)</label>
          </div>
          <div className="payment-method">
            <input
              type="radio"
              id="online"
              name="paymentMethod"
              checked={formData.paymentMethod === 'ONLINE'}
              onChange={() => setFormData((prev) => ({ ...prev, paymentMethod: 'ONLINE' }))}
            />
            <label htmlFor="online">Online Payment (simulated secure checkout)</label>
          </div>
          
          <button type="submit" className="btn-primary place-order-btn">
            Place Order
          </button>
        </form>

        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className="summary-items">
            {cart.map(item => (
              <div key={item.id} className="summary-item">
                <div className="summary-item-img-container">
                  <img src={item.image} alt={item.name} />
                  <span className="summary-item-qty">{item.quantity}</span>
                </div>
                <div className="summary-item-details">
                  <span className="summary-item-name">{item.name}</span>
                  <span className="summary-item-price">${(item.price * item.quantity).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="summary-divider"></div>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${cartTotal.toLocaleString()}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-row total">
            <span>Total</span>
            <span>${cartTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
