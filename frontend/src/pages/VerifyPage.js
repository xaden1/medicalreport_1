import React, { useState } from 'react';
import { generateHash } from '../services/ipfsService';
import { verifyReport } from '../services/sorobanService';
import './VerifyPage.css';

function VerifyPage() {
  const [patientId, setPatientId] = useState('');
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!patientId || !file) {
      setMessage('❌ Please provide both a Patient ID and a file.');
      setResultData(null);
      return;
    }

    setLoading(true);
    setMessage('');
    setResultData(null);

    try {
      setMessage('🔐 Computing file hash...');
      const fileHash = await generateHash(file);

      setMessage('🔍 Querying Soroban blockchain...');
      const isVerified = await verifyReport(patientId, fileHash);

      setResultData({
        localMatch: isVerified,
        reportHash: fileHash,
      });

      setMessage(
        isVerified
          ? '✅ Report verified! Hash matches the on-chain record.'
          : '❌ Verification failed. No matching record found on the blockchain.'
      );
    } catch (err) {
      console.error('Verify error:', err);
      setMessage('❌ Verification error: ' + err.message);
      setResultData(null);
    }

    setLoading(false);
  };

  return (
    <div className="verify-page">
      <h2>✅ Verify Medical Report</h2>

      <p className="verify-description">
        Upload the original file and enter the Patient ID to confirm the
        document's hash matches what was recorded on the Soroban blockchain.
        No wallet required for verification.
      </p>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Patient ID</label>
          <input
            type="text"
            placeholder="e.g., P-12345"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            disabled={loading}
          />
        </div>
        <div>
          <label>Medical Report File</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            disabled={loading}
          />
          {file && <p className="file-name">📄 {file.name}</p>}
        </div>
        <button type="submit" disabled={loading}>
          {loading ? '⏳ Verifying...' : '🔍 Verify on Blockchain'}
        </button>
      </form>

      {message && (
        <div className={`message ${resultData?.localMatch ? 'success' : 'error'}`}>
          <p>{message}</p>
          {resultData && (
            <div className="result-data">
              <div className="status-item">
                <span className="status-label">Blockchain Match:</span>
                <span className={`status-value ${resultData.localMatch ? 'valid' : 'invalid'}`}>
                  {resultData.localMatch ? '✓ Valid' : '✗ Not Found'}
                </span>
              </div>
              <div className="status-item">
                <span className="status-label">SHA-256 Hash:</span>
                <code className="hash-full">{resultData.reportHash}</code>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default VerifyPage;
