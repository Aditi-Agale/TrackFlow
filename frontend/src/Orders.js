import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./Orders.css";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    axios.get('http://localhost:5000/orders/all')
      .then(res => {
        setOrders(res.data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/orders/${id}`, { status });
      
      if (status === "Dispatched") {
        await axios.post(`http://localhost:5000/orders/${id}/send-dispatch-email`);
        alert('Order dispatched - Confirmation email sent');
      }
      
      const res = await axios.get('http://localhost:5000/orders/all');
      setOrders(res.data);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handleFileChange = (orderId, e) => {
    setSelectedFiles(prev => ({ ...prev, [orderId]: e.target.files[0] }));
  };

  const uploadDocument = async (orderId) => {
    if (!selectedFiles[orderId]) return alert('No file selected');
    const data = new FormData();
    data.append('document', selectedFiles[orderId]);
    
    try {
      await axios.post(`http://localhost:5000/orders/${orderId}/upload`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Document uploaded');
      setSelectedFiles(prev => ({ ...prev, [orderId]: null }));

      const res = await axios.get('http://localhost:5000/orders/all');
      setOrders(res.data);
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document');
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Order Received': '📥',
      'In Development': '🔧',
      'Ready to Dispatch': '📦',
      'Dispatched': '🚚'
    };
    return icons[status] || '📋';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Order Received': 'blue',
      'In Development': 'orange',
      'Ready to Dispatch': 'purple',
      'Dispatched': 'green'
    };
    return colors[status] || 'gray';
  };

  return (
    <div className="orders-container">
      <div className="page-header">
        <h1 className="page-title">Order Management</h1>
        <p className="page-subtitle">Track and manage your order fulfillment</p>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading orders...</p>
        </div>
      ) : (
        <div className="orders-section">
          <div className="section-header">
            <h2 className="section-title">All Orders ({orders.length})</h2>
            <div className="orders-stats">
              <div className="stat-item">
                <span className="stat-icon">📥</span>
                <span className="stat-count">{orders.filter(o => o.status === 'Order Received').length}</span>
                <span className="stat-label">Received</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">🔧</span>
                <span className="stat-count">{orders.filter(o => o.status === 'In Development').length}</span>
                <span className="stat-label">Development</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">📦</span>
                <span className="stat-count">{orders.filter(o => o.status === 'Ready to Dispatch').length}</span>
                <span className="stat-label">Ready</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">🚚</span>
                <span className="stat-count">{orders.filter(o => o.status === 'Dispatched').length}</span>
                <span className="stat-label">Dispatched</span>
              </div>
            </div>
          </div>

          <div className="orders-grid">
            {orders.map((order, index) => (
              <div key={order.id} className={`order-card status-${getStatusColor(order.status)}`} style={{animationDelay: `${index * 0.1}s`}}>
                <div className="order-header">
                  <div className="order-id">
                    <span className="id-label">Order #</span>
                    <span className="id-value">{order.id}</span>
                  </div>
                  <div className={`status-badge ${getStatusColor(order.status)}`}>
                    <span className="status-icon">{getStatusIcon(order.status)}</span>
                    <span className="status-text">{order.status}</span>
                  </div>
                </div>

                <div className="order-details">
                  <div className="detail-row">
                    <div className="detail-item">
                      <span className="detail-label">Lead ID:</span>
                      <span className="detail-value">#{order.lead_id}</span>
                    </div>
                  </div>
                  
                  <div className="detail-row">
                    <div className="detail-item">
                      <span className="detail-label">Courier:</span>
                      <span className="detail-value">{order.courier || 'Not assigned'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Tracking:</span>
                      <span className="detail-value">{order.tracking_number || 'Not available'}</span>
                    </div>
                  </div>
                </div>

                <div className="order-controls">
                  <div className="control-group">
                    <label className="control-label">Update Status:</label>
                    <select 
                      onChange={e => updateStatus(order.id, e.target.value)} 
                      value={order.status}
                      className="control-select"
                    >
                      {['Order Received', 'In Development', 'Ready to Dispatch', 'Dispatched'].map(s => (
                        <option key={s} value={s}>{getStatusIcon(s)} {s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="control-group file-upload-group">
                    <label className="control-label">Upload Document:</label>
                    <div className="file-upload-container">
                      <input 
                        type="file" 
                        onChange={e => handleFileChange(order.id, e)}
                        className="file-input"
                        id={`file-${order.id}`}
                      />
                      <label htmlFor={`file-${order.id}`} className="file-label">
                        <span className="file-icon">📎</span>
                        Choose File
                      </label>
                      <button 
                        onClick={() => uploadDocument(order.id)}
                        className="upload-btn"
                      >
                        <span className="btn-icon">⬆️</span>
                        Upload
                      </button>
                    </div>
                  </div>
                </div>

                {order.documents && order.documents.length > 0 && (
                  <div className="documents-section">
                    <h4 className="documents-title">Documents</h4>
                    <div className="documents-list">
                      {order.documents.map((doc, i) => (
                        <a 
                          key={i}
                          href={`http://localhost:5000/uploads/${doc}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="document-link"
                        >
                          <span className="doc-icon">📄</span>
                          {doc}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="order-decoration"></div>
              </div>
            ))}
          </div>

          {orders.length === 0 && !isLoading && (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3>No Orders Found</h3>
              <p>Orders will appear here when leads are converted</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}