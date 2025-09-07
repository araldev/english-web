import { z } from 'zod'
import type { authUserCredentialRegisterSchema, authUserCredentialSchema, authUserSessionSchema } from '@src/auth/domain/services/authSessionSchemas.js'


export type AuthUserCredentialRegister = z.infer<typeof authUserCredentialRegisterSchema>

export type AuthUserCredential = z.infer<typeof authUserCredentialSchema>

export type AuthUserSession = z.infer<typeof authUserSessionSchema>