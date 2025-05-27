import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import Leads from './Leads';
import Orders from './Orders';
import Auth from './Auth';
import Navbar from './Navbar';

export default function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    console.log('Stored user from localStorage:', storedUser);
    if (storedUser) setUser(JSON.parse(storedUser));
    setCheckingAuth(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  if (checkingAuth) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
  }

  return (
    <Router>
      {!user ? (
        <Routes>
          {/* Show only Auth route when user is not logged in */}
          <Route path="*" element={<Auth onLogin={setUser} />} />
        </Routes>
      ) : (
        <>
          <Navbar user={user} onLogout={handleLogout} />
          <div style={{ padding: '20px' }}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/leads" element={<Leads />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </div>
        </>
      )}
    </Router>
  );
}
