import React, { useState } from 'react';

const WalletPage = () => {
  const [walletAddress] = useState('GABX1234567890ABCDEF');
  const [balance] = useState(1023.45);
  const [network] = useState('Stellar Testnet');

  return (
    <section className="space-y-6">
      <div className="card-soft">
        <h2 className="section-title">Wallet Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-dark-bg border border-dark-border rounded-lg p-4">
            <p className="text-text-secondary text-xs font-inter uppercase">Address</p>
            <p className="text-text-primary font-jetbrains break-all text-sm mt-1">{walletAddress}</p>
          </div>
          <div className="bg-dark-bg border border-dark-border rounded-lg p-4">
            <p className="text-text-secondary text-xs font-inter uppercase">Network</p>
            <p className="text-text-primary font-inter text-sm mt-1">{network}</p>
          </div>
          <div className="bg-dark-bg border border-dark-border rounded-lg p-4">
            <p className="text-text-secondary text-xs font-inter uppercase">Balance</p>
            <p className="text-accent-gold text-xl font-playfair mt-1">{balance.toLocaleString()} XLM</p>
          </div>
        </div>
      </div>

      <div className="card-soft">
        <h3 className="font-playfair text-lg text-text-primary mb-3">Key Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button className="button-primary">Refresh Balance</button>
          <button className="button-primary">Export Key File</button>
          <button className="button-primary">Disconnect Wallet</button>
        </div>
      </div>
    </section>
  );
};

export default WalletPage;
