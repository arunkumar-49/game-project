import React, { useState } from 'react';
import { useAuth } from './AuthContext';

function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, register, loading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) {
      await login(username, password);
    } else {
      await register(username, password);
    }
  };

  return (
    <div className="glass-panel auth-container">
      <h2>{isLogin ? 'SYSTEM LOGIN' : 'NEW PLAYER'}</h2>
      
      {error && <div className="error-msg">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>USERNAME</label>
          <input
            className="styled-input"
            type="text"
            placeholder="Enter Agent Name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            minLength={3}
            maxLength={15}
            required
          />
        </div>
        
        <div className="form-group">
          <label>PASSWORD</label>
          <input
            className="styled-input"
            type="password"
            placeholder="Enter Access Code"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </div>
        
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? 'PROCESSING...' : (isLogin ? 'ENTER GAME' : 'REGISTER')}
        </button>
      </form>

      <div className="auth-switch">
        <p>
          {isLogin ? "No access ID?" : "Already an Agent?"}
          <span 
            className="switch-link" 
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? ' Create Account' : ' Login Here'}
          </span>
        </p>
      </div>
    </div>
  );
}

export default AuthForm;