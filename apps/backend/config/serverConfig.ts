/* ---------------  REDIS SETUP --------------- */

export const {
  PORT = 1234,
  NODE_ENV = 'development',
  REDIS_USERNAME = 'default',
  REDIS_PASSWORD = '',
  REDIS_HOST = 'localhost',
} = process.env

export const REDIS_PORT = Number(process.env.REDIS_PORT ) ?? 3306

export const REDIS_CONFIG = {
  username: REDIS_USERNAME,
  password: REDIS_PASSWORD,
  socket: {
    host: REDIS_HOST,
    port: REDIS_PORT
  }
}