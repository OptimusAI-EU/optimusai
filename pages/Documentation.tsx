import React, { useState } from 'react';
import PageSection from '../components/PageSection';

interface DocSection {
  id: string;
  title: string;
  content: string;
  subsections?: {
    title: string;
    content: string;
  }[];
}

const Documentation: React.FC = () => {
  const [expandedSection, setExpandedSection] = useState<string>('getting-started');

  const docSections: DocSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      content: 'Welcome to the Optimus AI and Robotics platform. Here\'s how to get started with our services.',
      subsections: [
        {
          title: 'Creating an Account',
          content:
            'Sign up for a free account on our platform. No credit card required for the trial period.',
        },
        {
          title: 'First Steps',
          content:
            'After creating your account, complete your profile and choose your initial plan.',
        },
        {
          title: 'API Key Generation',
          content:
            'Generate your API key from the dashboard settings to start integrating with our services.',
        },
      ],
    },
    {
      id: 'raas-api',
      title: 'RAAS (Robots as a Service) API',
      content:
        'Comprehensive documentation for integrating with the RAAS platform to control and manage robots remotely.',
      subsections: [
        {
          title: 'Authentication',
          content:
            'Use your API key in the Authorization header: Authorization: Bearer YOUR_API_KEY',
        },
        {
          title: 'List Available Robots',
          content:
            'GET /api/v1/robots - Returns a list of available robots in your fleet',
        },
        {
          title: 'Send Commands',
          content:
            'POST /api/v1/robots/{robotId}/commands - Send commands to a specific robot',
        },
        {
          title: 'Get Robot Status',
          content:
            'GET /api/v1/robots/{robotId}/status - Monitor real-time status of a robot',
        },
      ],
    },
    {
      id: 'saas-api',
      title: 'SAAS (Simulation as a Service) API',
      content:
        'Documentation for running simulations and training models in our cloud environment.',
      subsections: [
        {
          title: 'Create Simulation',
          content:
            'POST /api/v1/simulations - Create a new simulation environment',
        },
        {
          title: 'Run Simulation',
          content:
            'POST /api/v1/simulations/{simId}/run - Start a simulation with your parameters',
        },
        {
          title: 'Get Results',
          content:
            'GET /api/v1/simulations/{simId}/results - Download simulation results and data',
        },
        {
          title: 'Model Training',
          content:
            'POST /api/v1/simulations/{simId}/train - Train ML models within the simulation',
        },
      ],
    },
    {
      id: 'billing-docs',
      title: 'Billing & Subscriptions',
      content: 'Learn how to manage your subscriptions and billing information.',
      subsections: [
        {
          title: 'Subscription Plans',
          content:
            'We offer flexible monthly and annual billing options for both RAAS and SAAS services.',
        },
        {
          title: 'Upgrading Your Plan',
          content:
            'Upgrade to a higher tier anytime. Changes take effect at the next billing cycle.',
        },
        {
          title: 'Invoicing',
          content:
            'All invoices are available in your billing dashboard. We support PDF downloads and email delivery.',
        },
        {
          title: 'Payment Methods',
          content:
            'We accept credit cards, bank transfers, and PayPal for maximum flexibility.',
        },
      ],
    },
    {
      id: 'best-practices',
      title: 'Best Practices',
      content: 'Follow these best practices to get the most out of the Optimus platform.',
      subsections: [
        {
          title: 'Security',
          content:
            'Never expose your API keys. Rotate them regularly and use environment variables.',
        },
        {
          title: 'Rate Limiting',
          content:
            'Respect rate limits: 1000 requests/minute for standard plans, unlimited for enterprise.',
        },
        {
          title: 'Error Handling',
          content:
            'Implement proper error handling and retry logic with exponential backoff.',
        },
        {
          title: 'Monitoring',
          content:
            'Use webhooks to monitor robot and simulation status in real-time.',
        },
      ],
    },
    {
      id: 'faq',
      title: 'FAQ',
      content: 'Frequently asked questions about our platform and services.',
      subsections: [
        {
          title: 'What are the system requirements?',
          content:
            'Our cloud-based platform works with any modern browser and supports REST API integration with Python, Node.js, and Java.',
        },
        {
          title: 'How long does a simulation take?',
          content:
            'Simulation time depends on complexity. Simple simulations run in seconds, complex ones may take hours.',
        },
        {
          title: 'Can I export my data?',
          content:
            'Yes, all your data can be exported in JSON or CSV format through the dashboard or API.',
        },
        {
          title: 'Is there a free trial?',
          content:
            'Yes! New users get a 14-day free trial with full access to the platform.',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <section className="text-center pt-10 pb-8">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 text-gray-900">
          <span className="text-red-600">Documentation</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Complete guides and API documentation for integrating with Optimus AI and Robotics
        </p>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4">Topics</h3>
              <nav className="space-y-2">
                {docSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setExpandedSection(section.id)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                      expandedSection === section.id
                        ? 'bg-red-600 text-white'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {docSections.map((section) => (
              expandedSection === section.id && (
                <div key={section.id} className="bg-white border border-gray-200 rounded-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">{section.title}</h2>
                  <p className="text-gray-700 text-lg mb-8">{section.content}</p>

                  {section.subsections && (
                    <div className="space-y-6">
                      {section.subsections.map((sub, index) => (
                        <div key={index} className="border-l-4 border-red-600 pl-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {sub.title}
                          </h3>
                          <p className="text-gray-700">{sub.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Code Example */}
                  {section.id === 'raas-api' && (
                    <div className="mt-8 bg-gray-900 text-green-400 p-6 rounded-lg font-mono text-sm overflow-x-auto">
                      <pre>{`# Example: List Available Robots
curl -X GET \\
  https://api.optimus.ai/v1/robots \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -H 'Content-Type: application/json'

# Response:
{
  "robots": [
    {
      "id": "robot_123",
      "name": "Manipulation Bot",
      "status": "available",
      "battery": 95
    }
  ]
}`}</pre>
                    </div>
                  )}

                  {section.id === 'saas-api' && (
                    <div className="mt-8 bg-gray-900 text-green-400 p-6 rounded-lg font-mono text-sm overflow-x-auto">
                      <pre>{`# Example: Create and Run Simulation
curl -X POST \\
  https://api.optimus.ai/v1/simulations \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "name": "Test Simulation",
    "environment": "warehouse",
    "duration": 3600
  }'`}</pre>
                    </div>
                  )}
                </div>
              )
            ))}
          </div>
        </div>
      </div>

      {/* Quick Links Section */}
      <PageSection title="Need More Help?">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-12">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Community Forum</h3>
            <p className="text-gray-700 mb-4 text-justify">
              Connect with other developers and ask questions in our community forum.
            </p>
            <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold">
              Visit Forum
            </button>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Video Tutorials</h3>
            <p className="text-gray-700 mb-4 text-justify">
              Step-by-step video guides to help you get started quickly.
            </p>
            <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold">
              Watch Videos
            </button>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Support Tickets</h3>
            <p className="text-gray-700 mb-4 text-justify">
              Open a support ticket and our team will assist you promptly.
            </p>
            <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold">
              Create Ticket
            </button>
          </div>
        </div>
      </PageSection>
    </div>
  );
};

export default Documentation;
