import {z} from 'zod'
import { emailSchema, idSchema, usernameSchema } from '@src/user/domain/services/userSchema.js'

export const jwtPayloadSchema = z.object({
  id: idSchema,
  username: usernameSchema,
  email: emailSchema
})
export const jwtIdSchema = z.string().uuid().default( () => crypto.randomUUID())
export const jwtRevokeSchema = z.boolean()
export const jwtSchema = z.string().jwt()
export const JwtCacheRepoSchema = z.object({jwtId: jwtIdSchema, refreshToken: jwtSchema})
export const jwtIatSchema = z.number()
export const jwtExpSchema = z.number()

export const jwtModelSchema = z.object({
  jwtId: jwtIdSchema,
  revoke: jwtRevokeSchema,
  id: idSchema,
  username: usernameSchema,
  email: emailSchema,
  iat: jwtIatSchema,
  exp: jwtExpSchema
})

/* -------------- Enums -------------- */

export enum Token {
  access_token = "access_token",
  refresh_token = "refresh_token"
}