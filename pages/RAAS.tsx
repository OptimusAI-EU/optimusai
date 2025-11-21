import React from 'react';
import PageSection from '../components/PageSection';

const RAAS: React.FC = () => {
  return (
    <div className="space-y-16">
      <section className="text-center pt-10">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 text-gray-900">
          Robots as a <span className="text-red-600">Service (RAAS)</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Access our advanced robot fleet on-demand without the overhead of ownership.
        </p>
      </section>

      <PageSection title="Why Choose RAAS?">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-12">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-bold text-red-600 mb-3">Cost Effective</h3>
            <p className="text-gray-700 text-justify">
              Pay only for what you use. No capital expenditure, no maintenance costs.
            </p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-bold text-red-600 mb-3">Flexible Scaling</h3>
            <p className="text-gray-700 text-justify">
              Scale your robot fleet up or down based on your changing needs.
            </p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-bold text-red-600 mb-3">Always Updated</h3>
            <p className="text-gray-700 text-justify">
              Access the latest robot models and technologies without replacement costs.
            </p>
          </div>
        </div>
      </PageSection>

      <PageSection title="Available Robots">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-12">
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Manipulation Robots</h3>
            <p className="text-gray-700 mb-4 text-justify">
              Precision-engineered robotic arms for assembly, manufacturing, and delicate tasks.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>✓ 6-DOF robotic arms</li>
              <li>✓ Payload up to 50kg</li>
              <li>✓ Precision ±0.03mm</li>
              <li>✓ Custom end-effectors</li>
            </ul>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Mobile Robots</h3>
            <p className="text-gray-700 mb-4 text-justify">
              Autonomous mobile robots for logistics, inspection, and material handling.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>✓ Autonomous navigation</li>
              <li>✓ Real-time mapping</li>
              <li>✓ 500kg payload capacity</li>
              <li>✓ 24/7 operation</li>
            </ul>
          </div>
        </div>
      </PageSection>

      <section className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to Get Started?</h2>
        <button className="px-8 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">
          View Pricing Plans
        </button>
      </section>
    </div>
  );
};

export default RAAS;
