import React from 'react';

const researchItems = [
  {
    id: 'r1',
    title: 'Longitudinal Patient Outcomes Analysis',
    tags: ['Epidemiology', 'AI Model', 'Secure Data'],
    description: 'An archived dataset documenting patient outcomes over 5 years with cryptographic validations.',
    status: 'Published',
  },
  {
    id: 'r2',
    title: 'Blockchain Consent Audit Trail',
    tags: ['Compliance', 'Consent', 'Data Privacy'],
    description: 'Research on consent tracking over decentralized medical records systems and audit design.',
    status: 'Draft',
  },
  {
    id: 'r3',
    title: 'Interoperable Health Vault Schema',
    tags: ['Standards', 'FHIR', 'Interoperability'],
    description: 'Conceptual schema for a shared medical vault across healthcare institutions.',
    status: 'Review',
  },
];

const ResearchData = () => {
  return (
    <section className="space-y-6">
      <header>
        <h2 className="section-title">Research Data Vault</h2>
        <p className="text-text-secondary text-sm font-inter">Browse encrypted research indices and study metadata curated in the vault.</p>
      </header>

      <div className="grid md:grid-cols-2 gap-4">
        {researchItems.map((item) => (
          <article key={item.id} className="card-soft">
            <h3 className="text-lg font-playfair text-text-primary mb-1">{item.title}</h3>
            <p className="text-text-secondary text-sm mb-3">{item.description}</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {item.tags.map((tag) => (
                <span key={tag} className="text-xs font-jetbrains bg-dark-bg text-text-secondary border border-dark-border px-2 py-1 rounded">
                  #{tag}
                </span>
              ))}
            </div>
            <div className="text-xs font-jetbrains text-text-muted">Status: <span className="text-accent-gold">{item.status}</span></div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default ResearchData;
