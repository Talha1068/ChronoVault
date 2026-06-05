import { useContext, useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, CreditCard, Clock } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { api } from '../api/client';

const statusColor = (s) => {
  const map = { Pending: '#f39c12', Confirmed: '#3498db', Shipped: '#9b59b6', Delivered: '#2ecc71', Cancelled: '#e74c3c' };
  return map[s] || '#a3a3a3';
};

const OrderDetails = () => {
  const { orderId } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Order Details | ChronoVault';
    if (!token) { navigate('/login'); return; }
    (async () => {
      try {
        const data = await api.getOrderById(orderId, token);
        setOrder(data.order);
        setItems(data.items);
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, [orderId, token, navigate]);

  if (loading) return <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}><div className="loader"></div></div>;
  if (error) return <div className="container" style={{ padding: '4rem 1.5rem' }}><p className="error-text">{error}</p><Link to="/orders" className="btn-secondary">Back to Orders</Link></div>;
  if (!order) return null;

  return (
    <div className="container animate-fade-in" style={{ padding: '3rem 1.5rem', maxWidth: '900px' }}>
      <button onClick={() => navigate('/orders')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}><ArrowLeft size={18} /> Back to Orders</button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', color: 'var(--accent-gold)', margin: 0 }}>Order {order.orderNumber}</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>{new Date(order.orderDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <span style={{ padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, background: `${statusColor(order.status)}22`, color: statusColor(order.status), border: `1px solid ${statusColor(order.status)}44` }}>{order.status}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <InfoCard icon={<MapPin size={18} />} title="Shipping Address" value={order.shippingAddress} />
        <InfoCard icon={<CreditCard size={18} />} title="Payment" value={`${order.paymentMethod} — ${order.paymentStatus}`} />
        <InfoCard icon={<Clock size={18} />} title="Contact" value={`${order.customerEmail}\n${order.customerPhone}`} />
      </div>

      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}><Package size={18} color="var(--accent-gold)" /> Order Items ({items.length})</h3>
        </div>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: i < items.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
            <div>
              <Link to={`/product/${item.productId}`} style={{ fontWeight: 500 }}>{item.productName}</Link>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.15rem 0 0' }}>Qty: {item.quantity} × ${item.unitPrice.toLocaleString()}</p>
            </div>
            <span style={{ fontWeight: 600, color: 'var(--accent-gold)' }}>${(item.quantity * item.unitPrice).toLocaleString()}</span>
          </div>
        ))}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', background: 'var(--bg-hover)' }}>
          <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>Total</span>
          <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-gold)' }}>${order.totalAmount.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

const InfoCard = ({ icon, title, value }) => (
  <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-gold)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>{icon} {title}</div>
    <p style={{ margin: 0, whiteSpace: 'pre-line', fontSize: '0.9rem' }}>{value}</p>
  </div>
);

export default OrderDetails;
