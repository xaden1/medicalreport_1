import React, { useMemo, useState } from 'react';
import ArchiveCard from '../components/ArchiveCard';

const sampleReports = [
  {
    id: '1',
    title: '2024 - MRI Analysis',
    description: 'Head MR scan for anomaly follow-up',
    patientId: 'P-12345',
    type: 'MRI Scan',
    doctor: 'Dr. Elena Reyes',
    date: '2024-02-12',
    hash: '5a7f8e8d2f89a0719e31f92a34b80dfe1f7a327be9c5e7a1d44b62f3d2879e01',
    verified: true,
  },
  {
    id: '2',
    title: '2023 - Blood Work',
    description: 'Routine hematology panel review',
    patientId: 'P-12345',
    type: 'Blood Test',
    doctor: 'Dr. Samuel Kline',
    date: '2023-08-20',
    hash: 'a91b2f3594d6167c7c8f55453c984fe0dc7eabc29df314f9f0faa3ae5f9e2c11',
    verified: true,
  },
  {
    id: '3',
    title: '2022 - Diabetes Screening',
    description: 'Fasting glucose and HbA1c records',
    patientId: 'P-12345',
    type: 'Lab Report',
    doctor: 'Dr. Jessica Moon',
    date: '2022-11-05',
    hash: 'c39f52d4a4af4b54662e63a4f3be93e7f21a22364b4ea39f7f430e3b1d2a4f5d2',
    verified: false,
  },
];

const PatientArchive = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredReports = useMemo(() => {
    if (!searchTerm.trim()) return sampleReports;
    return sampleReports.filter((report) =>
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.doctor.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="section-title">Medical Archive</h2>
          <p className="text-text-secondary text-sm font-inter">Browse archived medical reports and certification status.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search by Patient ID or Doctor"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-dark-bg border border-dark-border text-text-primary placeholder:text-text-secondary rounded-md px-3 py-2 text-sm font-inter"
          />
        </div>
      </header>

      <div className="grid lg:grid-cols-2 gap-4">
        {filteredReports.map((report) => (
          <ArchiveCard key={report.id} report={report} />
        ))}
      </div>

      {filteredReports.length === 0 && (
        <p className="text-text-secondary text-sm">No reports found for the current query.</p>
      )}
    </section>
  );
};

export default PatientArchive;
