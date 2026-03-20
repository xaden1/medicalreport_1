import React, { useState } from 'react';
import './Dashboard.css';

function Dashboard() {
  const [patientId, setPatientId] = useState('');
  const [identity, setIdentity] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadPatientData = async () => {
    if (!patientId) return;
    setLoading(true);
    
    try {
      // Load identity
      const identityRes = await fetch(`http://localhost:5000/api/identity/${patientId}`);
      if (identityRes.ok) {
        const identityData = await identityRes.json();
        setIdentity(identityData);
      }

      // Load timeline
      const timelineRes = await fetch(`http://localhost:5000/api/timeline/${patientId}`);
      if (timelineRes.ok) {
        const timelineData = await timelineRes.json();
        setTimeline(timelineData.timeline || []);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const generateQR = async () => {
    if (!patientId) return;
    try {
      const res = await fetch('http://localhost:5000/api/qr/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId }),
      });
      if (res.ok) {
        const data = await res.json();
        setQrCode(data.qrPassport);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>👤 Patient Dashboard</h2>
        <div className="search-box">
          <input
            type="text"
            placeholder="Enter Patient ID"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
          />
          <button onClick={loadPatientData} disabled={loading}>
            Load Profile
          </button>
        </div>
      </div>

      {identity && (
        <div className="dashboard-grid">
          <div className="card identity-card">
            <h3>📋 Medical Identity</h3>
            <div className="identity-details">
              <div className="detail-row">
                <span className="label">Blood Type:</span>
                <span className="value">{identity.bloodType}</span>
              </div>
              <div className="detail-row">
                <span className="label">Allergies:</span>
                <span className="value">{identity.allergies || 'None reported'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Emergency Contact:</span>
                <span className="value">{identity.emergencyContact || 'Not set'}</span>
              </div>
            </div>
            <button className="btn-primary" onClick={generateQR}>
              📲 Generate Emergency QR
            </button>
          </div>

          {qrCode && (
            <div className="card qr-card">
              <h3>🔐 Emergency Passport</h3>
              <img src={qrCode.qrCode} alt="Emergency QR Code" className="qr-image" />
              <p className="qr-info">Scan for emergency medical info</p>
            </div>
          )}

          <div className="card timeline-card">
            <h3>📅 Medical Timeline</h3>
            <div className="timeline-list">
              {timeline.length > 0 ? (
                timeline.map((event) => (
                  <div key={event.id} className="timeline-item">
                    <div className="timeline-date">
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                    <div className="timeline-content">
                      <h4>{event.title}</h4>
                      <p>{event.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-message">No medical events recorded</p>
              )}
            </div>
          </div>
        </div>
      )}

      {!identity && patientId && !loading && (
        <div className="empty-state">
          <p>No patient profile found. Create one to get started.</p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
