import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

export default function Navbar({ user, onLogout }) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    {
      path: '/dashboard',
      name: 'Dashboard',
      icon: '📊',
      description: 'Overview & Analytics'
    },
    {
      path: '/leads',
      name: 'Leads',
      icon: '👥',
      description: 'Manage Prospects'
    },
    {
      path: '/orders',
      name: 'Orders',
      icon: '📦',
      description: 'Track Fulfillment'
    },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const getInitial = name => name ? name.charAt(0).toUpperCase() : 'U';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand */}
        <div className="navbar-brand">
          <div className="brand-icon">🚀</div>
          <div className="brand-content">
            <div className="brand-name">TrackFlow</div>
            <div className="brand-tagline">CRM & Operations</div>
          </div>
        </div>

        {/* Center Indicator */}
        <div className="navbar-center">
          <div className="nav-indicator"></div>
        </div>

        {/* Navigation Links */}
        <ul className={`navbar-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          {navItems.map((item, index) => (
            <li
              key={item.path}
              className={location.pathname === item.path ? 'active' : ''}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Link to={item.path} onClick={() => setIsMobileMenuOpen(false)}>
                <div className="nav-link-content">
                  <span className="nav-icon">{item.icon}</span>
                  <div className="nav-text">
                    <span className="nav-name">{item.name}</span>
                    <span className="nav-description">{item.description}</span>
                  </div>
                </div>
                <div className="nav-link-decoration"></div>
              </Link>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="navbar-actions">
          <button className="notification-btn">
            <span className="notification-icon">🔔</span>
            <span className="notification-badge">3</span>
          </button>

          {/* User Menu */}
          <div className="user-menu">
            <div className="user-avatar">{getInitial(user?.name)}</div>
            <div className="user-info">
              <span className="user-name">{user?.name || 'User'}</span>
              <span className="user-role">Admin</span>
            </div>
            <button className="logout-btn" onClick={onLogout} title="Logout">🚪</button>
          </div>
        </div>

        {/* Hamburger Menu */}
        <button
          className={`mobile-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <div className="navbar-glow"></div>
    </nav>
  );
}
