import React from 'react';
import Timeline from '../components/Timeline';

const timelineEntries = [
  {
    id: 't1',
    year: '2022',
    event: 'Diabetes Diagnosis',
    doctor: 'Dr. Jessica Moon',
    hash: 'c39f52d4a4af4b54662e63a4f3be93e7f21a22364b4ea39f7f430e3b1d2a4f5d2',
    status: 'verified',
  },
  {
    id: 't2',
    year: '2023',
    event: 'MRI Scan Review',
    doctor: 'Dr. Elena Reyes',
    hash: '5a7f8e8d2f89a0719e31f92a34b80dfe1f7a327be9c5e7a1d44b62f3d2879e01',
    status: 'verified',
  },
  {
    id: 't3',
    year: '2024',
    event: 'Follow-up Blood Work',
    doctor: 'Dr. Samuel Kline',
    hash: 'a91b2f3594d6167c7c8f55453c984fe0dc7eabc29df314f9f0faa3ae5f9e2c11',
    status: 'pending',
  },
];

const PatientTimeline = () => {
  return (
    <section className="space-y-6">
      <header>
        <h2 className="section-title">Patient Medical Timeline</h2>
        <p className="text-text-secondary text-sm font-inter">Chronological record of clinical events and validation status.</p>
      </header>

      <Timeline entries={timelineEntries} />
    </section>
  );
};

export default PatientTimeline;
