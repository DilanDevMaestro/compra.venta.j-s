export const config = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',
  AUTH_CALLBACK_PATH: '/auth/google/callback',
  GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
};

