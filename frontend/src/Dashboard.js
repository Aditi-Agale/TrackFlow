import "./Dashboard.css";
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const [metrics, setMetrics] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    axios.get('http://localhost:5000/dashboard')
      .then(res => {
        setMetrics(res.data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  const metricCards = [
    { 
      title: 'Total Leads', 
      value: metrics.total_leads || 0, 
      icon: '👥',
      color: 'blue',
      description: 'All registered leads'
    },
    { 
      title: 'Open Leads', 
      value: metrics.open_leads || 0, 
      icon: '🎯',
      color: 'green',
      description: 'Active opportunities'
    },
    { 
      title: 'Conversions', 
      value: metrics.conversions || 0, 
      icon: '💰',
      color: 'purple',
      description: 'Successfully converted'
    },
    { 
      title: 'Orders in Progress', 
      value: metrics.orders_in_progress || 0, 
      icon: '📦',
      color: 'orange',
      description: 'Currently processing'
    },
    { 
      title: 'Pending Follow-ups', 
      value: metrics.pending_followups || 0, 
      icon: '⏰',
      color: 'red',
      description: 'Require attention'
    }
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard Overview</h1>
        <p className="dashboard-subtitle">Track your business performance at a glance</p>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      ) : (
        <div className="metrics-grid">
          {metricCards.map((metric, index) => (
            <div key={metric.title} className={`metric-card ${metric.color}`} style={{animationDelay: `${index * 0.1}s`}}>
              <div className="metric-icon">{metric.icon}</div>
              <div className="metric-content">
                <h3 className="metric-title">{metric.title}</h3>
                <div className="metric-value">{metric.value}</div>
                <p className="metric-description">{metric.description}</p>
              </div>
              <div className="metric-decoration"></div>
            </div>
          ))}
        </div>
      )}

      <div className="dashboard-actions">
        <button className="action-btn primary">
          <span className="btn-icon">➕</span>
          Quick Add Lead
        </button>
        <button className="action-btn secondary">
          <span className="btn-icon">📊</span>
          View Reports
        </button>
        <button className="action-btn tertiary">
          <span className="btn-icon">⚙️</span>
          Settings
        </button>
      </div>
    </div>
  );
}