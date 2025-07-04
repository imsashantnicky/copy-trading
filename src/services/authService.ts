import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const authService = {
  getAuthUrl: (role: 'parent' | 'child') => {
    try {
      const clientId = import.meta.env.VITE_UPSTOX_CLIENT_ID;
      const redirectUri = import.meta.env.VITE_UPSTOX_REDIRECT_URI;
      const state = `${role}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('🔐 Generating auth URL:', {
        clientId,
        redirectUri,
        role,
        state
      });
      
      // Store in both localStorage and sessionStorage for reliability
      localStorage.setItem('auth_state', state);
      localStorage.setItem('auth_role', role);
      sessionStorage.setItem('auth_state', state);
      sessionStorage.setItem('auth_role', role);
      
      const authUrl = `https://api.upstox.com/v2/login/authorization/dialog?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}`;
      
      console.log('🔗 Generated auth URL:', authUrl);
      
      return authUrl;
    } catch (error) {
      console.error('❌ Error generating auth URL:', error);
      throw error;
    }
  },

  handleCallback: async (code: string, state: string) => {
    try {
      console.log('🔄 Handling auth callback:', { 
        code: code?.substring(0, 10) + '...', 
        state,
        role: localStorage.getItem('auth_role') || sessionStorage.getItem('auth_role')
      });

      // Extract role from state if not in storage
      let role = localStorage.getItem('auth_role') || sessionStorage.getItem('auth_role');
      if (!role && state) {
        // Extract role from state parameter
        const stateParts = state.split('_');
        if (stateParts.length >= 1 && (stateParts[0] === 'parent' || stateParts[0] === 'child')) {
          role = stateParts[0];
          console.log('🔍 Extracted role from state:', role);
        }
      }

      if (!role) {
        throw new Error('Unable to determine user role');
      }

      const response = await axios.post(`${API_URL}/auth/callback`, {
        code,
        state,
        role
      });
      
      console.log('✅ Auth callback successful:', response.data);
      
      // Clean up stored auth data
      localStorage.removeItem('auth_state');
      localStorage.removeItem('auth_role');
      sessionStorage.removeItem('auth_state');
      sessionStorage.removeItem('auth_role');
      
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        console.error('❌ Auth callback error:', {
          message: error.message,
          response: (error as any).response?.data,
          status: (error as any).response?.status,
          statusText: (error as any).response?.statusText
        });
      } else {
        console.error('❌ Unknown error occurred:', error);
      }
      throw error;
    }    
  },

  refreshToken: async () => {
    try {
      const token = localStorage.getItem('upstox_token');
      console.log('🔄 Refreshing token...');
      
      const response = await axios.post(`${API_URL}/auth/refresh`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Token refresh successful');
      return response.data;
    } catch (error) {
      console.error('❌ Token refresh error:', error);
      throw error;
    }
  },

  getUserProfile: async () => {
    try {
      const token = localStorage.getItem('upstox_token');
      console.log('👤 Fetching user profile...');
      
      const response = await axios.get(`${API_URL}/auth/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ User profile fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ User profile fetch error:', error);
      throw error;
    }
  }
};