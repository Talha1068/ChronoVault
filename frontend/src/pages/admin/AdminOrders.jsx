import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { api } from '../../api/client';
import { Search, Eye, X } from 'lucide-react';

const statuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
const statusColor = (s) => ({ Pending: '#f39c12', Confirmed: '#3498db', Shipped: '#9b59b6', Delivered: '#2ecc71', Cancelled: '#e74c3c' }[s] || '#a3a3a3');

const AdminOrders = () => {
  const { token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [detail, setDetail] = useState(null);
  const [detailItems, setDetailItems] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    try { setOrders(await api.getAdminOrders(token)); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { document.title = 'Manage Orders | ChronoVault'; load(); }, [token]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      setError('');
      await api.updateOrderStatus(orderId, newStatus, token);
      setMessage(`Order status updated to ${newStatus}`);
      await load();
      if (detail && detail.orderId === orderId) setDetail(prev => ({ ...prev, status: newStatus }));
    } catch (e) { setError(e.message); }
  };

  const viewDetail = async (order) => {
    try {
      const d = await api.getOrderById(order.orderId, token);
      setDetail(d.order);
      setDetailItems(d.items);
    } catch (e) { setError(e.message); }
  };

  const filtered = orders.filter(o => {
    if (statusFilter !== 'All' && o.status !== statusFilter) return false;
    if (search && !o.orderNumber.toLowerCase().includes(search.toLowerCase()) && !o.customerEmail.toLowerCase().includes(search.toLowerCase()) && !o.userName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}><div className="loader"></div></div>;

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', color: 'var(--accent-gold)', marginBottom: '0.25rem' }}>Orders</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{orders.length} total orders</p>

      {message && <div style={{ background: 'rgba(46,204,113,0.1)', border: '1px solid #2ecc71', padding: '0.75rem', borderRadius: '8px', color: '#2ecc71', marginBottom: '1rem' }}>{message}</div>}
      {error && <div style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid #e74c3c', padding: '0.75rem', borderRadius: '8px', color: '#e74c3c', marginBottom: '1rem' }}>{error}</div>}

      {detail && (
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: 'var(--accent-gold)' }}>Order {detail.orderNumber}</h3>
            <button onClick={() => { setDetail(null); setDetailItems([]); }} style={{ color: 'var(--text-secondary)' }}><X size={20} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
            <div><span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Customer</span><p style={{ margin: 0 }}>{detail.customerEmail}</p></div>
            <div><span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Phone</span><p style={{ margin: 0 }}>{detail.customerPhone}</p></div>
            <div><span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Address</span><p style={{ margin: 0 }}>{detail.shippingAddress}</p></div>
            <div><span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Payment</span><p style={{ margin: 0 }}>{detail.paymentMethod} ({detail.paymentStatus})</p></div>
          </div>
          <h4 style={{ marginBottom: '0.5rem' }}>Items</h4>
          {detailItems.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
              <span>{item.productName} x{item.quantity}</span>
              <span style={{ color: 'var(--accent-gold)' }}>${(item.quantity * item.unitPrice).toLocaleString()}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', fontWeight: 700 }}>
            <span>Total</span><span style={{ color: 'var(--accent-gold)' }}>${detail.totalAmount.toLocaleString()}</span>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input className="form-control" placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.25rem' }} />
        </div>
        <select className="form-control" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 'auto', minWidth: '140px' }}>
          <option value="All">All Statuses</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              {['Order', 'Customer', 'Amount', 'Items', 'Status', 'Date', 'Actions'].map(h => <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.orderId} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{o.orderNumber}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ fontSize: '0.9rem' }}>{o.userName}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{o.customerEmail}</div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--accent-gold)' }}>${o.totalAmount.toLocaleString()}</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{o.itemCount}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <select value={o.status} onChange={e => updateStatus(o.orderId, e.target.value)} style={{ background: `${statusColor(o.status)}18`, color: statusColor(o.status), border: `1px solid ${statusColor(o.status)}44`, borderRadius: '6px', padding: '0.25rem 0.5rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                      {statuses.map(s => <option key={s} value={s} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>{s}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{new Date(o.orderDate).toLocaleDateString()}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <button onClick={() => viewDetail(o)} style={{ color: '#3498db', padding: '0.3rem' }} title="View Details"><Eye size={16} /></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No orders found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
