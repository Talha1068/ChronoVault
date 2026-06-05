import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { api } from '../api/client';

const Payments = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'My Payments | ChronoVault';
    if (!token) { navigate('/login'); return; }
    (async () => {
      try { setPayments(await api.getMyPayments(token)); }
      catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, [token, navigate]);

  if (loading) return <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}><div className="loader"></div></div>;

  return (
    <div className="container animate-fade-in" style={{ padding: '3rem 1.5rem', maxWidth: '900px' }}>
      <button onClick={() => navigate('/profile')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}><ArrowLeft size={18} /> Back to Profile</button>
      <h1 style={{ fontSize: '2.5rem', color: 'var(--accent-gold)', fontFamily: 'var(--font-serif)', marginBottom: '2rem' }}>Payment History</h1>
      {error && <p className="error-text">{error}</p>}
      {payments.length === 0 ? (
        <div className="empty-state"><CreditCard size={64} /><h3>No payments yet</h3><p>Your payment history will appear here.</p></div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {payments.map((p) => (
            <div key={p.paymentId} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '0.2rem' }}>{p.orderNumber}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{p.method} — {new Date(p.createdAt).toLocaleDateString()}</div>
                {p.transactionReference && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>Ref: {p.transactionReference}</div>}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 600, color: 'var(--accent-gold)' }}>${p.amount.toLocaleString()}</div>
                <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '12px', fontWeight: 600, background: p.status === 'Paid' ? 'rgba(46,204,113,0.15)' : 'rgba(243,156,18,0.15)', color: p.status === 'Paid' ? '#2ecc71' : '#f39c12' }}>{p.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Payments;
