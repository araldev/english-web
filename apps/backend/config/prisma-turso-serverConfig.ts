import 'dotenv/config'

export const {
  TURSO_AUTH_TOKEN = '',
  TURSO_DATABASE_URL = '',
  PRISMA_LOCAL_DB_URL = ''
} = process.env