import React, { useEffect } from 'react';

const About = () => {
  useEffect(() => {
    document.title = 'Our Story | Chronos';
  }, []);

  return (
    <div className="container animate-fade-in" style={{ padding: '4rem 1.5rem', maxWidth: '800px' }}>
      <h1 className="page-title" style={{ fontSize: '3rem', marginBottom: '2rem', color: 'var(--accent-gold)', textAlign: 'center', fontFamily: 'var(--font-serif)' }}>Our Story</h1>
      
      <img 
        src="https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?q=80&w=2070&auto=format&fit=crop" 
        alt="Watchmaking" 
        style={{ width: '100%', borderRadius: '8px', marginBottom: '3rem' }} 
      />

      <div style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', lineHeight: '1.8' }}>
        <p style={{ marginBottom: '1.5rem' }}>
          Founded in 1990, Chronos began with a simple yet ambitious vision: to create timepieces that are as enduring as time itself. Our journey started in a small workshop in Geneva, where master watchmakers poured their passion into every gear and spring.
        </p>
        <p style={{ marginBottom: '1.5rem' }}>
          Over the decades, we have evolved, embracing modern technology while remaining steadfast in our commitment to traditional craftsmanship. Every Chronos watch is a testament to precision engineering and timeless design.
        </p>
        <h2 style={{ color: 'var(--text-primary)', marginTop: '3rem', marginBottom: '1.5rem', fontFamily: 'var(--font-serif)' }}>Our Philosophy</h2>
        <p style={{ marginBottom: '1.5rem' }}>
          We believe that a watch is more than an instrument for measuring time. It is an expression of individuality, a marker of milestones, and a legacy to be passed down through generations. That's why we source only the finest materials—from scratch-resistant sapphire crystal to surgical-grade stainless steel and premium leathers.
        </p>
        <p>
          At Chronos, we don't just make watches; we craft companions for life's greatest moments.
        </p>
      </div>
    </div>
  );
};

export default About;
