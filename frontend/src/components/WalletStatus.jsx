import React from 'react';

const WalletStatus = ({ isConnected, address, compact = false }) => {
  const formatAddress = (addr) => {
    if (!addr) return 'Not Connected';
    return `${addr.substring(0, 8)}...${addr.substring(addr.length - 8)}`;
  };

  if (compact) {
    return (
      <div className="p-4 text-xs">
        <p className="text-text-secondary mb-2 font-jetbrains">WALLET ADDRESS</p>
        <p className="text-text-primary font-jetbrains break-all">
          {formatAddress(address)}
        </p>
        <p className={`text-xs mt-3 font-inter ${isConnected ? 'text-accent-gold' : 'text-accent-bronze'}`}>
          {isConnected ? '● Connected' : '● Disconnected'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-dark-panel border border-dark-border rounded-lg p-6 mb-6">
      <div className="space-y-4">
        {/* Status Indicator */}
        <div className="flex items-center justify-between">
          <span className="text-text-secondary text-sm font-inter uppercase tracking-wide">
            Wallet Status
          </span>
          <div className={`flex items-center gap-2 ${isConnected ? 'text-accent-gold' : 'text-accent-bronze'}`}>
            <span className={`w-3 h-3 rounded-full ${isConnected ? 'bg-accent-gold' : 'bg-accent-bronze'} animate-pulse`}></span>
            <span className="text-xs font-inter">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {isConnected && address ? (
          <div className="space-y-3 border-t border-dark-border pt-4">
            <div>
              <label className="text-text-secondary text-xs uppercase tracking-wider font-jetbrains block mb-2">
                Wallet Address
              </label>
              <code className="text-text-primary text-xs font-jetbrains break-all bg-dark-bg p-3 rounded block border border-dark-border">
                {address}
              </code>
            </div>
            <div>
              <label className="text-text-secondary text-xs uppercase tracking-wider font-jetbrains block mb-2">
                Network
              </label>
              <p className="text-accent-gold text-sm font-inter">Stellar Testnet</p>
            </div>
          </div>
        ) : (
          <p className="text-text-muted text-sm font-inter italic pt-4 border-t border-dark-border">
            Connect a Stellar wallet to access medical records.
          </p>
        )}
      </div>
    </div>
  );
};

export default WalletStatus;
