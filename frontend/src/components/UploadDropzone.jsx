import React, { useCallback, useState } from 'react';

const UploadDropzone = ({ onFileSelect }) => {
  const [highlighted, setHighlighted] = useState(false);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setHighlighted(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length) {
      onFileSelect(files[0]);
    }
  }, [onFileSelect]);

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div
      className={`border border-dark-border rounded-lg p-8 bg-dark-panel text-center transition-all duration-200 ${highlighted ? 'border-accent-gold bg-dark-hover' : 'bg-dark-bg'}`}
      onDragOver={(e) => { e.preventDefault(); setHighlighted(true); }}
      onDragLeave={() => setHighlighted(false)}
      onDrop={handleDrop}
    >
      <div className="text-text-primary font-playfair text-xl mb-2">Drag and Drop Your Medical Report</div>
      <p className="text-text-secondary text-sm mb-4 font-inter">Or click to browse and upload a scanned report file</p>
      <input
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        onChange={handleFileInput}
        className="hidden"
        id="uploadInput"
      />
      <label
        htmlFor="uploadInput"
        className="inline-flex items-center justify-center px-5 py-2 border border-dark-border rounded-md text-xs font-inter text-text-primary hover:text-accent-gold cursor-pointer"
      >
        Select File
      </label>
    </div>
  );
};

export default UploadDropzone;
