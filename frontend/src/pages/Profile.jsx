import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, MapPin, Lock, Package, Heart, CreditCard, LogOut, Edit3, Check, X, ChevronRight } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { api } from '../api/client';

const Profile = () => {
  const { user, token, login, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);
  const [form, setForm] = useState({ name: '', phoneNumber: '', address: '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'My Profile | ChronoVault';
    if (!token) { navigate('/login'); return; }
    (async () => {
      try {
        const p = await api.getProfile(token);
        setProfile(p);
        setForm({ name: p.name || '', phoneNumber: p.phoneNumber || '', address: p.address || '' });
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, [token, navigate]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true); setError(''); setMessage('');
      const updated = await api.updateProfile(form, token);
      setProfile(updated);
      if (user) login({ ...user, name: updated.name }, token);
      setMessage('Profile updated successfully');
      setEditMode(false);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { setError('Passwords do not match'); return; }
    if (pwForm.newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    try {
      setSaving(true); setError(''); setMessage('');
      await api.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }, token);
      setMessage('Password changed successfully');
      setPasswordMode(false);
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}><div className="loader"></div></div>;

  return (
    <div className="container animate-fade-in" style={{ padding: '3rem 1.5rem', maxWidth: '900px' }}>
      <h1 style={{ fontSize: '2.5rem', color: 'var(--accent-gold)', fontFamily: 'var(--font-serif)', marginBottom: '0.5rem' }}>My Profile</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Manage your account information and preferences</p>

      {message && <div style={{ background: 'rgba(46,204,113,0.1)', border: '1px solid #2ecc71', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', color: '#2ecc71' }}>{message}</div>}
      {error && <div style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid #e74c3c', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', color: '#e74c3c' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Personal Information Card */}
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', gridColumn: editMode ? '1 / -1' : 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontSize: '1.1rem' }}><User size={18} color="var(--accent-gold)" /> Personal Information</h3>
            {!editMode && <button onClick={() => { setEditMode(true); setPasswordMode(false); setError(''); setMessage(''); }} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-gold)', fontSize: '0.875rem', fontWeight: 500 }}><Edit3 size={14} /> Edit</button>}
          </div>
          {editMode ? (
            <form onSubmit={handleSaveProfile}>
              <div className="form-group"><label className="form-label">Full Name</label><input className="form-control" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
              <div className="form-group"><label className="form-label">Email</label><input className="form-control" value={profile?.email || ''} readOnly style={{ opacity: 0.6 }} /></div>
              <div className="form-group"><label className="form-label">Phone Number</label><input className="form-control" value={form.phoneNumber} onChange={(e) => setForm(p => ({ ...p, phoneNumber: e.target.value }))} placeholder="+92 xxx xxxxxxx" /></div>
              <div className="form-group"><label className="form-label">Address</label><textarea className="form-control" rows="3" value={form.address} onChange={(e) => setForm(p => ({ ...p, address: e.target.value }))} placeholder="Your shipping address" /></div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn-primary" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Check size={16} /> {saving ? 'Saving...' : 'Save Changes'}</button>
                <button type="button" className="btn-secondary" onClick={() => { setEditMode(false); setForm({ name: profile?.name || '', phoneNumber: profile?.phoneNumber || '', address: profile?.address || '' }); }} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><X size={16} /> Cancel</button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <InfoRow label="Name" value={profile?.name} />
              <InfoRow label="Email" value={profile?.email} />
              <InfoRow label="Phone" value={profile?.phoneNumber || 'Not set'} muted={!profile?.phoneNumber} />
              <InfoRow label="Role" value={profile?.role === 'admin' ? 'Administrator' : 'Customer'} />
            </div>
          )}
        </div>

        {/* Delivery Information Card */}
        {!editMode && (
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '1.1rem' }}><MapPin size={18} color="var(--accent-gold)" /> Delivery Information</h3>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <InfoRow label="Shipping Address" value={profile?.address || 'No address saved'} muted={!profile?.address} />
              <InfoRow label="Phone" value={profile?.phoneNumber || 'Not set'} muted={!profile?.phoneNumber} />
            </div>
            {!profile?.address && (
              <button onClick={() => { setEditMode(true); setError(''); setMessage(''); }} className="btn-secondary" style={{ marginTop: '1rem', fontSize: '0.85rem' }}>Add Address</button>
            )}
          </div>
        )}

        {/* Change Password Card */}
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', gridColumn: passwordMode ? '1 / -1' : 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontSize: '1.1rem' }}><Lock size={18} color="var(--accent-gold)" /> Password & Security</h3>
            {!passwordMode && <button onClick={() => { setPasswordMode(true); setEditMode(false); setError(''); setMessage(''); }} style={{ color: 'var(--accent-gold)', fontSize: '0.875rem', fontWeight: 500 }}>Change</button>}
          </div>
          {passwordMode ? (
            <form onSubmit={handleChangePassword}>
              <div className="form-group"><label className="form-label">Current Password</label><input type="password" className="form-control" value={pwForm.currentPassword} onChange={(e) => setPwForm(p => ({ ...p, currentPassword: e.target.value }))} required /></div>
              <div className="form-group"><label className="form-label">New Password</label><input type="password" className="form-control" value={pwForm.newPassword} onChange={(e) => setPwForm(p => ({ ...p, newPassword: e.target.value }))} required minLength={6} /></div>
              <div className="form-group"><label className="form-label">Confirm New Password</label><input type="password" className="form-control" value={pwForm.confirmPassword} onChange={(e) => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))} required /></div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Changing...' : 'Change Password'}</button>
                <button type="button" className="btn-secondary" onClick={() => { setPasswordMode(false); setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); }}>Cancel</button>
              </div>
            </form>
          ) : (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Password last changed: Unknown</p>
          )}
        </div>

        {/* Quick Links Card */}
        {!editMode && !passwordMode && (
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Quick Links</h3>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <QuickLink to="/orders" icon={<Package size={18} />} label="My Orders" />
              <QuickLink to="/wishlist" icon={<Heart size={18} />} label="My Wishlist" />
              <QuickLink to="/payments" icon={<CreditCard size={18} />} label="Payment History" />
              {profile?.role === 'admin' && <QuickLink to="/admin" icon={<Lock size={18} />} label="Admin Panel" />}
            </div>
            <button onClick={() => { logout(); navigate('/'); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.25rem', color: 'var(--accent-red)', fontWeight: 500, fontSize: '0.9rem' }}><LogOut size={16} /> Sign Out</button>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .container > div[style*="grid-template-columns"] { grid-template-columns: 1fr !important; }
          .container > div[style*="grid-template-columns"] > div { grid-column: auto !important; }
        }
      `}</style>
    </div>
  );
};

const InfoRow = ({ label, value, muted }) => (
  <div>
    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
    <p style={{ margin: 0, color: muted ? 'var(--text-secondary)' : 'var(--text-primary)', fontStyle: muted ? 'italic' : 'normal' }}>{value}</p>
  </div>
);

const QuickLink = ({ to, icon, label }) => (
  <Link to={to} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-hover)', transition: 'all 0.2s' }}>
    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>{icon} {label}</span>
    <ChevronRight size={16} color="var(--text-secondary)" />
  </Link>
);

export default Profile;
