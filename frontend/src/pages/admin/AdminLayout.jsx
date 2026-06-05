import { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, Tag, ArrowLeft, LogOut } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/admin/products', label: 'Products', icon: Package },
  { path: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/categories', label: 'Categories', icon: Tag },
];

const AdminLayout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  if (!user || user.role !== 'admin') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg-primary)', flexDirection: 'column', gap: '1rem' }}>
        <h2 style={{ color: 'var(--accent-gold)', fontFamily: 'var(--font-serif)' }}>Admin Access Required</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Please login with an admin account to access this panel.</p>
        <Link to="/login" className="btn-primary">Go to Login</Link>
      </div>
    );
  }

  const isActive = (item) => item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100 }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <Link to="/admin" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-gold)', fontFamily: 'var(--font-serif)', letterSpacing: '1px' }}>CHRONOVAULT</Link>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Admin Panel</p>
        </div>
        <nav style={{ flex: 1, padding: '1rem 0.75rem' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link key={item.path} to={item.path} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 1rem', borderRadius: '8px', marginBottom: '0.25rem', fontSize: '0.9rem', fontWeight: active ? 600 : 400,
                background: active ? 'rgba(212,175,55,0.12)' : 'transparent', color: active ? 'var(--accent-gold)' : 'var(--text-secondary)', transition: 'all 0.2s',
              }}>
                <Icon size={18} /> {item.label}
              </Link>
            );
          })}
        </nav>
        <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid var(--border-color)' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', borderRadius: '8px' }}>
            <ArrowLeft size={16} /> Back to Store
          </Link>
          <button onClick={() => { logout(); navigate('/login'); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', color: 'var(--accent-red)', fontSize: '0.85rem', width: '100%', borderRadius: '8px' }}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>
      {/* Main Content */}
      <main style={{ flex: 1, marginLeft: '250px', padding: '2rem', minHeight: '100vh' }}>
        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          aside { width: 60px !important; overflow: hidden; }
          aside span, aside p, aside nav a span { display: none; }
          aside div:first-child a { font-size: 0 !important; }
          main { margin-left: 60px !important; }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
