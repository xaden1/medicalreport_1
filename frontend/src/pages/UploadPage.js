import React, { useState } from 'react';
import { uploadToIPFS, generateHash } from '../services/ipfsService';
import { addReport } from '../services/sorobanService';
import './UploadPage.css';

function UploadPage({ walletConnected, walletAddress }) {
  const [patientId, setPatientId] = useState('');
  const [doctor, setDoctor] = useState('');
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resultData, setResultData] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!walletConnected || !walletAddress) {
      setMessage('❌ Please connect your Freighter wallet first.');
      setSuccess(false);
      return;
    }

    if (!patientId || !doctor || !file) {
      setMessage('❌ Please fill in all fields and select a file.');
      setSuccess(false);
      return;
    }

    setLoading(true);
    setMessage('');
    setResultData(null);

    try {
      setMessage('🔐 Generating secure file hash...');
      const fileHash = await generateHash(file);

      setMessage('☁️ Uploading document to IPFS...');
      const ipfsResult = await uploadToIPFS(file);
      if (!ipfsResult.success) throw new Error(ipfsResult.error);

      setMessage('✍️ Please sign the transaction in Freighter...');
      await addReport(walletAddress, patientId, fileHash, `Uploaded by ${doctor}`);

      setMessage('✅ Report successfully published to the blockchain!');
      setSuccess(true);
      setResultData({
        reportHash: fileHash,
        ipfsHash: ipfsResult.ipfsHash,
        ipfsUrl: ipfsResult.pinataURL,
      });

      // Reset form
      setPatientId('');
      setDoctor('');
      setFile(null);
    } catch (err) {
      console.error('Upload error:', err);
      setMessage('❌ Upload failed: ' + err.message);
      setSuccess(false);
    }

    setLoading(false);
  };

  if (!walletConnected) {
    return (
      <div className="upload-page">
        <h2>📤 Upload Medical Report</h2>
        <div className="message error">
          <p>🔒 Please connect your Freighter wallet to upload reports.</p>
          <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', opacity: 0.75 }}>
            Use the wallet button in the top-right navigation bar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="upload-page">
      <h2>📤 Upload Medical Report</h2>

      <div className="wallet-badge">
        🔗 Connected: <code>{walletAddress.substring(0, 8)}...{walletAddress.slice(-8)}</code>
      </div>

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
          <label>Doctor Name</label>
          <input
            type="text"
            placeholder="e.g., Dr. Smith"
            value={doctor}
            onChange={(e) => setDoctor(e.target.value)}
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
          {loading ? '⏳ Processing...' : '🚀 Upload to Blockchain'}
        </button>
      </form>

      {message && (
        <div className={`message ${success ? 'success' : 'error'}`}>
          <p>{message}</p>
          {resultData && (
            <div className="result-data">
              <p>
                <strong>SHA-256 Hash:</strong>{' '}
                <code>{resultData.reportHash}</code>
              </p>
              <p>
                <strong>IPFS CID:</strong>{' '}
                <code>{resultData.ipfsHash}</code>
              </p>
              {resultData.ipfsUrl && (
                <p>
                  <strong>IPFS URL:</strong>{' '}
                  <a href={resultData.ipfsUrl} target="_blank" rel="noreferrer">
                    {resultData.ipfsUrl}
                  </a>
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default UploadPage;
