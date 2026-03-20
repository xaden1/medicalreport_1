import React, { useState } from 'react';
import './PrivacyProof.css';

function PrivacyProof() {
  const [patientId, setPatientId] = useState('');
  const [proofType, setProofType] = useState('vaccination');
  const [proofs, setProofs] = useState([]);
  const [verifyProofId, setVerifyProofId] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedProof, setSelectedProof] = useState(null);

  const proofTypes = [
    { value: 'vaccination', label: '💉 Vaccination Status' },
    { value: 'checkup', label: '🏥 Medical Checkup' },
    { value: 'health-status', label: '❤️ Health Status' },
  ];

  const handleGenerateProof = async (e) => {
    e.preventDefault();
    if (!patientId) return;

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/privacy/proof/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, proofType }),
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedProof(data.proof);
        alert('Privacy proof generated successfully!');
      }
    } catch (err) {
      console.error(err);
      alert('Error generating proof');
    }
    setLoading(false);
  };

  const handleLoadProofs = async () => {
    if (!patientId) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/privacy/proofs/${patientId}`);
      if (res.ok) {
        const data = await res.json();
        setProofs(data.proofs || []);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleVerifyProof = async () => {
    if (!verifyProofId) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/privacy/proof/${verifyProofId}/verify`);
      if (res.ok) {
        const data = await res.json();
        setVerificationResult(data.result);
      }
    } catch (err) {
      console.error(err);
      alert('Error verifying proof');
    }
    setLoading(false);
  };

  const getProofLabel = (type) => {
    return proofTypes.find((pt) => pt.value === type)?.label || type;
  };

  const getProofTypeIcon = (type) => {
    switch (type) {
      case 'vaccination':
        return '💉';
      case 'checkup':
        return '🏥';
      case 'health-status':
        return '❤️';
      default:
        return '📋';
    }
  };

  const isProofExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
  };

  return (
    <div className="privacy-proof">
      <h2>🔐 Privacy-Preserving Medical Proofs</h2>
      <p className="subtitle">Generate and verify anonymized medical proofs without exposing full records</p>

      <div className="proof-grid">
        <div className="card generate-card">
          <h3>Generate Privacy Proof</h3>
          <form onSubmit={handleGenerateProof}>
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
              <label>Proof Type</label>
              <select
                value={proofType}
                onChange={(e) => setProofType(e.target.value)}
                disabled={loading}
              >
                {proofTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <p className="description">
              Generate a cryptographic proof that you have a certain medical status without revealing sensitive details.
            </p>
            <button type="submit" disabled={loading}>
              {loading ? 'Generating...' : '✓ Generate Proof'}
            </button>
          </form>
        </div>

        {selectedProof && (
          <div className="card proof-generated-card">
            <h3>Proof Generated ✓</h3>
            <div className="proof-info">
              <div className="proof-header">
                <span className="proof-type">{getProofTypeIcon(selectedProof.proofType)} {getProofLabel(selectedProof.proofType)}</span>
                <span className={`validity-badge ${isProofExpired(selectedProof.expiry) ? 'expired' : 'valid'}`}>
                  {isProofExpired(selectedProof.expiry) ? '❌ Expired' : '✅ Valid'}
                </span>
              </div>

              <div className="proof-details">
                <div className="detail">
                  <span className="label">Proof ID:</span>
                  <code className="proof-id">{selectedProof.proofId}</code>
                </div>
                <div className="detail">
                  <span className="label">Proof Type:</span>
                  <span>{getProofLabel(selectedProof.proofType)}</span>
                </div>
                <div className="detail">
                  <span className="label">Status:</span>
                  <span className="status-proven">✓ Proven</span>
                </div>
                <div className="detail">
                  <span className="label">Generated:</span>
                  <span>{new Date(selectedProof.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="detail">
                  <span className="label">Expires:</span>
                  <span>{new Date(selectedProof.expiry).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="share-section">
                <p>Share this proof ID with hospitals, insurers, or employers:</p>
                <div className="copy-section">
                  <input type="text" value={selectedProof.proofId} readOnly />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedProof.proofId);
                      alert('Proof ID copied!');
                    }}
                  >
                    📋 Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="card my-proofs-card">
          <h3>My Privacy Proofs</h3>
          <div className="search-section">
            <input
              type="text"
              placeholder="Enter Patient ID"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
            />
            <button onClick={handleLoadProofs} disabled={loading}>
              Load Proofs
            </button>
          </div>

          {proofs.length > 0 ? (
            <div className="proofs-list">
              {proofs.map((proof) => (
                <div key={proof.proofId} className="proof-tile">
                  <div className="proof-tile-header">
                    <span className="proof-icon">{getProofTypeIcon(proof.proofType)}</span>
                    <span className="proof-name">{getProofLabel(proof.proofType)}</span>
                  </div>
                  <div className="expiry-indicator">
                    {isProofExpired(proof.expiry) ? (
                      <span className="expired">❌ Expired</span>
                    ) : (
                      <span className="valid">✅ Valid</span>
                    )}
                  </div>
                  <p className="proof-date">
                    Expires: {new Date(proof.expiry).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No privacy proofs yet</p>
          )}
        </div>

        <div className="card verify-card">
          <h3>Verify Privacy Proof</h3>
          <p className="description">
            Verify a privacy proof by entering its ID. This allows third parties (hospitals, insurers) to verify your medical status.
          </p>
          <div className="verify-section">
            <input
              type="text"
              placeholder="Enter proof ID to verify"
              value={verifyProofId}
              onChange={(e) => setVerifyProofId(e.target.value)}
            />
            <button onClick={handleVerifyProof} disabled={loading}>
              {loading ? 'Verifying...' : '🔍 Verify'}
            </button>
          </div>

          {verificationResult && (
            <div
              className={`verification-result ${
                verificationResult.valid ? 'valid' : 'invalid'
              }`}
            >
              <div className="result-header">
                {verificationResult.valid ? '✅ Proof Valid' : '❌ Proof Invalid'}
              </div>
              <div className="result-details">
                <div className="result-row">
                  <span>Proof ID:</span>
                  <code>{verificationResult.proofId}</code>
                </div>
                <div className="result-row">
                  <span>Type:</span>
                  <span>{getProofLabel(verificationResult.proofType)}</span>
                </div>
                <div className="result-row">
                  <span>Proven:</span>
                  <span>{verificationResult.proven ? '✓ Yes' : '✗ No'}</span>
                </div>
                {verificationResult.expiryDate && (
                  <div className="result-row">
                    <span>Expires:</span>
                    <span>{new Date(verificationResult.expiryDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PrivacyProof;
