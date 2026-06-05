import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, Search, Menu, X } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { cartItemCount } = useContext(CartContext);
  const { wishlist } = useContext(WishlistContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo">
          CHRONOVAULT<span>.</span>
        </Link>

        {/* Desktop Menu */}
        <ul className="navbar-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/shop">Shop</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/contact">Contact</Link></li>
          {user?.role === 'admin' && <li><Link to="/admin">Admin</Link></li>}
        </ul>

        <div className="navbar-actions">
          <form className="navbar-search desktop-only" onSubmit={handleSearchSubmit}>
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit"><Search size={18} /></button>
          </form>

          <Link to="/wishlist" className="action-icon">
            <Heart size={22} />
            {wishlist.length > 0 && <span className="badge">{wishlist.length}</span>}
          </Link>
          
          <Link to="/cart" className="action-icon">
            <ShoppingCart size={22} />
            {cartItemCount > 0 && <span className="badge">{cartItemCount}</span>}
          </Link>

          <Link to={user ? "/profile" : "/login"} className="action-icon desktop-only">
            <User size={22} />
          </Link>

          <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="mobile-menu animate-fade-in">
          <form className="navbar-search mobile-search" onSubmit={handleSearchSubmit}>
            <input 
              type="text" 
              placeholder="Search watches..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit"><Search size={18} /></button>
          </form>
          <ul className="mobile-links">
            <li><Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link></li>
            <li><Link to="/shop" onClick={() => setIsMenuOpen(false)}>Shop</Link></li>
            <li><Link to="/about" onClick={() => setIsMenuOpen(false)}>About</Link></li>
            <li><Link to="/contact" onClick={() => setIsMenuOpen(false)}>Contact</Link></li>
            <li><Link to={user ? "/profile" : "/login"} onClick={() => setIsMenuOpen(false)}>Account</Link></li>
            {user?.role === 'admin' && <li><Link to="/admin" onClick={() => setIsMenuOpen(false)}>Admin</Link></li>}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
