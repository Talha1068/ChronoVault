import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) return null;

  return (
    <button onClick={scrollToTop} style={styles.button} aria-label="Scroll to top">
      <ChevronUp size={24} />
    </button>
  );
};

const styles = {
  button: {
    position: 'fixed',
    bottom: '2rem',
    right: '2rem',
    backgroundColor: 'var(--accent-gold)',
    color: 'var(--bg-primary)',
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    zIndex: 1000,
    transition: 'transform var(--transition-fast)',
  }
};

export default ScrollToTop;
