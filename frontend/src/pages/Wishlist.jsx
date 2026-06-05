import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { WishlistContext } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';

const Wishlist = () => {
  const { wishlist } = useContext(WishlistContext);

  useEffect(() => {
    document.title = 'Wishlist | Chronos';
  }, []);

  if (wishlist.length === 0) {
    return (
      <div className="container empty-state animate-fade-in">
        <Heart size={64} />
        <h3>Your wishlist is empty</h3>
        <p>Save items you love here so you can easily find them later.</p>
        <Link to="/shop" className="btn-primary">Discover Watches</Link>
      </div>
    );
  }

  return (
    <div className="wishlist-page container animate-fade-in" style={{ padding: '4rem 1.5rem', minHeight: '60vh' }}>
      <h1 className="page-title" style={{ fontSize: '2.5rem', marginBottom: '3rem', color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>Your Wishlist</h1>
      <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '2rem' }}>
        {wishlist.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
