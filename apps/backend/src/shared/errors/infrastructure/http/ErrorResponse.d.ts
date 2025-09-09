import type { AuthUserCredentialRegister } from '@/src/auth/domain/repositories/AuthSessionDto'

export interface IResZodError {
  code?: keyof AuthUserCredentialRegister
  message?: string
}