import "./Dashboard.css";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts';

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
      value: metrics?.total_leads ?? 0, 
      icon: '👥',
      color: 'blue',
      description: 'All registered leads'
    },
    { 
      title: 'Open Leads', 
      value: metrics?.open_leads ?? 0, 
      icon: '🎯',
      color: 'green',
      description: 'Active opportunities'
    },
    { 
      title: 'Conversions', 
      value: metrics?.conversions ?? 0, 
      icon: '💰',
      color: 'purple',
      description: 'Successfully converted'
    },
    { 
      title: 'Orders in Progress', 
      value: metrics?.orders_in_progress ?? 0, 
      icon: '📦',
      color: 'orange',
      description: 'Currently processing'
    },
    { 
      title: 'Pending Follow-ups', 
      value: metrics?.pending_followups ?? 0, 
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
        <>
          <div className="metrics-grid">
            {metricCards.map((metric, index) => (
              <div key={metric.title} className={`metric-card ${metric.color}`} style={{ animationDelay: `${index * 0.1}s` }}>
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

          <div className="dashboard-graph">
            <h2 className="graph-title">Leads & Orders Summary</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: 'Total Leads', value: metrics?.total_leads ?? 0 },
                { name: 'Open Leads', value: metrics?.open_leads ?? 0 },
                { name: 'Conversions', value: metrics?.conversions ?? 0 },
                { name: 'Orders', value: metrics?.orders_in_progress ?? 0 },
                { name: 'Follow-ups', value: metrics?.pending_followups ?? 0 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
