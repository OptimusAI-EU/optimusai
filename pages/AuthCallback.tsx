import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing login...');

  useEffect(() => {
    const processCallback = async () => {
      try {
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');
        const provider = searchParams.get('provider');

        if (!accessToken) {
          setStatus('error');
          setMessage('Authentication failed. No token received.');
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        // Store tokens
        localStorage.setItem('authToken', accessToken);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }

        // Fetch user info from backend
        const backendUrl = typeof (window as any).VITE_API_URL !== 'undefined'
          ? (window as any).VITE_API_URL
          : 'http://localhost:5000';

        const response = await fetch(`${backendUrl}/api/users/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await response.json();
        const user = userData.user || userData;

        // Login user
        login({
          id: String(user.id),
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email.split('@')[0],
          email: user.email,
          provider: provider as 'email' | 'google' | 'github',
          isAdmin: user.role === 'admin' || user.isAdmin,
          createdAt: user.createdAt,
          lastLogin: new Date().toISOString(),
        });

        setStatus('success');
        setMessage('Login successful! Redirecting...');
        setTimeout(() => navigate('/'), 2000);
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage('Authentication failed. Redirecting...');
        setTimeout(() => navigate('/'), 3000);
      }
    };

    processCallback();
  }, [searchParams, navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center py-12">
        {status === 'loading' && (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
              <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-700 font-medium">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-700 font-medium">{message}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
