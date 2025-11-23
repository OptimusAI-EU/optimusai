import React, { useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Page } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import OdinCore from './pages/OdinCore';
import OdinFreelancer from './pages/OdinFreelancer';
import OdinSpace from './pages/OdinSpace';
import OdinEducation from './pages/OdinEducation';
import OdinHealth from './pages/OdinHealth';
import OpenSourceRobotics from './pages/OpenSourceRobotics';
import RAAS from './pages/RAAS';
import Humanoid from './pages/Humanoid';
import Dashboard from './pages/Dashboard';
import Documentation from './pages/Documentation';
import Billing from './pages/Billing';
import Checkout from './pages/Checkout';
import Products from './pages/Products';
import Contact from './pages/Contact';
import VerifyEmail from './pages/VerifyEmail';
import AuthCallback from './pages/AuthCallback';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    // Restore the last visited page from localStorage
    try {
      const savedPage = localStorage.getItem('lastVisitedPage');
      return (savedPage as Page) || 'Home';
    } catch {
      return 'Home';
    }
  });
  const location = useLocation();

  const handleNavClick = useCallback((page: Page) => {
    setCurrentPage(page);
    // Save the current page to localStorage
    localStorage.setItem('lastVisitedPage', page);
  }, []);

  // Check if we're on special routes
  const isVerifyEmailPage = location.pathname === '/verify-email';
  const isAuthCallbackPage = location.pathname === '/auth/callback';
  const isForgotPasswordPage = location.pathname === '/forgot-password';
  const isResetPasswordPage = location.pathname === '/reset-password';

  const renderPage = () => {
    // Handle auth callback route
    if (isAuthCallbackPage) {
      return <AuthCallback />;
    }

    // Handle verify-email route
    if (isVerifyEmailPage) {
      return <VerifyEmail />;
    }

    // Handle forgot-password route
    if (isForgotPasswordPage) {
      return <ForgotPassword />;
    }

    // Handle reset-password route
    if (isResetPasswordPage) {
      return <ResetPassword />;
    }

    switch (currentPage) {
      case 'Home':
        return <Home />;
      case 'About':
        return <About />;
      case 'OdinCore':
        return <OdinCore />;
      case 'OdinFreelancer':
        return <OdinFreelancer />;
      case 'OdinSpace':
        return <OdinSpace />;
      case 'OdinEducation':
        return <OdinEducation />;
      case 'OdinHealth':
        return <OdinHealth />;
      case 'OpenSourceRobotics':
        return <OpenSourceRobotics />;
      case 'RAAS':
        return <RAAS />;
      case 'Humanoid':
        return <Humanoid />;
      case 'Dashboard':
        return <Dashboard />;
      case 'Documentation':
        return <Documentation />;
      case 'Checkout':
        return <Checkout onNavClick={handleNavClick} />;
      case 'Billing':
        return <Billing />;
      case 'Products':
        return <Products onNavClick={handleNavClick} />;
      case 'Contact':
        return <Contact />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans flex flex-col">
      <Header currentPage={currentPage} onNavClick={handleNavClick} />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
};

export default App;
