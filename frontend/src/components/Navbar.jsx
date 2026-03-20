import React, { useState } from 'react';
import WalletStatus from './WalletStatus';

const Navbar = ({ walletConnected, walletAddress, network, userRole, onConnect, onDisconnect }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const formatAddress = (addr) => {
    if (!addr) return 'Not Connected';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 6)}`;
  };

  return (
    <nav className="fixed top-0 left-64 right-0 bg-dark-panel border-b border-dark-border h-16 flex items-center justify-between px-8 z-40">
      {/* Left Section - Title */}
      <div className="flex items-center gap-4">
        <h2 className="font-playfair text-lg text-text-primary">
          Medical Record System
        </h2>
      </div>

      {/* Right Section - Wallet & Status */}
      <div className="flex items-center gap-6">
        {/* Network Status */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-md bg-dark-hover border border-dark-border">
          <span className="w-2 h-2 rounded-full bg-accent-gold"></span>
          <span className="text-xs text-text-secondary font-inter">
            {network || 'Stellar Testnet'}
          </span>
        </div>

        {/* User Role */}
        {userRole && (
          <div className="text-xs font-inter text-text-secondary px-3 py-2 rounded-md bg-dark-hover border border-dark-border">
            {userRole}
          </div>
        )}

        {/* Wallet Status Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-dark-hover border border-accent-gold hover:bg-dark-border transition-colors"
          >
            <span className="text-text-primary font-inter text-sm">
              {formatAddress(walletAddress)}
            </span>
            <span className={`text-lg transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-dark-panel border border-dark-border rounded-md shadow-elevated overflow-hidden">
              <WalletStatus 
                isConnected={walletConnected} 
                address={walletAddress}
                compact={true}
              />
              <div className="border-t border-dark-border p-3">
                <button 
                  onClick={walletConnected ? onDisconnect : onConnect}
                  className="w-full text-left text-xs text-accent-gold hover:text-accent-bronze transition-colors py-2 px-3 rounded hover:bg-dark-hover"
                >
                  {walletConnected ? 'Disconnect Wallet' : 'Connect Wallet'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
