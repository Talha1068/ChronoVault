import React, { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import './Cart.css';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useContext(CartContext);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Shopping Cart | Chronos';
  }, []);

  if (cart.length === 0) {
    return (
      <div className="container empty-state animate-fade-in">
        <ShoppingCart size={64} />
        <h3>Your cart is empty</h3>
        <p>Looks like you haven't added any luxury timepieces to your cart yet.</p>
        <Link to="/shop" className="btn-primary">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="cart-page container animate-fade-in">
      <h1 className="page-title">Shopping Cart</h1>
      
      <div className="cart-container">
        <div className="cart-items">
          <div className="cart-header desktop-only">
            <span>Product</span>
            <span>Quantity</span>
            <span>Price</span>
            <span>Total</span>
            <span></span>
          </div>
          
          {cart.map(item => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-product">
                <img src={item.image} alt={item.name} />
                <div>
                  <span className="cart-item-brand">{item.brand}</span>
                  <Link to={`/product/${item.id}`} className="cart-item-name">{item.name}</Link>
                </div>
              </div>
              
              <div className="cart-item-quantity">
                <div className="quantity-selector small">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                </div>
              </div>
              
              <div className="cart-item-price desktop-only">
                ${item.price.toLocaleString()}
              </div>
              
              <div className="cart-item-total">
                ${(item.price * item.quantity).toLocaleString()}
              </div>
              
              <button 
                className="cart-item-remove" 
                onClick={() => removeFromCart(item.id)}
                aria-label="Remove item"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
        
        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${cartTotal.toLocaleString()}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-row total">
            <span>Total</span>
            <span>${cartTotal.toLocaleString()}</span>
          </div>
          
          <button 
            className="btn-primary checkout-btn" 
            onClick={() => navigate('/checkout')}
          >
            Proceed to Checkout <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
