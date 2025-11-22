import React from 'react';
import PageSection from '../components/PageSection';

const OdinSpace: React.FC = () => {
  return (
    <div className="space-y-16">
      <section className="text-center pt-10">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 text-gray-900">
          ODIN <span className="text-red-600">Space</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Advanced AI solutions for space exploration and satellite technology.
        </p>
      </section>

      <PageSection title="About ODIN Space">
        <p className="max-w-3xl mx-auto text-gray-700 mb-8 text-justify">
          ODIN Space applies on-device intelligence to space technology, satellite operations, and earth observation. Our solutions process vast amounts of spatial data efficiently while maintaining data sovereignty.
        </p>
      </PageSection>

      <PageSection title="Applications">
        <div className="max-w-3xl mx-auto text-gray-700">
          <ul className="list-disc list-inside space-y-3">
            <li>Satellite image analysis and processing</li>
            <li>Earth observation automation</li>
            <li>Space mission data management</li>
            <li>Real-time orbital tracking</li>
            <li>Climate and environmental monitoring</li>
          </ul>
        </div>
      </PageSection>
    </div>
  );
};

export default OdinSpace;
