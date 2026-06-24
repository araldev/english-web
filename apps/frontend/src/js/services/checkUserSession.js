import { API_URL } from '../config/globalConfig.js'
import { setUserSession } from '../store/store.js'

export function decodeSessionFromCookie() {
  const match = document.cookie.match(/(?:^|;\s*)accessToken=([^;]*)/)
  if (!match) return null

  try {
    const payload = JSON.parse(atob(match[1].split('.')[1]))
    return {
      id: payload.id,
      username: payload.username,
      email: payload.email,
      picture: payload.picture
    }
  } catch {
    return null
  }
}

const config = {
  method: 'POST',
  credentials: 'include',
}

export async function checkUserSession() {
  console.log('Starting checkUserSession...')
  console.log('API_URL:', API_URL)
  
  try {
    console.log('Making fetch request...')
    const res = await fetch(API_URL + '/auth/me', config)
    
    console.log('Response received:', res.status, res.statusText)
    
    if (!res.ok) return setUserSession(null)

    const userSession = await res.json()

    console.log('check session', userSession)
    return setUserSession(userSession.error ? null : userSession)
  } catch (error) {
    console.error('Error checking session:', error)
    return setUserSession(null)
  }
}