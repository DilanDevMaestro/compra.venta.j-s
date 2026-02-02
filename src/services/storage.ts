// Utility wrapper around localStorage to centralize token/user handling
type SafeUser = {
  _id?: string
  name?: string
  email?: string
  picture?: string
  locationProfile?: {
    country?: string
    countryCode?: string
    province?: string
    city?: string
    postalCode?: string
    areaCode?: string
  }
  locationComplete?: boolean
  businessProfile?: {
    name?: string
    location?: string
    profilePicture?: string
    banner?: string
  }
}

const TOKEN_KEY = 'token'
const USER_KEY = 'user'

export const storage = {
  setToken: (token: string | null) => {
    try {
      if (token === null) {
        localStorage.removeItem(TOKEN_KEY)
      } else {
        localStorage.setItem(TOKEN_KEY, token)
      }
    } catch (e) {
      console.error('storage.setToken error', e)
    }
  },

  getToken: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch (e) {
      console.error('storage.getToken error', e)
      return null
    }
  },

  removeToken: () => {
    try {
      localStorage.removeItem(TOKEN_KEY)
    } catch (e) {
      console.error('storage.removeToken error', e)
    }
  },

  setUser: (user: Partial<SafeUser> | null) => {
    try {
      if (!user) {
        localStorage.removeItem(USER_KEY)
        return
      }
      // Sanitize user object: only allow a small whitelist
      const safe: SafeUser = {
        _id: user?._id,
        name: user?.name,
        email: user?.email,
        picture: user?.picture,
        locationProfile: user?.locationProfile
          ? {
              country: user.locationProfile.country,
              countryCode: user.locationProfile.countryCode,
              province: user.locationProfile.province,
              city: user.locationProfile.city,
              postalCode: user.locationProfile.postalCode,
              areaCode: user.locationProfile.areaCode
            }
          : undefined,
        locationComplete: user?.locationComplete,
        businessProfile: user?.businessProfile
          ? {
              name: user.businessProfile.name,
              location: user.businessProfile.location,
              profilePicture: user.businessProfile.profilePicture,
              banner: user.businessProfile.banner
            }
          : undefined
      }
      localStorage.setItem(USER_KEY, JSON.stringify(safe))
    } catch (e) {
      console.error('storage.setUser error', e)
    }
  },

  getUser: (): SafeUser | null => {
    try {
      const raw = localStorage.getItem(USER_KEY)
      if (!raw) return null
      return JSON.parse(raw) as SafeUser
    } catch (e) {
      console.error('storage.getUser error', e)
      return null
    }
  },

  removeUser: () => {
    try {
      localStorage.removeItem(USER_KEY)
    } catch (e) {
      console.error('storage.removeUser error', e)
    }
  }
}

export default storage
