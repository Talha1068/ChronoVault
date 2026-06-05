import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [tokenHint, setTokenHint] = useState('');
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    try {
      setError('');
      const response = await api.forgotPassword(email);
      setMessage(response.message);
      setTokenHint(response.resetToken || '');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '4rem 1.5rem', maxWidth: '500px' }}>
      <h1>Forgot Password</h1>
      <p style={{ color: 'var(--text-secondary)' }}>Enter your email to request a password reset token.</p>
      <form onSubmit={submit}>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <button className="btn-primary" type="submit">Request Reset</button>
      </form>
      {message && <p style={{ marginTop: '1rem', color: 'green' }}>{message}</p>}
      {tokenHint && <p style={{ marginTop: '0.5rem' }}><strong>Dev token:</strong> {tokenHint}</p>}
      {error && <p className="error-text">{error}</p>}
      <p style={{ marginTop: '1rem' }}><Link to="/login">Back to login</Link></p>
    </div>
  );
};

export default ForgotPassword;
