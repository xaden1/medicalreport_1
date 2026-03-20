import React from 'react';

const VerificationBadge = ({ status = 'unknown' }) => {
  let statusLabel = 'Unknown';
  let statusColor = 'text-text-secondary bg-dark-hover border-dark-border';

  if (status === 'authentic') {
    statusLabel = 'Authentic';
    statusColor = 'text-accent-gold bg-dark-hover border-accent-gold';
  }
  if (status === 'tampered') {
    statusLabel = 'Tampered';
    statusColor = 'text-accent-bronze bg-dark-hover border-accent-bronze';
  }

  return (
    <span className={`inline-flex items-center rounded-full px-4 py-1 text-xs font-jetbrains font-semibold border ${statusColor}`}>
      <span className="mr-2">{status === 'authentic' ? '🛡️' : status === 'tampered' ? '⚠️' : '❓'}</span>
      {statusLabel}
    </span>
  );
};

export default VerificationBadge;
