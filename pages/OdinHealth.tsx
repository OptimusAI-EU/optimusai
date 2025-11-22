import React from 'react';
import PageSection from '../components/PageSection';

const OdinHealth: React.FC = () => {
  return (
    <div className="space-y-16">
      <section className="text-center pt-10">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 text-gray-900">
          ODIN <span className="text-red-600">Health</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Privacy-preserving AI for healthcare and wellness applications.
        </p>
      </section>

      <PageSection title="About ODIN Health">
        <p className="max-w-3xl mx-auto text-gray-700 mb-8 text-justify">
          ODIN Health applies on-device intelligence to medical and wellness applications. By processing sensitive health data locally, we ensure complete privacy compliance while delivering powerful AI-driven insights.
        </p>
      </PageSection>

      <PageSection title="Applications">
        <div className="max-w-3xl mx-auto text-gray-700">
          <ul className="list-disc list-inside space-y-3">
            <li>Medical image analysis</li>
            <li>Patient data management</li>
            <li>Health monitoring and tracking</li>
            <li>Diagnostic assistance</li>
            <li>Wellness recommendations</li>
            <li>HIPAA-compliant data handling</li>
          </ul>
        </div>
      </PageSection>
    </div>
  );
};

export default OdinHealth;
