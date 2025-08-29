import type { AuthUserCredential, authUserCredentialRegister} from '@src/auth/domain/repositories/AuthSessionDto.js'
import {authUserCredentialSchema, authUserCredentialRegisterSchema} from '@src/auth/domain/repositories/AuthSessionDto.js'
import { CreateCustomError } from '@src/shared/errors/application/CreateCustomError.js'
import type { UserManagmentDto } from '@src/user/application/port/UserManagmentDto.js'
import { userSchema } from '@src/user/domain/services/userSchema.js'
import type { JwtPayloadDto } from '@src/auth/domain/repositories/JwtDto.js'

export class AuthUserService {
   private readonly userManagment: UserManagmentDto

  constructor(
    {
      userManagment,
    }
    : {
      userManagment: UserManagmentDto,
    }
  ) {
    this.userManagment = userManagment
  }

  async register({username, password, email}: authUserCredentialRegister): Promise<JwtPayloadDto> {
    const credentials = await authUserCredentialRegisterSchema.parseAsync({username, password, email})
    if(!credentials) CreateCustomError.INVALID_CREDENTIALS()

    const user = await this.userManagment.create({user: credentials})

    const userParse = await userSchema.parseAsync(user)
    if(!userParse) CreateCustomError.INVALID_CREDENTIALS()

    const {id: idParse, username: usernameParse, email: emailParse} = userParse

    return {id: idParse, username: usernameParse, email: emailParse}
  }

  async login({username, password}: AuthUserCredential): Promise<JwtPayloadDto> {
    const credential = await authUserCredentialSchema.parseAsync({username, password})
    if(!credential) CreateCustomError.INVALID_CREDENTIALS()
    
    const user = await this.userManagment.findByUsername({username})
    if(!user) CreateCustomError.INVALID_CREDENTIALS()

    const userParse = await userSchema.parseAsync(user)
    const {id: idParse, username: usernameParse, email: emailParse} = userParse

    return {id: idParse, username: usernameParse, email: emailParse}
  }

  async logout(): Promise<boolean> {
    
    return  true
  }
}