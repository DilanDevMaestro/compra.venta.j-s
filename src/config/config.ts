export const config = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173',
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
}
