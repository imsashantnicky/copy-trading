import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, XCircle, Loader, AlertTriangle } from 'lucide-react';

const AuthCallback: React.FC = () => {
  const { handleAuthCallback } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [status, setStatus]   = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication…');
  const [errorDetails, setErrorDetails] = useState<any>(null);

  /** prevents double‑dispatch if the component hot‑reloads */
  const alreadyRunning = useRef(false);

  /** helper – true if this `code` was dealt with earlier in the tab */
  const hasCodeBeenHandled = (code: string) =>
    sessionStorage.getItem('lastAuthCode') === code;

  useEffect(() => {
    if (alreadyRunning.current) return;
    alreadyRunning.current = true;

    const processCallback = async () => {
      try {
        const urlParams = new URLSearchParams(location.search);
        const code  = urlParams.get('code');
        const state = urlParams.get('state');
        const oAuthError = urlParams.get('error');
        const oAuthDesc  = urlParams.get('error_description');

        /* ---------- guard rails ---------- */
        if (oAuthError) {
          throw new Error(`OAuth Error: ${oAuthError} – ${oAuthDesc ?? 'Unknown'}`);
        }
        if (!code || !state) {
          throw new Error('Missing authorization code or state parameter');
        }
        if (hasCodeBeenHandled(code)) {
          console.info('🔁 Auth code already processed – skipping duplicate call.');
          navigate('/dashboard');                 // already logged‑in: bounce to home
          return;
        }
        sessionStorage.setItem('lastAuthCode', code);

        /* ---------- optional state format check ---------- */
        const [roleCandidate] = state.split('_');
        if (!['parent', 'child'].includes(roleCandidate)) {
          throw new Error('Invalid state parameter format');
        }

        setMessage('Validating with Upstox …');
        const userData = await handleAuthCallback(code, state);

        /* ---------- success ---------- */
        setStatus('success');
        setMessage('Authentication successful! Redirecting …');

        // clean up transient values so next login starts fresh
        ['auth_state', 'auth_role', 'lastAuthCode'].forEach(k =>
          sessionStorage.removeItem(k)
        );
        localStorage.removeItem('auth_state');
        localStorage.removeItem('auth_role');

        setTimeout(() => navigate('/dashboard'), 1500);
      } catch (err: any) {
        /* ---------- failure ---------- */
        console.error('❌ Auth callback failed:', err);
        setStatus('error');
        setErrorDetails(err.response?.data ?? err);
        setMessage(
          err.response?.status === 400
            ? 'Authorization code expired or already used – please log in again.'
            : err.response?.status === 401
            ? 'Authentication failed – check your credentials.'
            : 'Server error during authentication – please try again.'
        );
        setTimeout(() => navigate('/login'), 4500);
      }
    };

    processCallback();
  }, [location, navigate, handleAuthCallback]);

  /* ---------- UI helpers ---------- */
  const getStatusIcon = () =>
    status === 'loading' ? (
      <Loader className="h-12 w-12 animate-spin text-blue-400" />
    ) : status === 'success' ? (
      <CheckCircle className="h-12 w-12 text-green-400" />
    ) : (
      <XCircle className="h-12 w-12 text-red-400" />
    );

  const color =
    status === 'loading' ? 'text-blue-400'
    : status === 'success' ? 'text-green-400'
    : 'text-red-400';

  /* ---------- render ---------- */
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700 text-center">
          <div className="flex justify-center mb-6">{getStatusIcon()}</div>

          <h2 className={`text-2xl font-bold mb-4 ${color}`}>
            {status === 'loading' && 'Authenticating…'}
            {status === 'success' && 'Success!'}
            {status === 'error' && 'Authentication Failed'}
          </h2>

          <p className="text-gray-300 mb-6">{message}</p>

          {status === 'loading' && (
            <div className="animate-pulse text-sm text-gray-400">
              This may take a few moments…
            </div>
          )}

          {status === 'error' && errorDetails && (
            <div className="mt-4 p-4 bg-red-900/30 rounded-lg border border-red-700">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <span className="text-sm font-medium text-red-300">
                  Error Details
                </span>
              </div>
              <pre className="text-xs text-red-200 text-left max-h-32 overflow-auto">
                {JSON.stringify(errorDetails, null, 2)}
              </pre>
            </div>
          )}

          {status === 'error' && (
            <button
              onClick={() => navigate('/login')}
              className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
