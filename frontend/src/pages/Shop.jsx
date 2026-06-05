import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { api } from '../api/client';
import { SearchX } from 'lucide-react';
import './Shop.css';

const Shop = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filter, setFilter] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';

  const categories = ['All', ...new Set(allProducts.map(p => p.category))];

  useEffect(() => {
    document.title = 'Shop | Chronos';
    const loadProducts = async () => {
      try {
        const data = await api.getProducts();
        setAllProducts(data);
      } catch (error) {
        console.error(error);
      }
    };
    loadProducts();
  }, []);

  useEffect(() => {
    let result = allProducts;
    
    if (filter !== 'All') {
      result = result.filter(p => p.category === filter);
    }
    
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(lowerQuery) || 
        p.brand.toLowerCase().includes(lowerQuery) ||
        (p.model || '').toLowerCase().includes(lowerQuery)
      );
    }

    if (minPrice !== '') {
      result = result.filter((p) => p.price >= Number(minPrice));
    }

    if (maxPrice !== '') {
      result = result.filter((p) => p.price <= Number(maxPrice));
    }
    
    setFilteredProducts(result);
  }, [filter, searchQuery, minPrice, maxPrice, allProducts]);

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="container">
          <h1 className="shop-title">Our Collection</h1>
          {searchQuery && (
            <p className="search-results-text">
              Showing results for: <strong>"{searchQuery}"</strong>
            </p>
          )}
        </div>
      </div>

      <div className="container shop-container">
        <div className="shop-sidebar">
          <h3>Categories</h3>
          <ul className="category-list">
            {categories.map(cat => (
              <li key={cat}>
                <button 
                  className={`category-btn ${filter === cat ? 'active' : ''}`}
                  onClick={() => setFilter(cat)}
                >
                  {cat}
                </button>
              </li>
            ))}
          </ul>
          <h3 style={{ marginTop: '1.5rem' }}>Price Range</h3>
          <div className="form-group">
            <label className="form-label">Min Price</label>
            <input type="number" className="form-control" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Max Price</label>
            <input type="number" className="form-control" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
          </div>
        </div>

        <div className="shop-content">
          <div className="shop-meta">
            <span>Showing {filteredProducts.length} results</span>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="product-grid">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="empty-state animate-fade-in">
              <SearchX size={64} />
              <h3>No watches found</h3>
              <p>We couldn't find any timepieces matching your search criteria. Try adjusting your filters or search term.</p>
              <button 
                className="btn-primary" 
                onClick={() => {
                  setFilter('All');
                  setMinPrice('');
                  setMaxPrice('');
                  // To clear URL search params nicely in real app, we'd use useSearchParams hook to replace URL
                  window.history.pushState({}, '', '/shop');
                  window.dispatchEvent(new Event('popstate'));
                }}
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
