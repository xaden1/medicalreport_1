import React, { useState } from 'react';
import './ResearchMarketplace.css';

function ResearchMarketplace() {
  const [studies, setStudies] = useState([]);
  const [patientId, setPatientId] = useState('');
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [consents, setConsents] = useState([]);

  const loadStudies = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/research/studies');
      if (res.ok) {
        const data = await res.json();
        setStudies(data.studies || []);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const loadPatientConsents = async () => {
    if (!patientId) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/research/consents/${patientId}`);
      if (res.ok) {
        const data = await res.json();
        setConsents(data.consents || []);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleGrantConsent = async (studyId) => {
    if (!patientId) {
      alert('Please enter Patient ID');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/research/consent/grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, studyId, anonymized: true }),
      });
      if (res.ok) {
        alert('Research consent granted! Thank you for contributing to medical research.');
        loadPatientConsents();
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    loadStudies();
  }, []);

  return (
    <div className="research-marketplace">
      <h2>🔬 Research Data Marketplace</h2>
      <p className="subtitle">Share anonymized medical data to advance medical research and earn rewards</p>

      <div className="marketplace-grid">
        <div className="card research-list-card">
          <h3>Active Research Studies</h3>
          <button className="btn-refresh" onClick={loadStudies} disabled={loading}>
            🔄 Refresh Studies
          </button>
          
          {studies.length > 0 ? (
            <div className="studies-list">
              {studies.map((study) => (
                <div
                  key={study.studyId}
                  className="study-item"
                  onClick={() => setSelectedStudy(study)}
                >
                  <h4>{study.title}</h4>
                  <p className="institution">📍 {study.institution}</p>
                  <div className="study-meta">
                    <span className="participants">👥 {study.participantsCount} Participants</span>
                    <span className="status">Active</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No research studies available</p>
          )}
        </div>

        {selectedStudy && (
          <div className="card study-details-card">
            <h3>{selectedStudy.title}</h3>
            <div className="study-content">
              <p className="description">{selectedStudy.description}</p>
              
              <div className="study-info">
                <div className="info-row">
                  <span className="label">Institution:</span>
                  <span>{selectedStudy.institution}</span>
                </div>
                <div className="info-row">
                  <span className="label">Current Participants:</span>
                  <span>{selectedStudy.participantsCount}</span>
                </div>
                <div className="info-row">
                  <span className="label">Data Types Collected:</span>
                  <ul className="data-types">
                    {selectedStudy.dataTypes && selectedStudy.dataTypes.map((type) => (
                      <li key={type}>{type}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="consent-section">
                <h4>Patient Consent</h4>
                <p>Your data will be anonymized and used solely for research purposes.</p>
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Enter your Patient ID"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                  />
                  <button
                    className="btn-consent"
                    onClick={() => handleGrantConsent(selectedStudy.studyId)}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : '✅ Grant Consent'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="card my-consents-card">
          <h3>My Research Consents</h3>
          <div className="search-section">
            <input
              type="text"
              placeholder="Enter Patient ID"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
            />
            <button onClick={loadPatientConsents} disabled={loading}>
              Load Consents
            </button>
          </div>

          {consents.length > 0 ? (
            <div className="consents-list">
              {consents.map((consent) => (
                <div key={consent.consentId} className="consent-item">
                  <div className="consent-header">
                    <span className="study-name">Study #{consent.studyId}</span>
                    <span className={`privacy-badge ${consent.anonymized ? 'anonymized' : 'identified'}`}>
                      {consent.anonymized ? '🔒 Anonymized' : 'Identified'}
                    </span>
                  </div>
                  <p className="consent-date">Granted: {new Date(consent.grantedAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No active research consents</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResearchMarketplace;
