import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config(); // Ensure env variables are loaded

const router = express.Router();

// In-memory store
const users = new Map();
const parentChildMappings = new Map();

router.post('/callback', async (req, res) => {
  try {
    const { code, state, role } = req.body;

    console.log('🔄 Auth callback received:', { code, state, role });

    // Check input
    if (!code || !role) {
      return res.status(400).json({ success: false, error: 'Missing code or role' });
    }

    // Load environment variables
    const clientId = process.env.UPSTOX_CLIENT_ID;
    const clientSecret = process.env.UPSTOX_CLIENT_SECRET;
    const redirectUri = process.env.UPSTOX_REDIRECT_URI;

    console.log('🔧 Env check:', {
      clientId: clientId || '❌ MISSING',
      clientSecret: clientSecret ? '✅ SET' : '❌ MISSING',
      redirectUri: redirectUri || '❌ MISSING'
    });

    if (!clientId || !clientSecret || !redirectUri) {
      return res.status(500).json({
        success: false,
        error: 'Server config error. Missing Upstox credentials.'
      });
    }

    // Prepare token request
    const tokenData = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    });

    console.log('🔐 Requesting token with:', tokenData.toString());

    // Request token from Upstox
    const tokenResponse = await axios.post('https://api.upstox.com/v2/login/authorization/token', tokenData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json'
      }
    });

    const token = tokenResponse.data.access_token;

    console.log('✅ Token response received:', {
      status: tokenResponse.status,
      token: token ? '✅ Received' : '❌ Missing'
    });

    // Create mock user
    const user = {
      user_id: tokenResponse.data.user_id || `user_${Date.now()}`,
      user_name: tokenResponse.data.user_name || 'Upstox User',
      email: tokenResponse.data.email || 'no-email@upstox.com',
      access_token: token,
      role
    };

    users.set(user.user_id, user);

    res.json({ success: true, data: user });

  } catch (error) {
    console.error('❌ AUTH CALLBACK ERROR:');

    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const data = error.response?.data;
    
      console.error('🔴 Axios error:', {
        status,
        message: error.message,
        data
      });
    
      // Detect Upstox error messages clearly
      if (status === 400 && data?.error === 'invalid_grant') {
        return res.status(400).json({
          success: false,
          error: 'Authorization code has already been used or expired. Please login again.',
          details: data
        });
      }
    
      return res.status(status).json({
        success: false,
        error: 'Authentication failed. Please try again.',
        details: data
      });
    }
    

    return res.status(500).json({
      success: false,
      error: 'Unexpected server error',
      details: error.message
    });
  }
});


export default router;
