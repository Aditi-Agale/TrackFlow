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
    // Check if window is available (to support Vercel/SSR environments)
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem('user');
      console.log('Stored user from localStorage:', storedUser);
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error("Failed to parse stored user:", error);
          localStorage.removeItem('user');
        }
      }
    }
    setCheckingAuth(false);
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem('user');
    }
    setUser(null);
  };

  return (
    <Router>
      {checkingAuth ? (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>
      ) : !user ? (
        <Routes>
          <Route path="*" element={<Auth onLogin={(userData) => {
            setUser(userData);
            if (typeof window !== "undefined") {
              localStorage.setItem("user", JSON.stringify(userData));
            }
          }} />} />
        </Routes>
      ) : (
        <>
          <Navbar user={user} onLogout={handleLogout} />
          <div style={{ padding: '20px' }}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<Dashboard user={user} />} />
              <Route path="/leads" element={<Leads user={user} />} />
              <Route path="/orders" element={<Orders user={user} />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </div>
        </>
      )}
    </Router>
  );
}
