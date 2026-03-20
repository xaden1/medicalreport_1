import React from 'react';

const LandingPage = ({ executeConnect, walletConnected }) => {
  return (
    <section className="max-w-6xl mx-auto mt-6 pb-8">
      <div className="bg-dark-panel border border-dark-border rounded-xl p-10 shadow-soft mb-8">
        <h1 className="text-4xl sm:text-5xl font-playfair text-accent-gold leading-tight mb-4">
          Decentralized Medical Archive
        </h1>
        <p className="text-text-secondary text-lg max-w-3xl mb-6 font-inter">
          Verifiable medical records secured by cryptography and patient ownership.
          Explore healthcare documents as a secure digital research vault.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={executeConnect}
            className="button-primary"
          >
            {walletConnected ? 'Wallet Connected' : 'Connect Wallet'}
          </button>
          <span className="text-sm text-text-secondary font-jetbrains">
            {walletConnected ? 'Wallet linked to session.' : 'Connect your Stellar wallet to begin.'}
          </span>
        </div>

        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: '🔐', title: 'Cryptographic Integrity', description: 'Records are hashed and anchored to Stellar for immutability.' },
            { icon: '📚', title: 'Archival Workflow', description: 'Organize patient files as a scholarly archive, not a dashboard clutter.' },
            { icon: '🛡️', title: 'Institutional Audit', description: 'Verification seals and status badges mirror formal certificates.' },
            { icon: '⏳', title: 'Timeline Provenance', description: 'View chronological medical history with lineage context.' },
          ].map((item) => (
            <div key={item.title} className="bg-dark-bg border border-dark-border rounded-lg p-4">
              <div className="text-accent-gold text-2xl mb-2">{item.icon}</div>
              <h3 className="text-text-primary font-playfair font-semibold mb-1">{item.title}</h3>
              <p className="text-text-secondary text-sm font-inter">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <article className="card-soft">
          <h2 className="section-title">Feature Overview</h2>
          <ul className="list-disc list-inside text-text-secondary font-inter space-y-2 text-sm">
            <li>Ledger-anchored report hashing for non-repudiation.</li>
            <li>Role-aware vault access for Doctor / Patient experiences.</li>
            <li>Secure upload, verify, and timeline modules.</li>
          </ul>
        </article>

        <article className="card-soft">
          <h2 className="section-title">Blockchain Verification</h2>
          <p className="text-text-secondary text-sm font-inter mb-4">
            Each uploaded record is stored with a hash and metadata. Verify report authenticity against an immutable cryptographic proof.
          </p>
          <p className="text-text-primary text-sm font-jetbrains">Hash example:</p>
          <code className="block bg-dark-bg border border-dark-border p-2 rounded text-xs mt-1">9f18d8a4ef22c5f81ba1f3d5c2e7f0bcd456a1a0542e8c6c1f3a5b6c7d8e9f0a</code>
        </article>

        <article className="card-soft">
          <h2 className="section-title">Demo Preview</h2>
          <ol className="text-text-secondary text-sm font-inter space-y-2 list-decimal list-inside">
            <li>Connect Wallet (Stellar Testnet).</li>
            <li>Upload a medical report file.</li>
            <li>Record is hashed and submitted to Stellar.</li>
            <li>Use Verify tool to confirm authenticity.</li>
            <li>Explore Patient Timeline in archive.</li>
          </ol>
        </article>
      </div>
    </section>
  );
};

export default LandingPage;
