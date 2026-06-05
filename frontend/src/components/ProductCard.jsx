import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);

  const isWished = isInWishlist(product.id);

  return (
    <div className="product-card">
      <div className="product-image-container">
        <Link to={`/product/${product.id}`}>
          <img src={product.image} alt={product.name} className="product-image" loading="lazy" />
        </Link>
        <button 
          className="wishlist-btn" 
          onClick={() => toggleWishlist(product)}
          aria-label="Toggle wishlist"
        >
          <Heart size={20} fill={isWished ? 'var(--accent-red)' : 'transparent'} color={isWished ? 'var(--accent-red)' : 'var(--text-primary)'} />
        </button>
        {!product.inStock && <div className="out-of-stock-badge">Out of Stock</div>}
      </div>
      
      <div className="product-info">
        <span className="product-brand">{product.brand}</span>
        <Link to={`/product/${product.id}`}>
          <h3 className="product-name">{product.name}</h3>
        </Link>
        <div className="product-bottom">
          <span className="product-price">${product.price.toLocaleString()}</span>
          <button 
            className="add-to-cart-btn"
            onClick={() => addToCart(product)}
            disabled={!product.inStock}
            aria-label="Add to cart"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
