import type {AuthUserSession, AuthUserCredential, authUserCredentialRegister} from '@src/auth/domain/repositories/AuthSessionDto'
import {authUserCredentialSchema, authUserCredentialRegisterSchema} from '@src/auth/domain/repositories/AuthSessionDto'
import type {AuthRepositoryDto} from '@/src/auth/application/port/AuthRepositoryDto'
import { CreateCustomError } from '@/src/shared/errors/application/CreateCustomError'
import type { UserManagmentDto } from '@/src/user/application/port/UserManagmentDto'
import { JwtFactory } from '../../infrastructure/integrations/JwtFactory'

export class AuthUserService {
   private readonly authRepository: AuthRepositoryDto
   private readonly userManagment: UserManagmentDto
   private readonly jwtFactory: JwtFactory

  constructor(
    {
      authRepository,
      userManagment,
      jwtFactory
    }
    : {
      authRepository: AuthRepositoryDto,
      userManagment: UserManagmentDto,
      jwtFactory: JwtFactory
    }
  ) {
    this.authRepository = authRepository
    this.userManagment = userManagment
    this.jwtFactory = jwtFactory
  }

  async register({username, password, email}: authUserCredentialRegister): Promise<AuthUserSession> {
    const credentials = await authUserCredentialRegisterSchema.parseAsync({username, password, email})
    if(!credentials) CreateCustomError.INVALID_CREDENTIALS()

    const user = await this.userManagment.create({user: credentials})
    const {id} = user

    const refreshToken = this.jwtFactory.createAccess({id, email, username})

    await this.authRepository.create({refreshToken})

    return {id, username}
  }

  async login({username, password}: AuthUserCredential) {
    const credential = await authUserCredentialSchema.parseAsync({username, password})
    if(!credential) CreateCustomError.INVALID_CREDENTIALS()
    
    const user = await this.userManagment.findByUsername({username})
    if(!user) CreateCustomError.INVALID_CREDENTIALS()

    return user
  }

  async logout(): Promise<boolean> {
    
    return  true
  }
}