import type {AuthUserSession, AuthUserCredential, authUserCredentialRegister} from '@src/auth/domain/repositories/AuthSessionDto'
import {authUserCredentialSchema, authUserCredentialRegisterSchema} from '@src/auth/domain/repositories/AuthSessionDto'
import type {RefreshTokenRepositoryDto} from '@src/auth/application/port/RefreshTokenRepositoryDto'
import { CreateCustomError } from '@/src/shared/errors/application/CreateCustomError'
import type { UserRepositoryDto } from '@/src/user/application/port/UserRepositoryDto'

export class AuthUserService {
  authRepository: RefreshTokenRepositoryDto
  userRepository: UserRepositoryDto

  constructor(
    {authRepository, userRepository}
    : {authRepository: RefreshTokenRepositoryDto, userRepository: UserRepositoryDto}
  ) {
    this.authRepository = authRepository
    this.userRepository = userRepository
  }

  async register({username, password, email}: authUserCredentialRegister) {
    const credentials = await authUserCredentialRegisterSchema.parseAsync({username, password, email})
    if(!credentials) CreateCustomError.INVALID_CREDENTIALS()

    return await this.userRepository.create({user: credentials})
  }

  async login({username, password}: AuthUserCredential) {
    const credential = await authUserCredentialSchema.parseAsync({username, password})
    if(!credential) CreateCustomError.INVALID_CREDENTIALS()
    
    const user = await this.userRepository.findByUserName({username})
    if(!user) CreateCustomError.INVALID_CREDENTIALS()

    return user
  }

  async logout(): Promise<boolean> {
    
    return  true
  }
}