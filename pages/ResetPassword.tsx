import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [successfulReset, setSuccessfulReset] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset.');
    }
  }, [token]);

  // Check password strength
  useEffect(() => {
    if (!newPassword) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    if (newPassword.length >= 8) strength += 1;
    if (/[a-z]/.test(newPassword)) strength += 1;
    if (/[A-Z]/.test(newPassword)) strength += 1;
    if (/\d/.test(newPassword)) strength += 1;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) strength += 1;

    setPasswordStrength(strength);
  }, [newPassword]);

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-gray-600';
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Fair';
    return 'Strong';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/reset-password',
        {
          token,
          newPassword,
          confirmPassword,
        }
      );

      if (response.data.success) {
        setMessage(response.data.message);
        setSuccessfulReset(true);
        setNewPassword('');
        setConfirmPassword('');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-xl p-8">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-red-400">{error}</p>
          </div>
          <Link
            to="/forgot-password"
            className="mt-4 w-full inline-block text-center bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-xl p-8">
        <h2 className="text-3xl font-bold text-white mb-2 text-center">Create New Password</h2>
        <p className="text-gray-400 text-center mb-6">Enter your new password below.</p>

        {successfulReset ? (
          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <p className="text-green-400 text-sm">{message}</p>
            </div>
            <p className="text-gray-400 text-center text-sm">
              Redirecting to login page in a few seconds...
            </p>
            <Link
              to="/login"
              className="w-full inline-block text-center bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Go to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                required
              />
              {newPassword && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">Password strength:</span>
                    <span className={`text-xs font-semibold ${getPasswordStrengthText() === 'Weak' ? 'text-red-400' : getPasswordStrengthText() === 'Fair' ? 'text-yellow-400' : 'text-green-400'}`}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${getPasswordStrengthColor()}`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Password must contain at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                required
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
              )}
              {confirmPassword && newPassword === confirmPassword && (
                <p className="text-xs text-green-400 mt-1">Passwords match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || passwordStrength < 5 || newPassword !== confirmPassword}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-700/50 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>

            <div className="text-center pt-4">
              <p className="text-gray-400 text-sm">
                <Link to="/login" className="text-red-500 hover:text-red-400 underline">
                  Back to Login
                </Link>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
