import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { api } from '../api/client';

const Login = () => {
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    document.title = 'Login | Chronos';
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submit = async () => {
      if (!validateForm()) return;
      try {
        const result = await api.login(formData);
        login(result.user, result.token);
        navigate('/');
      } catch (error) {
        setApiError(error.message);
      }
    };
    submit();
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '6rem 1.5rem', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '400px', backgroundColor: 'var(--bg-secondary)', padding: '2.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center', fontFamily: 'var(--font-serif)', color: 'var(--accent-gold)' }}>Welcome Back</h1>
        
        <form onSubmit={handleSubmit} noValidate>
          {apiError && <span className="error-text" style={{ display: 'block', marginBottom: '1rem' }}>{apiError}</span>}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              name="email"
              className={`form-control ${errors.email ? 'error-border' : ''}`}
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              name="password"
              className={`form-control ${errors.password ? 'error-border' : ''}`}
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>
          
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}>
            Sign In
          </button>
        </form>
        
        <p style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Don't have an account? <Link to="/signup" style={{ color: 'var(--accent-gold)', fontWeight: '500' }}>Sign up</Link>
        </p>
        <p style={{ marginTop: '1rem', textAlign: 'center' }}>
          <Link to="/forgot-password" style={{ color: 'var(--accent-gold)', fontWeight: '500' }}>Forgot password?</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
