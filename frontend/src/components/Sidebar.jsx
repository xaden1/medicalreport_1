import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Medical Archive', path: '/archive', icon: '📚' },
    { name: 'Upload Report', path: '/upload', icon: '⬆️' },
    { name: 'Verify Report', path: '/verify', icon: '✓' },
    { name: 'Patient Timeline', path: '/timeline', icon: '⏳' },
    { name: 'Research Data', path: '/research', icon: '🔬' },
    { name: 'Wallet', path: '/wallet', icon: '💼' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />
      )}
      <aside className={`
        fixed left-0 top-0 z-50 w-64 bg-dark-panel border-r border-dark-border min-h-screen p-6
        transition-transform duration-300 ease-in-out md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
      <div className="mb-12">
        <h1 className="font-playfair text-2xl text-accent-gold mb-2">
          MedProof
        </h1>
        <p className="text-text-secondary text-xs font-jetbrains">
          Verified Medical Archive
        </p>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200
                ${isActive 
                  ? 'bg-dark-hover border-l-2 border-accent-gold text-accent-gold' 
                  : 'text-text-secondary hover:text-text-primary hover:bg-dark-hover'
                }
              `}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm font-inter">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="my-8 border-t border-dark-border"></div>

      {/* Footer Info */}
      <div className="text-xs text-text-muted space-y-4">
        <div>
          <p className="uppercase tracking-wider font-jetbrains text-accent-bronze mb-2">Version</p>
          <p className="font-jetbrains">1.0.0</p>
        </div>
        <div>
          <p className="uppercase tracking-wider font-jetbrains text-accent-bronze mb-2">Status</p>
          <p className="text-accent-gold">● Online</p>
        </div>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
