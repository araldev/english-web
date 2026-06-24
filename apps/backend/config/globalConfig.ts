import 'dotenv/config'

export const {
  PORT = 1234,
  NODE_ENV = 'development',
  SALTROUND = 10,
  FRONTEND_URL = 'http://localhost:5500'
} = process.env