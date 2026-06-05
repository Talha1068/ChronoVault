import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

const NotFound = () => {
  useEffect(() => {
    document.title = 'Page Not Found | Chronos';
  }, []);

  return (
    <div className="container empty-state animate-fade-in" style={{ padding: '6rem 1.5rem' }}>
      <AlertTriangle size={80} color="var(--accent-red)" style={{ marginBottom: '2rem' }} />
      <h1 style={{ fontSize: '4rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)', color: 'var(--accent-gold)' }}>404</h1>
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Page Not Found</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', marginBottom: '2rem', maxWidth: '500px' }}>
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link to="/" className="btn-primary">Return to Homepage</Link>
    </div>
  );
};

export default NotFound;
