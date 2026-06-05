import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    try {
      setError('');
      const response = await api.resetPassword(token, newPassword);
      setMessage(response.message);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '4rem 1.5rem', maxWidth: '500px' }}>
      <h1>Reset Password</h1>
      <form onSubmit={submit}>
        <div className="form-group">
          <label className="form-label">Reset Token</label>
          <input className="form-control" value={token} onChange={(e) => setToken(e.target.value)} required />
        </div>
        <div className="form-group">
          <label className="form-label">New Password</label>
          <input type="password" className="form-control" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
        </div>
        <button className="btn-primary" type="submit">Reset Password</button>
      </form>
      {message && <p style={{ marginTop: '1rem', color: 'green' }}>{message}</p>}
      {error && <p className="error-text">{error}</p>}
      <p style={{ marginTop: '1rem' }}><Link to="/login">Back to login</Link></p>
    </div>
  );
};

export default ResetPassword;
