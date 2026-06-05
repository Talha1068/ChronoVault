import { useContext, useEffect, useState } from 'react';
import { Plus, Edit3, Trash2, X } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { api } from '../../api/client';

const AdminCategories = () => {
  const { token } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ categoryName: '', description: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    try { setCategories(await api.getAdminCategories(token)); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { document.title = 'Manage Categories | ChronoVault'; load(); }, [token]);

  const openCreate = () => { setEditId(null); setForm({ categoryName: '', description: '' }); setShowForm(true); setError(''); setMessage(''); };
  const openEdit = (c) => { setEditId(c.id); setForm({ categoryName: c.name, description: c.description || '' }); setShowForm(true); setError(''); setMessage(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      if (editId) { await api.updateCategory(editId, form, token); setMessage('Category updated.'); }
      else { await api.createCategory(form, token); setMessage('Category created.'); }
      setShowForm(false); setEditId(null); await load();
    } catch (e) { setError(e.message); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This only works if no products use it.`)) return;
    try { await api.deleteCategory(id, token); setMessage('Category deleted.'); await load(); }
    catch (e) { setError(e.message); }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}><div className="loader"></div></div>;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', color: 'var(--accent-gold)', margin: 0 }}>Categories</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{categories.length} categories</p>
        </div>
        <button onClick={openCreate} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Plus size={16} /> Add Category</button>
      </div>

      {message && <div style={{ background: 'rgba(46,204,113,0.1)', border: '1px solid #2ecc71', padding: '0.75rem', borderRadius: '8px', color: '#2ecc71', marginBottom: '1rem' }}>{message}</div>}
      {error && <div style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid #e74c3c', padding: '0.75rem', borderRadius: '8px', color: '#e74c3c', marginBottom: '1rem' }}>{error}</div>}

      {showForm && (
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>{editId ? 'Edit Category' : 'Add Category'}</h3>
            <button onClick={() => setShowForm(false)} style={{ color: 'var(--text-secondary)' }}><X size={20} /></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group"><label className="form-label">Name *</label><input className="form-control" value={form.categoryName} onChange={e => setForm(f => ({ ...f, categoryName: e.target.value }))} required /></div>
            <div className="form-group"><label className="form-label">Description</label><input className="form-control" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn-primary">{editId ? 'Update' : 'Create'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {categories.map(c => (
          <div key={c.id} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.1rem' }}>{c.name}</h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{c.description || 'No description'}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => openEdit(c)} style={{ color: '#3498db', padding: '0.3rem' }}><Edit3 size={16} /></button>
                <button onClick={() => handleDelete(c.id, c.name)} style={{ color: '#e74c3c', padding: '0.3rem' }}><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCategories;
