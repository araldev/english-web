import { z } from 'zod'
import { passwordSchema, usernameSchema, userIdSchema, emailSchema } from '@src/user/domain/services/userSchema.js'

export const authUserCredentialRegisterSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
  email: emailSchema
})

export const authUserCredentialSchema = z.object({
  username: usernameSchema,
  password: passwordSchema
})

export const authUserSessionSchema = z.object({
  id: userIdSchema,
  username: usernameSchema,
  email: emailSchema
})