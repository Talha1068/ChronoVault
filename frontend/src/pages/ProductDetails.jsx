import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Shield, ArrowLeft } from 'lucide-react';
import { api } from '../api/client';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import './ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  
  const { addToCart } = useContext(CartContext);
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const foundProduct = await api.getProductById(id);
        setProduct(foundProduct);
        document.title = `${foundProduct.name} | Chronos`;
      } catch (_error) {
        navigate('/not-found');
      }
    };
    loadProduct();
  }, [id, navigate]);

  if (!product) return null;

  const isWished = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  return (
    <div className="product-details-page container animate-fade-in">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} /> Back
      </button>

      <div className="product-details-container">
        <div className="product-image-large">
          <img src={product.image} alt={product.name} />
          {!product.inStock && <div className="out-of-stock-large">Out of Stock</div>}
        </div>

        <div className="product-info-large">
          <span className="product-brand-large">{product.brand}</span>
          <h1 className="product-name-large">{product.name}</h1>
          <div className="product-price-large">${product.price.toLocaleString()}</div>
          
          <p className="product-description">{product.description}</p>
          
          <div className="product-meta">
            <span><strong>Category:</strong> {product.category}</span>
            <span><strong>Rating:</strong> {product.rating} ★ ({product.reviews} reviews)</span>
          </div>

          <div className="product-actions">
            <div className="quantity-selector">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>-</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} disabled={!product.inStock}>+</button>
            </div>

            <button 
              className="btn-primary add-to-cart-large" 
              onClick={handleAddToCart}
              disabled={!product.inStock}
            >
              <ShoppingCart size={20} />
              Add to Cart
            </button>

            <button 
              className={`wishlist-large-btn ${isWished ? 'active' : ''}`}
              onClick={() => toggleWishlist(product)}
            >
              <Heart size={20} fill={isWished ? 'var(--accent-red)' : 'transparent'} />
            </button>
          </div>

          <div className="trust-badges">
            <div className="badge-item">
              <Shield size={24} color="var(--accent-gold)" />
              <span>2 Year Warranty</span>
            </div>
            <div className="badge-item">
              <Shield size={24} color="var(--accent-gold)" />
              <span>Authenticity Guaranteed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
