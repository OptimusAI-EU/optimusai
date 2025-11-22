import React from 'react';
import PageSection from '../components/PageSection';

const OdinFreelancer: React.FC = () => {
  return (
    <div className="space-y-16">
      <section className="text-center pt-10">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 text-gray-900">
          ODIN <span className="text-red-600">Freelancer</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Empower your freelance work with intelligent on-device AI tools.
        </p>
      </section>

      <PageSection title="About ODIN Freelancer">
        <p className="max-w-3xl mx-auto text-gray-700 mb-8 text-justify">
          ODIN Freelancer brings the power of on-device AI directly to independent professionals. Work smarter with AI-powered tools that run locally, keeping your work private and secure.
        </p>
      </PageSection>

      <PageSection title="Features">
        <div className="max-w-3xl mx-auto text-gray-700">
          <ul className="list-disc list-inside space-y-3">
            <li>Privacy-first AI tools for content creation</li>
            <li>Real-time collaboration features</li>
            <li>Multi-language support</li>
            <li>Offline-capable AI assistance</li>
            <li>Portfolio management tools</li>
          </ul>
        </div>
      </PageSection>
    </div>
  );
};

export default OdinFreelancer;
