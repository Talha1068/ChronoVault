import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingCart, Users, DollarSign, AlertTriangle, Clock } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { api } from '../../api/client';

const AdminDashboard = () => {
  const { token } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Admin Dashboard | ChronoVault';
    (async () => {
      try { setData(await api.getAdminDashboard(token)); }
      catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, [token]);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}><div className="loader"></div></div>;
  if (error) return <p className="error-text" style={{ padding: '2rem' }}>{error}</p>;

  const stats = [
    { label: 'Total Revenue', value: `$${(data.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: '#2ecc71' },
    { label: 'Total Orders', value: data.totalOrders, icon: ShoppingCart, color: '#3498db' },
    { label: 'Total Products', value: data.totalProducts, icon: Package, color: '#9b59b6' },
    { label: 'Total Customers', value: data.totalUsers, icon: Users, color: '#e67e22' },
    { label: 'Pending Orders', value: data.pendingOrders, icon: Clock, color: '#f39c12' },
    { label: 'Low Stock Items', value: data.lowStockCount, icon: AlertTriangle, color: '#e74c3c' },
  ];

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', color: 'var(--accent-gold)', marginBottom: '0.25rem' }}>Dashboard</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Overview of your store performance</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={18} color={s.color} /></div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{s.value}</div>
            </div>
          );
        })}
      </div>

      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1rem' }}>Recent Orders</h3>
          <Link to="/admin/orders" style={{ color: 'var(--accent-gold)', fontSize: '0.85rem' }}>View All</Link>
        </div>
        {(!data.recentOrders || data.recentOrders.length === 0) ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No orders yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                {['Order', 'Customer', 'Amount', 'Status', 'Date'].map(h => <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {data.recentOrders.map((o) => (
                  <tr key={o.orderId} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{o.orderNumber}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{o.customerEmail}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--accent-gold)' }}>${o.totalAmount.toLocaleString()}</td>
                    <td style={{ padding: '0.75rem 1rem' }}><StatusBadge status={o.status} /></td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{new Date(o.orderDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const statusColor = (s) => ({ Pending: '#f39c12', Confirmed: '#3498db', Shipped: '#9b59b6', Delivered: '#2ecc71', Cancelled: '#e74c3c' }[s] || '#a3a3a3');
const StatusBadge = ({ status }) => (
  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 600, background: `${statusColor(status)}22`, color: statusColor(status) }}>{status}</span>
);

export default AdminDashboard;
