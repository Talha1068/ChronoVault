import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const orderDetails = location.state;

  useEffect(() => {
    document.title = 'Order Successful | Chronos';
    if (!orderDetails) {
      navigate('/');
    }
  }, [orderDetails, navigate]);

  if (!orderDetails) return null;

  return (
    <div className="container empty-state animate-fade-in" style={{ padding: '6rem 1.5rem' }}>
      <CheckCircle size={80} color="var(--accent-gold)" style={{ marginBottom: '2rem' }} />
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>Order Confirmed</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', marginBottom: '2rem' }}>
        Thank you for your purchase. Your order has been placed successfully.
      </p>
      
      <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '2rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '3rem', width: '100%', maxWidth: '500px', textAlign: 'left' }}>
        <p style={{ marginBottom: '1rem' }}><strong>Order Number:</strong> <span style={{ color: 'var(--accent-gold)' }}>{orderDetails.orderNumber}</span></p>
        <p style={{ marginBottom: '1rem' }}><strong>Payment Method:</strong> {orderDetails.paymentMethod === 'ONLINE' ? 'Online Payment' : 'Cash on Delivery (COD)'}</p>
        <p><strong>Confirmation Email:</strong> sent to {orderDetails.customerEmail}</p>
      </div>

      <Link to="/shop" className="btn-primary">Continue Shopping</Link>
    </div>
  );
};

export default OrderConfirmation;
