import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginSchema } from '../validation/schemas';
import toast from 'react-hot-toast';
import './AdminLogin.css';

function AdminLogin({ setIsAdminAuthenticated }) {
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const [showAdminReset, setShowAdminReset] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const [resetEmail, setResetEmail] = useState('');
  const [resetEmailError, setResetEmailError] = useState('');

  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [resetError, setResetError] = useState('');

  // ✅ Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      await loginSchema.validate(credentials, { abortEarly: false });

      const response = await fetch('http://localhost:5002/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');

      // ✅ Success
      setIsAdminAuthenticated(true);
      localStorage.setItem('isAdminAuthenticated', 'true');
      localStorage.setItem('adminRole', data.role);
      toast.success(`Logged in as ${data.role === 'master-admin' ? 'master ' : ''}admin successfully!`);
      navigate('/admin');
    } catch (error) {
      if (error.name === 'ValidationError') {
        const newErrors = {};
        error.inner.forEach((err) => {
          newErrors[err.path] = err.message;
        });
        setErrors(newErrors);
      } else {
        setErrors({
          email: 'Invalid email or password',
          password: 'Invalid email or password'
        });
        toast.error(error.message || 'Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Admin Reset Handler
  const handleAdminReset = async (e) => {
    e.preventDefault();
    setResetError('');
    setIsLoading(true);

    try {
      if (!newAdminEmail || !newAdminPassword) throw new Error('Email and password are required');
      if (newAdminPassword.length < 8) throw new Error('Password must be at least 8 characters');

      const response = await fetch('http://localhost:5002/api/admin/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newAdminEmail, password: newAdminPassword })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Reset failed');

      toast.success('Admin credentials reset successfully!');
      setShowAdminReset(false);
      setNewAdminEmail('');
      setNewAdminPassword('');
    } catch (error) {
      setResetError(error.message);
      toast.error(error.message || 'Reset failed');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Forgot Password Handler
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetEmailError('');
    setIsLoading(true);

    try {
      if (!resetEmail) throw new Error('Please enter your email');

      const response = await fetch('http://localhost:5002/api/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send reset email');

      toast.success('Reset link sent to your email!');
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (error) {
      setResetEmailError(error.message);
      toast.error(error.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Login View
  const renderLoginForm = () => (
    <div className="login-card">
      <h2>Admin Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={credentials.email}
            onChange={(e) =>
              setCredentials((prev) => ({ ...prev, email: e.target.value }))
            }
            className={errors.email ? 'error' : ''}
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={credentials.password}
            onChange={(e) =>
              setCredentials((prev) => ({ ...prev, password: e.target.value }))
            }
            className={errors.password ? 'error' : ''}
          />
          {errors.password && <span className="error-message">{errors.password}</span>}
        </div>

        <button type="submit" className="login-btn" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>

        <div className="reset-options">
          <button type="button" onClick={() => setShowAdminReset(true)} className="reset-btn">
            Reset Admin
          </button>
          <button type="button" onClick={() => setShowForgotPassword(true)} className="forgot-btn">
            Forgot Password?
          </button>
        </div>
      </form>
    </div>
  );

  // ✅ Forgot Password View
  const renderForgotPasswordForm = () => (
    <div className="login-card">
      <h2>Forgot Password</h2>
      <form onSubmit={handleForgotPassword}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            className={resetEmailError ? 'error' : ''}
          />
          {resetEmailError && <span className="error-message">{resetEmailError}</span>}
        </div>
        <button type="submit" className="login-btn" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </button>
        <button
          type="button"
          className="back-btn"
          onClick={() => {
            setShowForgotPassword(false);
            setResetEmail('');
            setResetEmailError('');
          }}
        >
          Back to Login
        </button>
      </form>
    </div>
  );

  // ✅ Admin Reset Form View
  const renderAdminResetForm = () => (
    <div className="login-card">
      <h2>Reset Admin Credentials</h2>
      <form onSubmit={handleAdminReset}>
        <div className="form-group">
          <label>New Email</label>
          <input
            type="email"
            value={newAdminEmail}
            onChange={(e) => setNewAdminEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>New Password</label>
          <input
            type="password"
            value={newAdminPassword}
            onChange={(e) => setNewAdminPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>
        {resetError && <div className="error-message">{resetError}</div>}
        <button type="submit" className="login-btn" disabled={isLoading}>
          {isLoading ? 'Resetting...' : 'Reset Admin Credentials'}
        </button>
        <button
          type="button"
          className="back-btn"
          onClick={() => {
            setShowAdminReset(false);
            setNewAdminEmail('');
            setNewAdminPassword('');
            setResetError('');
          }}
        >
          Back to Login
        </button>
      </form>
    </div>
  );

  return (
    <div className="admin-login">
      {!showAdminReset && !showForgotPassword
        ? renderLoginForm()
        : showForgotPassword
        ? renderForgotPasswordForm()
        : renderAdminResetForm()}
    </div>
  );
}

export default AdminLogin;
