import { API_URL } from '../config/globalConfig.js'
import { setUserSession } from '../store/store.js'

const config = {
  method: 'POST',
  credentials: 'include',
}

export async function checkUserSession() {
  try {
    const res = await fetch(API_URL + '/auth/me', config)

    if (!res.ok) return  setUserSession(null)

    const userSession = await res.json()

    console.log('check session', userSession)
    return  setUserSession(userSession.error ? null : userSession)
  } catch (error) {
    console.error(error)
    return setUserSession(null)
  }
}