import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';

interface ProtectedPageProps {
  children: React.ReactNode;
  requiredAuth?: boolean;
  requiredAdmin?: boolean;
}

const ProtectedPage: React.FC<ProtectedPageProps> = ({
  children,
  requiredAuth = false,
  requiredAdmin = false,
}) => {
  const { isLoggedIn, isAdmin } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(!isLoggedIn && requiredAuth);

  if (requiredAdmin && !isAdmin) {
    return (
      <div className="text-center py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h2>
        <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
        <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
          Go Back
        </button>
      </div>
    );
  }

  if (requiredAuth && !isLoggedIn) {
    return (
      <>
        <div className="text-center py-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to access this feature.</p>
          <button
            onClick={() => setShowLoginModal(true)}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Sign In
          </button>
        </div>
        <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      </>
    );
  }

  return <>{children}</>;
};

export default ProtectedPage;
