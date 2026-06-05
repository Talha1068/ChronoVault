import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ArrowLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { api } from '../api/client';

const statusColor = (s) => {
  const map = { Pending: '#f39c12', Confirmed: '#3498db', Shipped: '#9b59b6', Delivered: '#2ecc71', Cancelled: '#e74c3c' };
  return map[s] || '#a3a3a3';
};

const Orders = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'My Orders | ChronoVault';
    if (!token) { navigate('/login'); return; }
    (async () => {
      try { setOrders(await api.getMyOrders(token)); }
      catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, [token, navigate]);

  if (loading) return <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}><div className="loader"></div></div>;

  return (
    <div className="container animate-fade-in" style={{ padding: '3rem 1.5rem', maxWidth: '900px' }}>
      <button onClick={() => navigate('/profile')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}><ArrowLeft size={18} /> Back to Profile</button>
      <h1 style={{ fontSize: '2.5rem', color: 'var(--accent-gold)', fontFamily: 'var(--font-serif)', marginBottom: '0.5rem' }}>My Orders</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Track and manage your purchase history</p>

      {error && <div style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid #e74c3c', padding: '0.75rem', borderRadius: '8px', color: '#e74c3c', marginBottom: '1rem' }}>{error}</div>}

      {orders.length === 0 ? (
        <div className="empty-state">
          <ShoppingBag size={64} />
          <h3>No orders yet</h3>
          <p>When you place orders, they will appear here.</p>
          <Link to="/shop" className="btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {orders.map((order) => (
            <Link to={`/orders/${order.orderId}`} key={order.orderId} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'border-color 0.2s', textDecoration: 'none' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-gold)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={20} color="var(--accent-gold)" /></div>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '0.2rem' }}>{order.orderNumber}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{new Date(order.orderDate).toLocaleDateString()} — {order.paymentMethod}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', textAlign: 'right' }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--accent-gold)' }}>${order.totalAmount.toLocaleString()}</div>
                  <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '12px', background: `${statusColor(order.status)}22`, color: statusColor(order.status), fontWeight: 600 }}>{order.status}</span>
                </div>
                <ChevronRight size={18} color="var(--text-secondary)" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
