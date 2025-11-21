import React, { useState } from 'react';
import PageSection from '../components/PageSection';

interface PricingPlan {
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  description: string;
  highlighted?: boolean;
}

const Pricing: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const raasPlans: PricingPlan[] = [
    {
      name: 'Starter',
      monthlyPrice: 299,
      annualPrice: 2990,
      description: 'Perfect for small projects and learning',
      features: [
        'Access to basic robots',
        'Up to 100 hours/month usage',
        'Email support',
        'Basic analytics',
        'Community forum access',
      ],
    },
    {
      name: 'Professional',
      monthlyPrice: 799,
      annualPrice: 7990,
      description: 'For growing businesses',
      features: [
        'Access to all robots',
        'Unlimited hours/month usage',
        'Priority email support',
        'Advanced analytics',
        'API access',
        'Custom configurations',
      ],
      highlighted: true,
    },
    {
      name: 'Enterprise',
      monthlyPrice: 1999,
      annualPrice: 19990,
      description: 'For large-scale operations',
      features: [
        'Dedicated robot fleet',
        'Unlimited usage',
        '24/7 phone support',
        'Real-time analytics',
        'Full API access',
        'Custom integrations',
        'SLA guarantee',
        'Dedicated account manager',
      ],
    },
  ];

  const saasPlans: PricingPlan[] = [
    {
      name: 'Basic',
      monthlyPrice: 199,
      annualPrice: 1990,
      description: 'For simple simulations',
      features: [
        'Access to basic simulation tools',
        'Up to 50 simulation runs/month',
        'Standard environments',
        'Email support',
        'Data export',
      ],
    },
    {
      name: 'Advanced',
      monthlyPrice: 599,
      annualPrice: 5990,
      description: 'For advanced research',
      features: [
        'All Basic features',
        'Unlimited simulation runs',
        'Custom environments',
        'Priority support',
        'Advanced data analytics',
        'Team collaboration tools',
        'Version control',
      ],
      highlighted: true,
    },
    {
      name: 'Research',
      monthlyPrice: 1499,
      annualPrice: 14990,
      description: 'For research institutions',
      features: [
        'All Advanced features',
        'Custom simulation development',
        'GPU acceleration',
        'Dedicated support team',
        'Publication support',
        'Institutional licensing',
        'Custom integrations',
      ],
    },
  ];

  const PricingCard: React.FC<{ plan: PricingPlan; type: string }> = ({ plan, type }) => {
    const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
    const period = billingCycle === 'monthly' ? 'month' : 'year';
    const savings = billingCycle === 'annual' ? Math.round((1 - plan.annualPrice / (plan.monthlyPrice * 12)) * 100) : 0;

    return (
      <div
        className={`rounded-lg p-8 border transition-all ${
          plan.highlighted
            ? 'border-red-600 bg-red-50 shadow-lg shadow-red-600/20 transform scale-105'
            : 'border-gray-200 bg-white hover:shadow-md'
        }`}
      >
        {plan.highlighted && (
          <div className="mb-4">
            <span className="inline-block bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Most Popular
            </span>
          </div>
        )}

        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
        <p className="text-gray-600 text-sm mb-4">{plan.description}</p>

        <div className="mb-6">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-4xl font-bold text-gray-900">${price}</span>
            <span className="text-gray-600">/{period}</span>
          </div>
          {savings > 0 && (
            <p className="text-sm text-green-600 font-semibold">Save {savings}% with annual billing</p>
          )}
        </div>

        <button
          className={`w-full py-3 rounded-lg font-semibold mb-8 transition-colors ${
            plan.highlighted
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
          }`}
        >
          Get Started
        </button>

        <div className="space-y-3">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <span className="text-red-600 font-bold mt-1">✓</span>
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-16">
      <section className="text-center pt-10">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 text-gray-900">
          Simple, Transparent <span className="text-red-600">Pricing</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Choose the perfect plan for your needs. All plans include 14-day free trial.
        </p>
      </section>

      {/* Billing Cycle Toggle */}
      <div className="flex justify-center mb-12">
        <div className="bg-gray-100 rounded-lg p-1 flex gap-2">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-md font-semibold transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-red-600 text-white'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-6 py-2 rounded-md font-semibold transition-colors ${
              billingCycle === 'annual'
                ? 'bg-red-600 text-white'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            Annual (Save up to 17%)
          </button>
        </div>
      </div>

      {/* RAAS Pricing */}
      <div>
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
          Robots as a <span className="text-red-600">Service (RAAS)</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {raasPlans.map((plan, index) => (
            <PricingCard key={index} plan={plan} type="RAAS" />
          ))}
        </div>
      </div>

      {/* SAAS Pricing */}
      <div>
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
          Simulation as a <span className="text-red-600">Service (SAAS)</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {saasPlans.map((plan, index) => (
            <PricingCard key={index} plan={plan} type="SAAS" />
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <PageSection title="Frequently Asked Questions">
        <div className="max-w-3xl mx-auto text-left space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-2">Can I change my plan anytime?</h3>
            <p className="text-gray-700 text-justify">
              Yes! You can upgrade or downgrade your plan at any time. Changes take effect at the next billing cycle.
            </p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-2">What payment methods do you accept?</h3>
            <p className="text-gray-700 text-justify">
              We accept all major credit cards, bank transfers, and PayPal for your convenience.
            </p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-2">Is there a discount for annual billing?</h3>
            <p className="text-gray-700 text-justify">
              Absolutely! Annual plans offer up to 17% savings compared to monthly billing.
            </p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-2">Do you offer custom enterprise plans?</h3>
            <p className="text-gray-700 text-justify">
              Yes! Contact our sales team for custom pricing and enterprise solutions tailored to your needs.
            </p>
          </div>
        </div>
      </PageSection>
    </div>
  );
};

export default Pricing;
