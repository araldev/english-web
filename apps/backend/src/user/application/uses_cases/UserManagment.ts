import type { UserModel, UserModelUpdate, UserIdDto, UsernameDto, EmailDto } from '@src/user/domain/repositories/UserModel.js'
import { emailSchema, userIdSchema, usernameSchema, userSchema, userUpdateSchema } from '@src/user/domain/services/userSchema.js'
import type { UserRepositoryDto } from '@src/user/application/port/UserRepositoryDto.d.ts'
import type { UserManagmentDto } from '@src/user/application/port/UserManagmentDto.d.ts'
import { CreateCustomError } from '@src/shared/errors/application/CreateCustomError.js'
import { User } from '@src/user/domain/aggregate/User.js'
import type { AuthUserCredentialRegister } from '@src/auth/domain/repositories/AuthSessionDto.js'

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

  findByEmail = async ({ email }: {email: EmailDto}) => {
    if(!email) CreateCustomError.INVALID_CREDENTIALS()

    const emailParse = await emailSchema.parseAsync(email)

    const user = await this.userClientRepository.findByEmail({ email: emailParse })

    await this.userClientRepository.disconnect()

    if(user != null) return user
    
    return null
  }
  
  findById = async ({ userId }: {userId: UserIdDto}): Promise<UserModel | null> => {
    if(!userId) CreateCustomError.INVALID_CREDENTIALS()

    const idParse = await userIdSchema.parseAsync(userId)

    const user = await this.userClientRepository.findById({ userId: idParse })

    await this.userClientRepository.disconnect()

    if(user != null) return user
    
    return null
  }

  findByUsername = async ({ username }: {username: UsernameDto}): Promise<UserModel | null> => {
    if(!username) CreateCustomError.INVALID_CREDENTIALS()

    const userParse = await usernameSchema.parseAsync(username)

    const user = await this.userClientRepository.findByUserName({ username: userParse })

    await this.userClientRepository.disconnect()

    if(user != null) return user
    
    return null
  }

  create = async ({ user }: {user: AuthUserCredentialRegister}): Promise<UserModel> => {
    if(!user)CreateCustomError.INVALID_CREDENTIALS()

    const newUser = await User.create({ user })

    const userParse = await userSchema.parseAsync(newUser)

    if(!userParse) CreateCustomError.INVALID_CREDENTIALS()

    const userCreated = await this.userClientRepository.create({ user: userParse })

    await this.userClientRepository.disconnect()

    return userCreated
  }

  update = async ({ user }:{user: UserModelUpdate}): Promise<UserModel> => {
    if(!user || !user.id) CreateCustomError.INVALID_CREDENTIALS()

    const userParse = await userUpdateSchema.parseAsync(user)

    if(!userParse || !userParse.id) CreateCustomError.INVALID_CREDENTIALS()
  
    const userInDb = await this.userClientRepository.findById({ userId: userParse.id })
  
    if(!userInDb) CreateCustomError.USER_NOT_FOUND()
  
    const userUpdated = await this.userClientRepository.update({ userId: userInDb.id, userUpdates: userParse })

    await this.userClientRepository.disconnect()

    return  userUpdated
  }

  delete = async ({ userId }: {userId: UserIdDto}): Promise<true |false> => {
    if(!userId || !this.userClientRepository) CreateCustomError.INVALID_CREDENTIALS()

    const idParse = await userIdSchema.parseAsync(userId)
    
    const userFinded = this.userClientRepository.findById({ userId: idParse })

    if(!userFinded) CreateCustomError.USER_NOT_FOUND()

    const isDeleted = await this.userClientRepository.delete({ userId })

    await this.userClientRepository.disconnect()

    return isDeleted
  }
}