import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import VerifyPage from './pages/VerifyPage';
import PatientArchive from './pages/PatientArchive';
import PatientTimeline from './pages/PatientTimeline';
import ResearchData from './pages/ResearchData';
import WalletPage from './pages/WalletPage';

function App() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [network] = useState('Stellar Testnet');
  const [userRole, setUserRole] = useState('Doctor');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleConnectWallet = async () => {
    try {
      const { connectFreighter } = require('./services/sorobanService');
      const publicKey = await connectFreighter();
      setWalletAddress(publicKey);
      setWalletConnected(true);
      setUserRole('Doctor');
    } catch (error) {
      console.error("Connection failed", error);
      alert("Please install Freighter wallet extension!");
    }
  };

  const handleDisconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress('');
    setUserRole('Guest');
  };


  return (
    <Router>
      <div className="min-h-screen bg-dark-bg text-text-primary">
        <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        <div className="md:ml-64 transition-all duration-300">
          <Navbar
            toggleMenu={toggleMobileMenu}
            walletConnected={walletConnected}
            walletAddress={walletAddress}
            network={network}
            userRole={userRole}
            onConnect={handleConnectWallet}
            onDisconnect={handleDisconnectWallet}
          />
          <main className="pt-20 px-8 pb-8">
            <Routes>
              <Route
                path="/"
                element={
                  <LandingPage
                    executeConnect={handleConnectWallet}
                    walletConnected={walletConnected}
                    network={network}
                  />
                }
              />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/archive" element={<PatientArchive />} />
              <Route path="/upload" element={<UploadPage walletConnected={walletConnected} walletAddress={walletAddress} />} />
              <Route path="/verify" element={<VerifyPage />} />
              <Route path="/timeline" element={<PatientTimeline />} />
              <Route path="/research" element={<ResearchData />} />
              <Route path="/wallet" element={<WalletPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
