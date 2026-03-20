import React from 'react';
import VerificationBadge from './VerificationBadge';

const ArchiveCard = ({ report }) => {
  return (
    <article className="bg-dark-panel border border-dark-border rounded-lg shadow-soft p-5 min-w-sm transition-all duration-300 hover:shadow-elevated hover:border-accent-gold">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-playfair text-xl text-text-primary mb-1">{report.title}</h3>
          <p className="text-text-secondary text-sm font-inter">{report.description || 'Archived medical record'}</p>
        </div>
        <div className="text-right">
          <VerificationBadge status={report.verified ? 'authentic' : 'tampered'} />
        </div>
      </div>

      <ul className="space-y-2 text-text-secondary text-sm font-inter">
        <li>
          <span className="text-text-primary font-jetbrains">Patient ID:</span> {report.patientId}
        </li>
        <li>
          <span className="text-text-primary font-jetbrains">Report Type:</span> {report.type}
        </li>
        <li>
          <span className="text-text-primary font-jetbrains">Doctor:</span> {report.doctor}
        </li>
        <li>
          <span className="text-text-primary font-jetbrains">Date:</span> {report.date}
        </li>
        <li>
          <span className="text-text-primary font-jetbrains">Report Hash:</span>
          <code className="font-jetbrains text-xs text-text-primary break-all bg-dark-bg p-2 rounded border border-dark-border block mt-1">
            {report.hash}
          </code>
        </li>
      </ul>
    </article>
  );
};

export default ArchiveCard;
