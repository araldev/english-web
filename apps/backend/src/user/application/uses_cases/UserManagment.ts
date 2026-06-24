import type { UserModel, UserModelUpdate, UserIdDto, UsernameDto, EmailDto, UserModelUpdateFromProvider, UserModelFromProvider } from '@src/user/domain/repositories/UserModel.js'
import { emailSchema, userIdSchema, usernameSchema, userSchema, userSchemaFromProvider, userUpdateSchema, userUpdateSchemaFromProvider } from '@src/user/domain/services/userSchema.js'
import type { UserRepositoryDto } from '@src/user/application/port/UserRepositoryDto.d.ts'
import type { UserManagmentDto } from '@src/user/application/port/UserManagmentDto.d.ts'
import { CreateCustomError } from '@src/shared/errors/application/CreateCustomError.js'
import { User } from '@src/user/domain/aggregate/User.js'
import type { AuthUserCredentialProvider, AuthUserCredentialRegister } from '@src/auth/domain/repositories/AuthSessionDto.js'
import { UserFromProvider } from '../../domain/aggregate/UserFromProvider'

export class UserManagment implements UserManagmentDto {
  private readonly userClientRepository: UserRepositoryDto

  constructor(
    {
      userClientRepository
    }: {
      userClientRepository: UserRepositoryDto
    }
  ) {
    if(!userClientRepository) CreateCustomError.INTERNAL_ERROR()
    this.userClientRepository = userClientRepository
  }

  findByProviderId = async ({ providerId }: {providerId: string}) => {
    const user = await this.userClientRepository.findByProviderId({ providerId })
    
    if (user != null) return user
    return null
  }

  findByEmail = async ({ email }: {email: EmailDto}) => {
    if(!email) CreateCustomError.INVALID_CREDENTIALS()

    const emailParse = await emailSchema.parseAsync(email)

    const user = await this.userClientRepository.findByEmail({ email: emailParse })

    if(user != null) return user
    
    return null
  }
  
  findById = async ({ userId }: {userId: UserIdDto}) => {
    if(!userId) CreateCustomError.INVALID_CREDENTIALS()

    const idParse = await userIdSchema.parseAsync(userId)

    const user = await this.userClientRepository.findById({ userId: idParse })

    if(user != null) return user
    
    return null
  }

  findByUsername = async ({ username }: {username: UsernameDto}) => {
    if(!username) CreateCustomError.INVALID_CREDENTIALS()

    const userParse = await usernameSchema.parseAsync(username)

    const user = await this.userClientRepository.findByUserName({ username: userParse })

    if(user != null) return user
    
    return null
  }

  createWithProvider = async ({ user }: {user: AuthUserCredentialProvider}) => {
    if(!user) CreateCustomError.INVALID_CREDENTIALS()
      
    const newUser = await UserFromProvider.create({ user })
    
    const userParse = await userSchemaFromProvider.parseAsync(newUser)
    console.log('user ---->', newUser, user)

    const userFromProvider = await this.userClientRepository.createWithProvider({ user: userParse })
    console.log('funciona despues de crear el userClientRepository con Provider')

    return userFromProvider
  }

  create = async ({ user }: {user: AuthUserCredentialRegister}) => {
    if(!user)CreateCustomError.INVALID_CREDENTIALS()

    const newUser = await User.create({ user })

    const userParse = await userSchema.parseAsync(newUser)

    if(!userParse) CreateCustomError.INVALID_CREDENTIALS()

    const userCreated = await this.userClientRepository.create({ user: userParse })

    if(!userCreated.password) CreateCustomError.INVALID_CREDENTIALS()

    return userCreated
  }

  updateFromProvider = async ({ user }:{user: UserModelUpdateFromProvider}) => {

    if(!user) CreateCustomError.INVALID_CREDENTIALS()

    const userParse = await userUpdateSchemaFromProvider.parseAsync(user)
    const { providerId } = userParse

    if(!userParse || !providerId) CreateCustomError.INVALID_CREDENTIALS()
    const userInDb = await this.userClientRepository.findByProviderId({ providerId })
  
    if(!userInDb) CreateCustomError.USER_NOT_FOUND()
  
    const userUpdated = await this.userClientRepository.update({ userId: userInDb.id, userUpdates: userParse }) as UserModelFromProvider

    return  userUpdated 
  }
  
  update = async ({ user }:{user: UserModelUpdate}) => {
    if(!user) CreateCustomError.INVALID_CREDENTIALS()
      
    const userParse = await userUpdateSchema.parseAsync(user)

    if(!userParse || !userParse.id) CreateCustomError.INVALID_CREDENTIALS()
    console.log('userUpdate.id', userParse.id)
    const userInDb = await this.userClientRepository.findById({ userId: userParse.id })
    console.log('userInDb-->', userInDb)
  
    if(!userInDb) CreateCustomError.USER_NOT_FOUND()
  
    const userUpdated = await this.userClientRepository.update({ userId: userInDb.id, userUpdates: userParse })

    return  userUpdated as UserModel
  }

  delete = async ({ userId }: {userId: UserIdDto}): Promise<true |false> => {
    if(!userId || !this.userClientRepository) CreateCustomError.INVALID_CREDENTIALS()

    const idParse = await userIdSchema.parseAsync(userId)
    
    const userFinded = await this.userClientRepository.findById({ userId: idParse })

    if(!userFinded) CreateCustomError.USER_NOT_FOUND()

    const isDeleted = await this.userClientRepository.delete({ userId })

    return isDeleted
  }
}