import React from 'react';
import PageSection from '../components/PageSection';

const OdinEducation: React.FC = () => {
  return (
    <div className="space-y-16">
      <section className="text-center pt-10">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 text-gray-900">
          ODIN <span className="text-red-600">Education</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Intelligent learning systems powered by on-device AI.
        </p>
      </section>

      <PageSection title="About ODIN Education">
        <p className="max-w-3xl mx-auto text-gray-700 mb-8 text-justify">
          ODIN Education brings personalized, privacy-first AI tutoring and learning tools to educational institutions. Our on-device AI ensures student data remains secure while providing adaptive learning experiences.
        </p>
      </PageSection>

      <PageSection title="Features">
        <div className="max-w-3xl mx-auto text-gray-700">
          <ul className="list-disc list-inside space-y-3">
            <li>Personalized learning paths</li>
            <li>AI-powered student assessment</li>
            <li>Interactive tutoring systems</li>
            <li>Real-time feedback and progress tracking</li>
            <li>Multi-language educational content</li>
            <li>Student data privacy and security</li>
          </ul>
        </div>
      </PageSection>
    </div>
  );
};

export default OdinEducation;
