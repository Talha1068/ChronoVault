import { useContext, useEffect, useState } from 'react';
import { Plus, Edit3, Trash2, X, Search } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { api } from '../../api/client';

const emptyForm = { name: '', brand: '', model: '', description: '', price: 0, stockQuantity: 0, imageUrl: '', categoryId: 0 };

const AdminProducts = () => {
  const { token } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [p, c] = await Promise.all([api.getAdminProducts(token), api.getAdminCategories(token)]);
      setProducts(p); setCategories(c);
      if (c.length > 0 && !form.categoryId) setForm(f => ({ ...f, categoryId: c[0].id }));
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { document.title = 'Manage Products | ChronoVault'; load(); }, [token]);

  const openCreate = () => { setEditId(null); setForm({ ...emptyForm, categoryId: categories[0]?.id || 0 }); setShowForm(true); setError(''); setMessage(''); };
  const openEdit = (p) => { setEditId(p.id); setForm({ name: p.name, brand: p.brand, model: p.model || '', description: p.description || '', price: p.price, stockQuantity: p.stockQuantity, imageUrl: p.image || '', categoryId: p.categoryId }); setShowForm(true); setError(''); setMessage(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      if (editId) { await api.updateAdminProduct(editId, form, token); setMessage('Product updated.'); }
      else { await api.createAdminProduct(form, token); setMessage('Product created.'); }
      setShowForm(false); setEditId(null); setForm(emptyForm); await load();
    } catch (e) { setError(e.message); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try { await api.deleteAdminProduct(id, token); setMessage('Product deleted.'); await load(); }
    catch (e) { setError(e.message); }
  };

  const filtered = products.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}><div className="loader"></div></div>;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', color: 'var(--accent-gold)', margin: 0 }}>Products</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{products.length} products in catalog</p>
        </div>
        <button onClick={openCreate} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Plus size={16} /> Add Product</button>
      </div>

      {message && <div style={{ background: 'rgba(46,204,113,0.1)', border: '1px solid #2ecc71', padding: '0.75rem', borderRadius: '8px', color: '#2ecc71', marginBottom: '1rem' }}>{message}</div>}
      {error && <div style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid #e74c3c', padding: '0.75rem', borderRadius: '8px', color: '#e74c3c', marginBottom: '1rem' }}>{error}</div>}

      {showForm && (
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>{editId ? 'Edit Product' : 'Add Product'}</h3>
            <button onClick={() => setShowForm(false)} style={{ color: 'var(--text-secondary)' }}><X size={20} /></button>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}><label className="form-label">Name *</label><input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
            <div className="form-group" style={{ margin: 0 }}><label className="form-label">Brand *</label><input className="form-control" value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} required /></div>
            <div className="form-group" style={{ margin: 0 }}><label className="form-label">Model</label><input className="form-control" value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} /></div>
            <div className="form-group" style={{ margin: 0 }}><label className="form-label">Category</label><select className="form-control" value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: Number(e.target.value) }))}>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div className="form-group" style={{ margin: 0 }}><label className="form-label">Price *</label><input type="number" className="form-control" value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} required min={0} /></div>
            <div className="form-group" style={{ margin: 0 }}><label className="form-label">Stock *</label><input type="number" className="form-control" value={form.stockQuantity} onChange={e => setForm(f => ({ ...f, stockQuantity: Number(e.target.value) }))} required min={0} /></div>
            <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}><label className="form-label">Image URL</label><input className="form-control" value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} /></div>
            <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}><label className="form-label">Description</label><textarea className="form-control" rows="3" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn-primary">{editId ? 'Update Product' : 'Create Product'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ marginBottom: '1rem', position: 'relative' }}>
        <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
        <input className="form-control" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.25rem' }} />
      </div>

      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              {['Image', 'Name', 'Brand', 'Category', 'Price', 'Stock', 'Actions'].map(h => <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.5rem 1rem' }}><img src={p.image} alt="" style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} /></td>
                  <td style={{ padding: '0.5rem 1rem', fontWeight: 500 }}>{p.name}</td>
                  <td style={{ padding: '0.5rem 1rem', color: 'var(--text-secondary)' }}>{p.brand}</td>
                  <td style={{ padding: '0.5rem 1rem', color: 'var(--text-secondary)' }}>{p.category}</td>
                  <td style={{ padding: '0.5rem 1rem', fontWeight: 600, color: 'var(--accent-gold)' }}>${p.price.toLocaleString()}</td>
                  <td style={{ padding: '0.5rem 1rem' }}><span style={{ color: p.stockQuantity <= 5 ? '#e74c3c' : 'var(--text-primary)', fontWeight: p.stockQuantity <= 5 ? 600 : 400 }}>{p.stockQuantity}</span></td>
                  <td style={{ padding: '0.5rem 1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => openEdit(p)} style={{ color: '#3498db', padding: '0.3rem' }} title="Edit"><Edit3 size={16} /></button>
                      <button onClick={() => handleDelete(p.id, p.name)} style={{ color: '#e74c3c', padding: '0.3rem' }} title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No products found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
