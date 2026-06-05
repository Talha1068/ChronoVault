import React, { useEffect } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { api } from '../api/client';
import './Home.css';

const Home = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    document.title = 'Chronos | Luxury Watches';
    const loadProducts = async () => {
      try {
        const data = await api.getProducts();
        setProducts(data);
      } catch (error) {
        console.error(error);
      }
    };
    loadProducts();
  }, []);

  const featuredProducts = products.slice(0, 4);

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content animate-fade-in">
          <h1 className="hero-title">Timeless Elegance</h1>
          <p className="hero-subtitle">
            Discover our exclusive collection of luxury timepieces crafted for precision and style.
          </p>
          <Link to="/shop" className="btn-primary">Explore Collection</Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-section container">
        <h2 className="section-title">Featured Timepieces</h2>
        <div className="product-grid">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* About Section Preview */}
      <section className="about-preview">
        <div className="container about-preview-container">
          <div className="about-preview-text">
            <h2>Crafting History Since 1990</h2>
            <p>
              At Chronos, we believe a watch is more than just a time-telling device. It is a statement of personal style, a family heirloom, and a marvel of engineering.
            </p>
            <Link to="/about" className="btn-secondary">Read Our Story</Link>
          </div>
          <div className="about-preview-image">
            <img 
              src="https://images.unsplash.com/photo-1547516508-4c1f9c7c4ec3?q=80&w=2089&auto=format&fit=crop" 
              alt="Watch craftsmanship" 
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
