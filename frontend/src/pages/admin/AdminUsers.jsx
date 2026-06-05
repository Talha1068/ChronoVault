import { useContext, useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { api } from '../../api/client';

const AdminUsers = () => {
  const { token } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Manage Users | ChronoVault';
    (async () => {
      try { setUsers(await api.getAdminUsers(token)); }
      catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, [token]);

  const filtered = users.filter(u => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}><div className="loader"></div></div>;

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', color: 'var(--accent-gold)', marginBottom: '0.25rem' }}>Users</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{users.length} registered users</p>

      {error && <div style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid #e74c3c', padding: '0.75rem', borderRadius: '8px', color: '#e74c3c', marginBottom: '1rem' }}>{error}</div>}

      <div style={{ marginBottom: '1rem', position: 'relative' }}>
        <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
        <input className="form-control" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.25rem' }} />
      </div>

      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              {['ID', 'Name', 'Email', 'Phone', 'Role', 'Orders', 'Total Spent'].map(h => <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>#{u.id}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{u.name}</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{u.phone || '—'}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 600, background: u.role === 'admin' ? 'rgba(155,89,182,0.15)' : 'rgba(52,152,219,0.15)', color: u.role === 'admin' ? '#9b59b6' : '#3498db' }}>{u.role}</span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>{u.orderCount}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--accent-gold)' }}>${u.totalSpent.toLocaleString()}</td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No users found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
