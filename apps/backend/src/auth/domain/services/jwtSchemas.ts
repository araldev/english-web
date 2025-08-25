import {z} from 'zod'
import { emailSchema, idSchema, usernameSchema } from '@/src/user/domain/services/userSchema'

export const jwtPayloadSchema = z.object({
  id: idSchema,
  username: usernameSchema,
  email: emailSchema
})
export const jwtIdSchema = z.string().uuid().default( () => crypto.randomUUID())
export const jwtSchema = z.string().jwt()
export const jwtIatSchema = z.number()
export const jwtExpSchema = z.number()

export const jwtModelSchema = z.object({
  id: jwtIdSchema,
  token: jwtSchema,
  iat: jwtIatSchema,
  exp: jwtExpSchema
})