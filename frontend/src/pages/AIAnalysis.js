import React, { useState } from 'react';
import './AIAnalysis.css';

function AIAnalysis() {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('report', file);

    try {
      const res = await fetch('http://localhost:5000/api/summarize', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setAnalysis(data.summary);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="ai-analysis">
      <h2>🤖 AI Medical Report Analysis</h2>
      <p className="subtitle">Upload a medical report for AI-powered summarization and key findings extraction</p>

      <div className="upload-section">
        <form onSubmit={handleAnalyze}>
          <div className="file-input-wrapper">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              disabled={loading}
            />
            {file && <p className="file-name">📄 {file.name}</p>}
          </div>
          <button type="submit" disabled={loading || !file}>
            {loading ? 'Analyzing...' : 'Analyze Report'}
          </button>
        </form>
      </div>

      {analysis && (
        <div className="analysis-results">
          <div className="result-item">
            <h3>📊 AI Analysis Results</h3>
            <div className="analysis-grid">
              <div className="analysis-card">
                <h4>Diagnosis</h4>
                <p className="highlight">{analysis.analysis.diagnosis}</p>
              </div>
              <div className="analysis-card">
                <h4>Severity</h4>
                <p className={`severity-${analysis.analysis.severity}`}>
                  {analysis.analysis.severity.toUpperCase()}
                </p>
              </div>
              <div className="analysis-card">
                <h4>Confidence</h4>
                <p className="confidence">{(analysis.analysis.confidence * 100).toFixed(0)}%</p>
              </div>
            </div>

            <div className="section">
              <h4>🔍 Key Findings</h4>
              <ul className="findings-list">
                {analysis.analysis.findings.map((finding, idx) => (
                  <li key={idx}>{finding}</li>
                ))}
              </ul>
            </div>

            <div className="section">
              <h4>💊 Recommendations</h4>
              <ul className="recommendations-list">
                {analysis.analysis.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AIAnalysis;
