import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./Leads.css";

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [formData, setFormData] = useState({
    name: '', contact: '', company: '', product_interest: '', stage: 'New', follow_up: ''
  });
  const [selectedFiles, setSelectedFiles] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    axios.get('https://trackflow-pp6f.onrender.com/leads/all')
      .then(res => {
        setLeads(res.data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post('https://trackflow-pp6f.onrender.com/leads', formData);
      window.location.reload();
    } catch (error) {
      console.error('Error adding lead:', error);
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (leadId, e) => {
    setSelectedFiles(prev => ({ ...prev, [leadId]: e.target.files[0] }));
  };

  const uploadDocument = async (leadId) => {
    if (!selectedFiles[leadId]) return alert('No file selected');
    const data = new FormData();
    data.append('document', selectedFiles[leadId]);
    try {
      await axios.post(`https://trackflow-pp6f.onrender.com/leads/${leadId}/upload`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Document uploaded');
      setSelectedFiles(prev => ({ ...prev, [leadId]: null }));
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document');
    }
  };

  const updateStage = async (leadId, newStage) => {
    try {
      await axios.put(`https://trackflow-pp6f.onrender.com/leads/${leadId}`, { stage: newStage });
      if (newStage === "Won") {
        await axios.post(`https://trackflow-pp6f.onrender.com/orders`, { lead_id: leadId, status: "Order Received" });
        alert('Lead won - Order created automatically');
      }
      const res = await axios.get('https://trackflow-pp6f.onrender.com/leads/all');
      setLeads(res.data);
    } catch (error) {
      console.error('Error updating stage:', error);
      alert('Failed to update stage');
    }
  };

  const getStageIcon = (stage) => {
    const icons = {
      'New': '🆕',
      'Contacted': '📞',
      'Qualified': '✅',
      'Proposal Sent': '📋',
      'Won': '🎉',
      'Lost': '❌'
    };
    return icons[stage] || '📝';
  };

  return (
    <div className="leads-container">
      <div className="page-header">
        <h1 className="page-title">Lead Management</h1>
        <p className="page-subtitle">Track and manage your sales prospects</p>
      </div>

      <div className="form-section">
        <h2 className="section-title">Add New Lead</h2>
        <form onSubmit={handleSubmit} className="lead-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input 
              id="name"
              name="name" 
              placeholder="Enter full name" 
              onChange={handleChange} 
              required 
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="contact">Contact</label>
            <input 
              id="contact"
              name="contact" 
              placeholder="Phone or email" 
              onChange={handleChange} 
              required 
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="company">Company</label>
            <input 
              id="company"
              name="company" 
              placeholder="Company name" 
              onChange={handleChange} 
              required 
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="product_interest">Product Interest</label>
            <input 
              id="product_interest"
              name="product_interest" 
              placeholder="Product of interest" 
              onChange={handleChange} 
              required 
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="stage">Stage</label>
            <select name="stage" onChange={handleChange} className="form-select">
              {['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'].map(s => (
                <option key={s} value={s}>{getStageIcon(s)} {s}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="follow_up">Follow-up Date</label>
            <input 
              id="follow_up"
              type="date" 
              name="follow_up" 
              onChange={handleChange} 
              className="form-input"
            />
          </div>
          
          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            <span className="btn-icon">➕</span>
            {isSubmitting ? 'Adding Lead...' : 'Add Lead'}
          </button>
        </form>
      </div>

      <div className="leads-section">
        <h2 className="section-title">All Leads ({leads.length})</h2>
        
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading leads...</p>
          </div>
        ) : (
          <div className="leads-grid">
            {leads.map(lead => (
              <div key={lead.id} className={`lead-card stage-${lead.stage.toLowerCase().replace(/\s+/g, '-')}`}>
                <div className="lead-header">
                  <div className="lead-avatar">{lead.name.charAt(0).toUpperCase()}</div>
                  <div className="lead-info">
                    <h3 className="lead-name">{lead.name}</h3>
                    <p className="lead-company">{lead.company}</p>
                  </div>
                  <div className="lead-stage-badge">
                    {getStageIcon(lead.stage)}
                  </div>
                </div>

                <div className="lead-details">
                  <div className="detail-item">
                    <span className="detail-label">Contact:</span>
                    <span className="detail-value">{lead.contact}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Product Interest:</span>
                    <span className="detail-value">{lead.product_interest}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Follow-up:</span>
                    <span className="detail-value">{lead.follow_up || 'Not scheduled'}</span>
                  </div>
                </div>

                <div className="lead-controls">
                  <div className="control-group">
                    <label className="control-label">Update Stage:</label>
                    <select
                      value={lead.stage}
                      onChange={e => updateStage(lead.id, e.target.value)}
                      className="control-select"
                    >
                      {['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'].map(s => (
                        <option key={s} value={s}>{getStageIcon(s)} {s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="control-group file-upload-group">
                    <label className="control-label">Upload Document:</label>
                    <div className="file-upload-container">
                      <input 
                        type="file" 
                        onChange={e => handleFileChange(lead.id, e)}
                        className="file-input"
                        id={`file-${lead.id}`}
                      />
                      <label htmlFor={`file-${lead.id}`} className="file-label">
                        <span className="file-icon">📎</span>
                        Choose File
                      </label>
                      <button 
                        onClick={() => uploadDocument(lead.id)}
                        className="upload-btn"
                      >
                        <span className="btn-icon">⬆️</span>
                        Upload
                      </button>
                    </div>
                  </div>
                </div>

                {lead.documents && lead.documents.length > 0 && (
                  <div className="documents-section">
                    <h4 className="documents-title">Documents</h4>
                    <div className="documents-list">
                      {lead.documents.map((doc, i) => (
                        <a 
                          key={i}
                          href={`https://trackflow-pp6f.onrender.com/uploads/${doc}`} 
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}