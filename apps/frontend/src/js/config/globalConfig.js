const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

export const API_URL = isDev
  ? 'http://localhost:1234'
  : '' /* Sin backend en producción por ahora */

export const FRONTEND_URL = isDev
  ? 'http://localhost:5500'
  : window.location.origin