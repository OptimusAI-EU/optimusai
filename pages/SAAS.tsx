import React from 'react';
import PageSection from '../components/PageSection';

const SAAS: React.FC = () => {
  return (
    <div className="space-y-16">
      <section className="text-center pt-10">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 text-gray-900">
          Simulation as a <span className="text-red-600">Service (SAAS)</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Test, train, and validate robots in a virtual environment before deployment.
        </p>
      </section>

      <PageSection title="Advanced Simulation Platform">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-12">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-bold text-red-600 mb-3">Realistic Physics</h3>
            <p className="text-gray-700 text-justify">
              Accurately simulate real-world physics including friction, gravity, and collisions.
            </p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-bold text-red-600 mb-3">Sim2Real Transfer</h3>
            <p className="text-gray-700 text-justify">
              Trained models transfer seamlessly from simulation to real robots.
            </p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-bold text-red-600 mb-3">Scalable Computing</h3>
            <p className="text-gray-700 text-justify">
              GPU-accelerated simulations for running multiple scenarios simultaneously.
            </p>
          </div>
        </div>
      </PageSection>

      <PageSection title="Key Features">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-12">
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Environment Design</h3>
            <p className="text-gray-700 mb-4 text-justify">
              Create and customize complex environments for your simulations.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>✓ Pre-built environments</li>
              <li>✓ Terrain generation</li>
              <li>✓ Custom object models</li>
              <li>✓ Material definitions</li>
            </ul>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Machine Learning</h3>
            <p className="text-gray-700 mb-4 text-justify">
              Train and test ML models with our integrated learning framework.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>✓ Reinforcement learning</li>
              <li>✓ Imitation learning</li>
              <li>✓ Deep learning support</li>
              <li>✓ Model evaluation tools</li>
            </ul>
          </div>
        </div>
      </PageSection>

      <section className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Start Simulating Today</h2>
        <button className="px-8 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">
          View Pricing Plans
        </button>
      </section>
    </div>
  );
};

export default SAAS;
