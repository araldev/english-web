import type { AuthUserCredential, AuthUserCredentialProvider, AuthUserCredentialRegister } from '@src/auth/domain/repositories/AuthSessionDto.d.ts'
import { authUserCredentialSchema, authUserCredentialRegisterSchema } from '@src/auth/domain/services/authSessionSchemas.js'
import { CreateCustomError } from '@src/shared/errors/application/CreateCustomError.js'
import type { UserManagmentDto } from '@src/user/application/port/UserManagmentDto.d.ts'
import type { JwtPayloadDto } from '@src/auth/domain/repositories/JwtDto.d.ts'
import { UserManagment } from '@src/user/application/uses_cases/UserManagment.js'
import type { UserRepositoryDto } from '@src/user/application/port/UserRepositoryDto.d.ts'
import bcrypt from 'bcrypt'
import { SALTROUND } from '@/config/globalConfig.js'

export class AuthUserService {
  private readonly userManagment: UserManagmentDto

  constructor(
    {
      userClientRepository,
    }: {
      userClientRepository: UserRepositoryDto,
    }
  ) {
    this.userManagment = new UserManagment({ userClientRepository })
  }

  providerLogin = async ({ providerId, provider, username, email }: AuthUserCredentialProvider) => {
    const userExists = await this.userManagment.findByProviderId({ providerId })

    if(userExists) return userExists

    const newUser = await this.userManagment.createWithProvider({ user: { providerId, provider, username, email } })

    return newUser
  }

  register = async ({ username, password, email }: AuthUserCredentialRegister): Promise<JwtPayloadDto> => {
    const passwordHashed = await bcrypt.hash(password , SALTROUND)
    const credentials = await authUserCredentialRegisterSchema.parseAsync({ username, password: passwordHashed, email })
    if(!credentials) CreateCustomError.INVALID_CREDENTIALS()
      
    const userExists = await this.userManagment.findByUsername({ username: credentials.username })
    const emailExist = await this.userManagment.findByEmail({ email: credentials.email })
    
    if (userExists) CreateCustomError.USER_ALREADY_EXISTS()
    if (emailExist) CreateCustomError.INVALID_EMAIL()

    const user = await this.userManagment.create({ user: credentials })

    const { id: idParse, username: usernameParse, email: emailParse } = user

    return { id: idParse, username: usernameParse, email: emailParse }
  }

  login = async ({ username, password }: AuthUserCredential): Promise<JwtPayloadDto> => {
    const credential = await authUserCredentialSchema.parseAsync({ username, password })
    if(!credential) CreateCustomError.INVALID_CREDENTIALS()

    const user = await this.userManagment.findByUsername({ username })
    if(!user ||!user.password) CreateCustomError.INVALID_CREDENTIALS()

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if(!isPasswordValid) CreateCustomError.INVALID_CREDENTIALS()

    const { id: idParse, username: usernameParse, email: emailParse } = user

    return { id: idParse, username: usernameParse, email: emailParse }
  }

  logout = async (): Promise<boolean> => {
    
    return  true
  }
}