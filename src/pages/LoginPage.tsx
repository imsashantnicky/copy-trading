import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { TrendingUp, Users, User, Shield, Copy } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'parent' | 'child' | null>(null);

  const handleLogin = async (role: 'parent' | 'child') => {
    setIsLoading(true);
    setSelectedRole(role);
    try {
      await login(role);
    } catch (error) {
      console.error('Login failed:', error);
      setIsLoading(false);
      setSelectedRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <TrendingUp className="h-12 w-12 text-blue-400 mr-3" />
            <h1 className="text-4xl font-bold text-white">Upstox Copy Trading</h1>
          </div>
          <p className="text-xl text-gray-300 mb-8">
            Professional copy trading platform for Upstox
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Secure Authentication</span>
            </div>
            <div className="flex items-center space-x-2">
              <Copy className="h-5 w-5" />
              <span>Real-time Copy Trading</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Parent Account */}
          <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700 card-hover">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Parent Account</h2>
              <p className="text-gray-300">
                Trade and automatically copy positions to child accounts
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3 text-gray-300">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Execute trades independently</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Copy trades to all child accounts</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Manage multiple portfolios</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Real-time synchronization</span>
              </div>
            </div>

            <button
              onClick={() => handleLogin('parent')}
              disabled={isLoading}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 ${
                isLoading && selectedRole === 'parent'
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 hover:shadow-lg transform hover:scale-105'
              }`}
            >
              {isLoading && selectedRole === 'parent' ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Connecting...
                </div>
              ) : (
                'Login as Parent'
              )}
            </button>
          </div>

          {/* Child Account */}
          <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700 card-hover">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                <User className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Child Account</h2>
              <p className="text-gray-300">
                Automatically receive and execute trades from parent account
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3 text-gray-300">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Receive copied trades automatically</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>View real-time portfolio updates</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Track parent's performance</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Individual risk management</span>
              </div>
            </div>

            <button
              onClick={() => handleLogin('child')}
              disabled={isLoading}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 ${
                isLoading && selectedRole === 'child'
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:scale-105'
              }`}
            >
              {isLoading && selectedRole === 'child' ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Connecting...
                </div>
              ) : (
                'Login as Child'
              )}
            </button>
          </div>
        </div>

        <div className="mt-12 text-center text-gray-400">
          <p className="text-sm">
            Secure authentication powered by Upstox API
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;