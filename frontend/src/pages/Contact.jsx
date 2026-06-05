import React, { useState, useEffect } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.title = 'Contact Us | Chronos';
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    setSubmitted(true);
    setFormData({ name: '', email: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '4rem 1.5rem', maxWidth: '800px' }}>
      <h1 className="page-title" style={{ fontSize: '3rem', marginBottom: '2rem', color: 'var(--accent-gold)', textAlign: 'center', fontFamily: 'var(--font-serif)' }}>Contact Us</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', marginTop: '3rem' }}>
        <div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontFamily: 'var(--font-serif)' }}>Get in Touch</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Have a question about a timepiece, need help with an order, or want to arrange a consultation? We're here to help.
          </p>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Address</strong>
            <span style={{ color: 'var(--text-secondary)' }}>123 Horology Lane, Geneva, Switzerland</span>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Email</strong>
            <a href="mailto:info@chronos.com" style={{ color: 'var(--accent-gold)' }}>info@chronos.com</a>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Phone</strong>
            <span style={{ color: 'var(--text-secondary)' }}>+41 22 123 4567</span>
          </div>
        </div>

        <div>
          {submitted ? (
            <div style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)', border: '1px solid var(--accent-gold)', padding: '2rem', borderRadius: '8px', textAlign: 'center' }}>
              <h3 style={{ color: 'var(--accent-gold)', marginBottom: '1rem' }}>Message Sent!</h3>
              <p>Thank you for reaching out. We will get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input 
                  type="text" 
                  name="name" 
                  className="form-control" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input 
                  type="email" 
                  name="email" 
                  className="form-control" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea 
                  name="message" 
                  className="form-control" 
                  rows="5" 
                  value={formData.message} 
                  onChange={handleChange} 
                  required 
                ></textarea>
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%' }}>Send Message</button>
            </form>
          )}
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .container > div {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Contact;
