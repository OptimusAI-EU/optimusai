import React from 'react';
import PageSection from '../components/PageSection';

const Humanoid: React.FC = () => {
  return (
    <div className="space-y-16">
      <section className="text-center pt-10">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 text-gray-900">
          The <span className="text-red-600">Humanoid</span> Project
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Building the future of robotics with advanced humanoid systems.
        </p>
      </section>

      <PageSection title="Project Overview">
        <p className="max-w-3xl mx-auto text-gray-700 mb-8 text-justify">
          We are actively working with our partners to develop humanoids capable of working in industry and performing real-world work. Humanoids will be trained through reinforcement learning and imitation learning techniques to be autonomous agents for various domains.
        </p>
      </PageSection>

      <div>
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
          Our <span className="text-red-600">Humanoid</span> Lineup
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            <img
              src="https://source.unsplash.com/400x300/?humanoid,robot,future"
              alt="Humanoid Alpha"
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Humanoid Alpha</h3>
              <p className="text-gray-700 mb-4 text-justify">
                Our first-generation humanoid with advanced dexterity and reasoning capabilities.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ 47 degrees of freedom</li>
                <li>✓ AI-powered decision making</li>
                <li>✓ Multi-task learning</li>
              </ul>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            <img
              src="https://source.unsplash.com/400x300/?humanoid,robot,ai"
              alt="Humanoid Beta"
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Humanoid Beta</h3>
              <p className="text-gray-700 mb-4 text-justify">
                Enhanced with collaborative capabilities and human-robot interaction.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Natural language understanding</li>
                <li>✓ Gesture recognition</li>
                <li>✓ Safety protocols</li>
              </ul>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            <img
              src="https://source.unsplash.com/400x300/?humanoid,robot,sleek"
              alt="Humanoid Gamma"
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Humanoid Gamma</h3>
              <p className="text-gray-700 mb-4 text-justify">
                The latest generation with industrial-grade performance and reliability.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Enhanced autonomy</li>
                <li>✓ Industrial applications</li>
                <li>✓ Extended battery life</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <PageSection title="Capabilities">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-12">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-bold text-red-600 mb-3">Advanced Learning</h3>
            <p className="text-gray-700 text-justify">
              Trained using reinforcement learning and imitation learning techniques for task mastery.
            </p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-bold text-red-600 mb-3">Industry Ready</h3>
            <p className="text-gray-700">
              Designed for real-world deployment in manufacturing, service, and research applications.
            </p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-bold text-red-600 mb-3">Autonomous Operation</h3>
            <p className="text-gray-700">
              Capable of operating independently for extended periods with minimal human intervention.
            </p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-bold text-red-600 mb-3">Adaptability</h3>
            <p className="text-gray-700">
              Learns and adapts to new tasks and environments efficiently.
            </p>
          </div>
        </div>
      </PageSection>

      <section className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Join Us in the Humanoid Revolution</h2>
        <button className="px-8 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">
          Contact Us
        </button>
      </section>
    </div>
  );
};

export default Humanoid;
