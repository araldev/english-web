import { z } from 'zod'
import type { authUserCredentialRegisterSchema, authUserCredentialSchema, authUserSessionSchema } from '@src/auth/domain/services/authSessionSchemas.js'


interface AuthUserCredentialProvider extends Omit<AuthUserCredentialRegister, 'password'> {
  providerId: string
  provider: string
}

export type AuthUserCredentialRegister = z.infer<typeof authUserCredentialRegisterSchema>

export type AuthUserCredential = z.infer<typeof authUserCredentialSchema>

export type AuthUserSession = z.infer<typeof authUserSessionSchema>