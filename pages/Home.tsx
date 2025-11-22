import React from 'react';
import PageSection from '../components/PageSection';
import DomainCard from '../components/DomainCard';

const Home: React.FC = () => {
  const features = [
    {
      title: 'On-Device AI',
      description: 'Powerful intelligence that runs locally on your hardware',
      icon: '🤖',
    },
    {
      title: 'Privacy First',
      description: 'Your data stays with you, never sent to external servers',
      icon: '🔒',
    },
    {
      title: 'Advanced Robotics',
      description: 'Next-generation robots for industry and research',
      icon: '🦾',
    },
    {
      title: 'Enterprise Solutions',
      description: 'Scalable AI solutions for businesses of all sizes',
      icon: '🏢',
    },
  ];

  const domains = [
    { name: 'Healthcare', image: 'https://source.unsplash.com/800x600/?medical,ai,healthcare' },
    { name: 'Education', image: 'https://source.unsplash.com/800x600/?education,learning,technology' },
    { name: 'Manufacturing', image: 'https://source.unsplash.com/800x600/?factory,robots,automation' },
    { name: 'Space Tech', image: 'https://source.unsplash.com/800x600/?satellite,space,technology' },
  ];

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="pt-20 pb-16 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 text-gray-900">
          Advanced AI & Robotics for the
          <span className="block text-red-600">Future of Work</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8">
          Optimus AI brings intelligent solutions powered by on-device artificial intelligence and cutting-edge robotics technology.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-lg">
            Get Started
          </button>
          <button className="px-8 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-lg">
            Learn More
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">
          Why Choose <span className="text-red-600">Optimus AI</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Domains Section */}
      <PageSection title="Applications">
        <p className="mb-12 max-w-3xl mx-auto text-gray-700">
          Our AI and robotics solutions are transforming multiple industries. Explore how Optimus AI is making an impact:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {domains.map((domain) => (
            <DomainCard key={domain.name} imageUrl={domain.image} title={domain.name} />
          ))}
        </div>
      </PageSection>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-700 text-white py-16 rounded-lg">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Business?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of companies using Optimus AI to innovate and scale their operations.
          </p>
          <button className="px-8 py-3 bg-white text-red-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg">
            Start Your Free Trial
          </button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="text-5xl font-bold text-red-600 mb-2">500+</div>
          <p className="text-lg text-gray-700">Companies Using Optimus AI</p>
        </div>
        <div className="text-center">
          <div className="text-5xl font-bold text-red-600 mb-2">99.9%</div>
          <p className="text-lg text-gray-700">System Uptime</p>
        </div>
        <div className="text-center">
          <div className="text-5xl font-bold text-red-600 mb-2">24/7</div>
          <p className="text-lg text-gray-700">Expert Support Available</p>
        </div>
      </section>
    </div>
  );
};

export default Home;
