import React, { useState } from 'react';
import type { Page } from '../types';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';

interface HeaderProps {
  currentPage: Page;
  onNavClick: (page: Page) => void;
}

interface DropdownMenu {
  label: string;
  items: Array<{ label: string; page: Page }>;
}

const Header: React.FC<HeaderProps> = ({ currentPage, onNavClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();

  // Debug logging
  React.useEffect(() => {
    console.log('Header: user:', user, 'isAdmin:', isAdmin);
  }, [user, isAdmin]);

  const aiDropdown: DropdownMenu = {
    label: 'AI',
    items: [
      { label: 'ODIN Core', page: 'OdinCore' },
      { label: 'ODIN Freelancer', page: 'OdinFreelancer' },
      { label: 'ODIN Space', page: 'OdinSpace' },
      { label: 'ODIN Education', page: 'OdinEducation' },
      { label: 'ODIN Health', page: 'OdinHealth' },
    ],
  };

  const robotsDropdown: DropdownMenu = {
    label: 'Robots',
    items: [
      { label: 'Open Source Robotics', page: 'OpenSourceRobotics' },
      { label: 'RAAS', page: 'RAAS' },
      { label: 'Humanoid', page: 'Humanoid' },
    ],
  };

  const mainNavItems = ['Products', 'Documentation', 'Billing', 'About', 'Contact'] as const;

  const handleDropdownItemClick = (page: Page) => {
    onNavClick(page);
    setIsOpen(false);
    setOpenDropdown(null);
  };

  return (
    <header className="bg-gray-50/95 backdrop-blur-sm sticky top-0 z-50 shadow-lg shadow-gray-300/20 border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1
              className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-red-600 transition-colors"
              onClick={() => onNavClick('Home')}
            >
              Optimus <span className="text-red-600">AI</span>
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-2">
              {/* Home Link */}
              <button
                onClick={() => handleDropdownItemClick('Home')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300 cursor-pointer ${
                  currentPage === 'Home'
                    ? 'bg-red-600 text-white'
                    : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                }`}
              >
                Home
              </button>

              {/* AI Dropdown */}
              <div className="relative group">
                <button className="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300 cursor-pointer text-gray-600 hover:bg-gray-200 hover:text-gray-900 group-hover:bg-red-600 group-hover:text-white flex items-center gap-2">
                  {aiDropdown.label}
                  <svg className="w-4 h-4 transform group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>
                <div className="absolute left-0 mt-0 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                  {aiDropdown.items.map((item) => (
                    <button
                      key={item.page}
                      onClick={() => handleDropdownItemClick(item.page)}
                      className={`w-full text-left px-4 py-2 text-sm cursor-pointer ${
                        currentPage === item.page
                          ? 'bg-red-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      } first:rounded-t-md last:rounded-b-md`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Robots Dropdown */}
              <div className="relative group">
                <button className="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300 cursor-pointer text-gray-600 hover:bg-gray-200 hover:text-gray-900 group-hover:bg-red-600 group-hover:text-white flex items-center gap-2">
                  {robotsDropdown.label}
                  <svg className="w-4 h-4 transform group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>
                <div className="absolute left-0 mt-0 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                  {robotsDropdown.items.map((item) => (
                    <button
                      key={item.page}
                      onClick={() => handleDropdownItemClick(item.page)}
                      className={`w-full text-left px-4 py-2 text-sm cursor-pointer ${
                        currentPage === item.page
                          ? 'bg-red-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      } first:rounded-t-md last:rounded-b-md`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Navigation Items */}
              {mainNavItems.map((page) => (
                <button
                  key={page}
                  onClick={() => handleDropdownItemClick(page as Page)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300 cursor-pointer ${
                    currentPage === page
                      ? 'bg-red-600 text-white'
                      : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                  }`}
                >
                  {page === 'About' ? 'About Us' : page === 'Contact' ? 'Contact Us' : page}
                </button>
              ))}
            </div>
          </div>

          {/* Right side: Dashboard (if admin) and User Menu / Sign In */}
          <div className="hidden md:flex items-center gap-4">
            {isAdmin && (
              <button
                onClick={() => handleDropdownItemClick('Dashboard')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300 cursor-pointer ${
                  currentPage === 'Dashboard'
                    ? 'bg-red-600 text-white'
                    : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                }`}
              >
                Dashboard
              </button>
            )}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-200 hover:text-gray-900 cursor-pointer transition-colors"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span>{user.name}</span>
                  <svg className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-600">{user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-6 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors cursor-pointer shadow-md hover:shadow-lg"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-600">{user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-3 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 cursor-pointer transition-colors"
              >
                Sign In
              </button>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-red-600 cursor-pointer transition-colors"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-200" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {/* Home Mobile */}
            <button
              onClick={() => handleDropdownItemClick('Home')}
              className={`w-full text-left block px-3 py-2 rounded-md text-base font-medium cursor-pointer transition-colors ${
                currentPage === 'Home'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
              }`}
            >
              Home
            </button>

            {/* AI Dropdown Mobile */}
            <div>
              <button
                onClick={() => setOpenDropdown(openDropdown === 'ai' ? null : 'ai')}
                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-200 hover:text-gray-900 cursor-pointer transition-colors"
              >
                AI {openDropdown === 'ai' ? '▼' : '▶'}
              </button>
              {openDropdown === 'ai' && (
                <div className="pl-4 space-y-1">
                  {aiDropdown.items.map((item) => (
                    <button
                      key={item.page}
                      onClick={() => handleDropdownItemClick(item.page)}
                      className={`w-full text-left block px-3 py-2 rounded-md text-sm cursor-pointer transition-colors ${
                        currentPage === item.page
                          ? 'bg-red-600 text-white'
                          : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Robots Dropdown Mobile */}
            <div>
              <button
                onClick={() => setOpenDropdown(openDropdown === 'robots' ? null : 'robots')}
                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-200 hover:text-gray-900 cursor-pointer transition-colors"
              >
                Robots {openDropdown === 'robots' ? '▼' : '▶'}
              </button>
              {openDropdown === 'robots' && (
                <div className="pl-4 space-y-1">
                  {robotsDropdown.items.map((item) => (
                    <button
                      key={item.page}
                      onClick={() => handleDropdownItemClick(item.page)}
                      className={`w-full text-left block px-3 py-2 rounded-md text-sm cursor-pointer transition-colors ${
                        currentPage === item.page
                          ? 'bg-red-600 text-white'
                          : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Main Items Mobile */}
            {mainNavItems.map((page) => (
              <button
                key={page}
                onClick={() => handleDropdownItemClick(page as Page)}
                className={`w-full text-left block px-3 py-2 rounded-md text-base font-medium cursor-pointer transition-colors ${
                  currentPage === page
                    ? 'bg-red-600 text-white'
                    : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                }`}
              >
                {page === 'About' ? 'About Us' : page === 'Contact' ? 'Contact Us' : page}
              </button>
            ))}

            {/* Dashboard Mobile (if admin) */}
            {isAdmin && (
              <button
                onClick={() => handleDropdownItemClick('Dashboard')}
                className={`w-full text-left block px-3 py-2 rounded-md text-base font-medium cursor-pointer transition-colors ${
                  currentPage === 'Dashboard'
                    ? 'bg-red-600 text-white'
                    : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                }`}
              >
                Dashboard
              </button>
            )}
          </div>
        </div>
      )}

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </header>
  );
};

export default Header;
