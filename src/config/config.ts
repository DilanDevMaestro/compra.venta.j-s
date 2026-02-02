export const config = {
  API_URL:
    import.meta.env.API_URL || import.meta.env.NEXT_PUBLIC_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000',
  // Prefer an explicit FRONTEND_URL env var when provided (supports deployments that set FRONTEND_URL)
  FRONTEND_URL:
    import.meta.env.FRONTEND_URL || import.meta.env.NEXT_PUBLIC_FRONTEND_URL || import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173',
  GOOGLE_CLIENT_ID:
    import.meta.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
}
