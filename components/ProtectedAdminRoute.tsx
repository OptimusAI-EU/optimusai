import React from 'react';
import { useAuth } from '../context/AuthContext';
import PageSection from './PageSection';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
  const { isLoggedIn, isAdmin } = useAuth();

  if (!isLoggedIn) {
    return (
      <PageSection title="Access Denied" subtitle="Authentication required">
        <div className="text-center py-12">
          <p className="text-gray-600 mb-6">
            You need to sign in to access the admin dashboard.
          </p>
          <a
            href="/"
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-medium transition cursor-pointer inline-block"
          >
            Back to Home
          </a>
        </div>
      </PageSection>
    );
  }

  if (!isAdmin) {
    return (
      <PageSection title="Access Denied" subtitle="Admin privileges required">
        <div className="text-center py-12">
          <p className="text-gray-600 mb-6">
            You do not have admin privileges to access this dashboard.
            Contact support if you believe this is a mistake.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/"
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-medium transition cursor-pointer inline-block"
            >
              Back to Home
            </a>
          </div>
        </div>
      </PageSection>
    );
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute;
