import {z} from 'zod'
import {passwordSchema, usernameSchema, idSchema, emailSchema} from '@src/user/domain/services/userSchema.js'

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
  id: idSchema,
  username: passwordSchema,
  email: emailSchema
})

export type authUserCredentialRegister = z.infer<typeof authUserCredentialRegisterSchema>

export type AuthUserCredential = z.infer<typeof authUserCredentialSchema>

export type AuthUserSession = z.infer<typeof authUserSessionSchema>