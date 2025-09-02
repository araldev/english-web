import "dotenv/config"

export const {
  PORT = 1234,
  NODE_ENV = 'development'
} = process.env