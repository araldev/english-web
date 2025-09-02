import {z} from 'zod'
import { emailSchema, userIdSchema, usernameSchema } from '@src/user/domain/services/userSchema.js'

export const jwtPayloadSchema = z.object({
  id: userIdSchema,
  username: usernameSchema,
  email: emailSchema
})
export const jwtIdSchema = z.string().uuid().default( () => crypto.randomUUID())
export const jwtRevokeSchema = z.boolean().optional()
export const jwtSchema = z.string().jwt()
export const JwtCacheRepoSchema = z.object({jwtId: jwtIdSchema, userId: userIdSchema, refreshToken: jwtSchema})
export const jwtIatSchema = z.number()
export const jwtExpSchema = z.number()

export const jwtModelSchema = z.object({
  jwtId: jwtIdSchema,
  revoke: jwtRevokeSchema,
  id: userIdSchema,
  username: usernameSchema,
  email: emailSchema,
  iat: jwtIatSchema,
  exp: jwtExpSchema
})

/* -------------- Enums -------------- */

export enum Token {
  access_token = "accessToken",
  refresh_token = "refreshToken"
}