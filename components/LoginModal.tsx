import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { signInWithEmail, signInWithGoogle, signInWithGithub } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [signUpMessage, setSignUpMessage] = useState('');

  // Password validation regex
  const validatePassword = (pwd: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    if (pwd.length < 8) errors.push('At least 8 characters');
    if (!/[a-z]/.test(pwd)) errors.push('One lowercase letter');
    if (!/[A-Z]/.test(pwd)) errors.push('One uppercase letter');
    if (!/\d/.test(pwd)) errors.push('One number');
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) errors.push('One special character');
    return { valid: errors.length === 0, errors };
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSignUpMessage('');

    // Signup validation
    if (isSignUp) {
      // Check required fields
      if (!firstName.trim() || !lastName.trim()) {
        setError('Please provide first and last name');
        return;
      }

      // Check if passwords match
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      // Validate password strength
      const { valid, errors } = validatePassword(password);
      if (!valid) {
        setError(`Password must have: ${errors.join(', ')}`);
        return;
      }
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        // For signup, we'll register and they'll need to verify email
        await signInWithEmail(email, password, false, true, firstName, lastName);
        setSignUpMessage('Account created! Please check your email to verify your address. Only optimusrobots@proton.me can skip verification.');
        // Clear form after successful signup
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setFirstName('');
        setLastName('');
        setTimeout(() => {
          setIsSignUp(false);
          setSignUpMessage('');
        }, 5000);
      } else {
        if (email === 'admin@optimusai.dev' && password === 'admin123') {
          await signInWithEmail(email, password, true);
        } else {
          await signInWithEmail(email, password);
        }
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : (isSignUp ? 'Failed to create account' : 'Failed to sign in with email'));
    }
    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      onClose();
    } catch (err) {
      setError('Failed to sign in with Google');
    }
    setIsLoading(false);
  };

  const handleGithubSignIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      await signInWithGithub();
      onClose();
    } catch (err) {
      setError('Failed to sign in with GitHub');
    }
    setIsLoading(false);
  };

  if (!isOpen) return null;

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md my-8 z-[10000]">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-8 text-white sticky top-0 z-[10001]">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-3xl font-bold">{isSignUp ? 'Create Account' : 'Sign In'}</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-red-200 text-2xl font-light transition-colors"
            >
              ×
            </button>
          </div>
          <p className="text-red-100 text-sm">
            {isSignUp ? 'Join Optimus AI today' : 'Welcome back to Optimus AI'}
          </p>
        </div>

        {/* Content - Scrollable */}
        <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm border border-red-200">
              {error}
            </div>
          )}

          {signUpMessage && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm border border-green-200">
              {signUpMessage}
            </div>
          )}

          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors font-medium text-gray-700 disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>

            <button
              onClick={handleGithubSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors font-medium text-gray-700 disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.868-.013-1.703-2.782.603-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.544 2.914 1.19.092-.926.35-1.546.636-1.903-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.647 0 0 .84-.27 2.75 1.025A9.578 9.578 0 0110 4.817c.85.004 1.705.114 2.504.336 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.578.688.48C17.137 18.195 20 14.44 20 10.017 20 4.484 15.522 0 10 0z"
                  clipRule="evenodd"
                />
              </svg>
              Continue with GitHub
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500 font-medium">Or use email</span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            {isSignUp && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-colors"
                    required={isSignUp}
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-colors"
                    required={isSignUp}
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-colors"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-colors"
                required
              />
              {isSignUp && (
                <p className="text-xs text-gray-600 mt-2">
                  Must be 8+ characters with uppercase, lowercase, number, and special character
                </p>
              )}
            </div>

            {isSignUp && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-colors"
                  required
                />
                {password && confirmPassword && password === confirmPassword && (
                  <p className="text-xs text-green-600 mt-2">✓ Passwords match</p>
                )}
                {password && confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-600 mt-2">✗ Passwords do not match</p>
                )}
              </div>
            )}

            {!isSignUp && (
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-red-600 shadow-sm cursor-pointer"
                  />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate('/forgot-password');
                  }}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 active:bg-red-800 transition-colors font-semibold disabled:opacity-50 cursor-pointer shadow-md hover:shadow-lg"
            >
              {isLoading ? (isSignUp ? 'Creating account...' : 'Signing in...') : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          {/* Dev Account Info */}
          {!isSignUp && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Demo:</strong> Email: <code className="bg-blue-100 px-1 rounded font-mono">admin@optimusai.dev</code>, Password: <code className="bg-blue-100 px-1 rounded font-mono">admin123</code>
              </p>
            </div>
          )}

          {/* Toggle Sign Up / Sign In */}
          <p className="mt-6 text-center text-sm text-gray-600">
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setFirstName('');
                setLastName('');
                setError('');
                setSignUpMessage('');
              }}
              className="text-red-600 hover:text-red-700 font-semibold cursor-pointer"
            >
              {isSignUp ? 'Sign In' : 'Create Account'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, modalRoot);
};

export default LoginModal;
