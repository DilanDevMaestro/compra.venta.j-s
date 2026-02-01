import { config } from '../config/config'

export const loginWithGoogle = () => {
  window.location.href = `${config.API_URL}/auth/google`
}
