import cors from 'cors'

export type IAccepted_origins = typeof ACCEPTED_ORIGINS

const ACCEPTED_ORIGINS = [
  'http://localhost:8080',
  'http://localhost:5500'
]

export const corsMiddleware = ({ acceptedOrigins = ACCEPTED_ORIGINS } = {}) => cors ({
  origin(requestOrigin, callback) {
    if (!requestOrigin) return callback(null, true)
    if (acceptedOrigins.includes(requestOrigin)) return callback(null, true)
      
    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true 
})