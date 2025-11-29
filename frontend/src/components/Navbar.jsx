import React from 'react';
import { useAuth } from '../auth/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="brand">
        NEON RUNNER
      </div>
      
      {user && (
        <div className="user-info">
          <span>
            Player: <span className="username">{user.username}</span>
          </span>
          <button className="btn-logout" onClick={logout}>
            LOGOUT
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;