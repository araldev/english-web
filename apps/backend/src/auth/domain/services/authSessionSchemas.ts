import {z} from 'zod'
import {passwordSchema, usernameSchema, userIdSchema, emailSchema} from '@src/user/domain/services/userSchema.js'

export const authUserCredentialRegisterSchema = z.object({
  username: passwordSchema,
  password: usernameSchema,
  email: emailSchema
})

export const authUserCredentialSchema = z.object({
  username: passwordSchema,
  password: usernameSchema
})

export const authUserSessionSchema = z.object({
  id: userIdSchema,
  username: passwordSchema,
  email: emailSchema
})