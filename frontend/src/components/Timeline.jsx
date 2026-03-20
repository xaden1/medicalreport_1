import React from 'react';

const Timeline = ({ entries = [] }) => {
  return (
    <div className="bg-dark-panel border border-dark-border rounded-lg p-6 shadow-soft">
      <h3 className="font-playfair text-lg text-text-primary mb-4">Patient Medical Timeline</h3>
      <div className="space-y-4">
        {entries.length === 0 ? (
          <p className="text-text-secondary text-sm font-inter">No timeline entries available.</p>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="flex gap-4 p-4 border border-dark-border rounded-lg hover:border-accent-gold transition-colors duration-200">
              <div className="flex-shrink-0 w-14 text-xs text-text-secondary font-jetbrains">{entry.year}</div>
              <div className="flex-grow">
                <h4 className="font-inter text-text-primary text-base mb-1">{entry.event}</h4>
                <p className="text-text-secondary text-xs font-jetbrains mb-1">Doctor: {entry.doctor}</p>
                <p className="text-text-secondary text-xs font-inter">Hash: <code className="font-jetbrains text-xs text-text-primary break-all">{entry.hash}</code></p>
              </div>
              <div>
                <span className={`px-3 py-1 rounded-full text-xs font-jetbrains ${entry.status === 'verified' ? 'bg-accent-gold/20 text-accent-gold border border-accent-gold' : 'bg-accent-bronze/20 text-accent-bronze border border-accent-bronze'}`}>
                  {entry.status === 'verified' ? 'Verified' : 'Pending'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Timeline;
