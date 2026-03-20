import React, { useState } from 'react';
import './Insurance.css';

function Insurance() {
  const [patientId, setPatientId] = useState('');
  const [insuranceProvider, setInsuranceProvider] = useState('');
  const [treatmentType, setTreatmentType] = useState('');
  const [amount, setAmount] = useState('');
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);

  const handleCreateClaim = async (e) => {
    e.preventDefault();
    if (!patientId || !insuranceProvider || !treatmentType || !amount) return;

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/insurance/claim/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, insuranceProvider, treatmentType, amount: parseFloat(amount) }),
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedClaim(data.claim);
        alert('Claim created successfully!');
        setPatientId('');
        setInsuranceProvider('');
        setTreatmentType('');
        setAmount('');
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleLoadClaims = async () => {
    if (!patientId) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/insurance/claims/${patientId}`);
      if (res.ok) {
        const data = await res.json();
        setClaims(data.claims || []);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleApproveClaim = async (claimIdToApprove) => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/insurance/claim/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId: claimIdToApprove }),
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedClaim(data.claim);
        alert('Claim approved! Payment initiated.');
      }
    } catch (err) {
      console.error(err);
      alert('Error approving claim');
    }
    setLoading(false);
  };

  return (
    <div className="insurance">
      <h2>💳 Insurance Claim Automation</h2>
      <p className="subtitle">Automated medical verification and insurance claim processing</p>

      <div className="insurance-grid">
        <div className="card form-card">
          <h3>Create Insurance Claim</h3>
          <form onSubmit={handleCreateClaim}>
            <div>
              <label>Patient ID</label>
              <input
                type="text"
                placeholder="P-12345"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label>Insurance Provider</label>
              <input
                type="text"
                placeholder="Medicare/BlueCross"
                value={insuranceProvider}
                onChange={(e) => setInsuranceProvider(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label>Treatment Type</label>
              <input
                type="text"
                placeholder="Hospitalization"
                value={treatmentType}
                onChange={(e) => setTreatmentType(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label>Claim Amount ($)</label>
              <input
                type="number"
                placeholder="5000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={loading}
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Claim'}
            </button>
          </form>
        </div>

        <div className="card claims-card">
          <h3>View Claims</h3>
          <div className="search-section">
            <input
              type="text"
              placeholder="Enter Patient ID"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
            />
            <button onClick={handleLoadClaims} disabled={loading}>
              Load Claims
            </button>
          </div>
          
          {claims.length > 0 && (
            <div className="claims-list">
              {claims.map((claim) => (
                <div key={claim.claimId} className="claim-item" onClick={() => setSelectedClaim(claim)}>
                  <div className="claim-header">
                    <span className={`status-badge ${claim.status}`}>{claim.status.toUpperCase()}</span>
                    <span className="claim-amount">${claim.amount}</span>
                  </div>
                  <p className="claim-type">{claim.treatmentType}</p>
                  <p className="claim-date">{new Date(claim.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedClaim && (
          <div className="card claim-details-card">
            <h3>Claim Details</h3>
            <div className="claim-detail-view">
              <div className="detail-row">
                <span>Claim ID:</span>
                <strong>{selectedClaim.claimId}</strong>
              </div>
              <div className="detail-row">
                <span>Status:</span>
                <span className={`badge ${selectedClaim.status}`}>{selectedClaim.status}</span>
              </div>
              <div className="detail-row">
                <span>Amount:</span>
                <strong>${selectedClaim.amount}</strong>
              </div>
              <div className="detail-row">
                <span>Treatment:</span>
                <span>{selectedClaim.treatmentType}</span>
              </div>
              <div className="detail-row">
                <span>Medical Verified:</span>
                <span>{selectedClaim.medicalProofVerified ? '✓ Yes' : '✗ Pending'}</span>
              </div>

              {selectedClaim.status === 'verified' && !selectedClaim.approved && (
                <button
                  className="btn-approve"
                  onClick={() => handleApproveClaim(selectedClaim.claimId)}
                  disabled={loading}
                >
                  Approve & Process Payment
                </button>
              )}
              
              {selectedClaim.status === 'approved' && (
                <div className="success-message">
                  ✅ Claim approved! Payment has been initiated to your account.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Insurance;
