import type { UserModel, UserModelUpdate, UserIdDto, UsernameDto } from '@src/user/domain/repositories/UserModel.js'
import { idSchema, usernameSchema, userSchema, userUpdateSchema } from '@src/user/domain/services/userSchema.js'
import type {UserRepositoryDto} from '@src/user/application/port/UserRepositoryDto.js'
import type {UserManagmentDto} from '@src/user/application/port/UserManagmentDto.js'
import { CreateCustomError } from '@src/shared/errors/application/CreateCustomError.js'
import {User} from '@src/user/domain/aggregate/User.js'
import type { authUserCredentialRegister } from '@src/auth/domain/repositories/AuthSessionDto.js'

export class UserManagment implements UserManagmentDto {
  UserRepository: UserRepositoryDto

  constructor({UserRepository}: {UserRepository: UserRepositoryDto}) {
    if(!UserRepository) CreateCustomError.INTERNAL_ERROR()
    this.UserRepository = UserRepository
  }
  
  async findById({userId}: {userId: UserIdDto}): Promise<UserModel> {
    if(!userId) CreateCustomError.USER_NOT_FOUND()

    const idParse = await idSchema.parseAsync(userId)

    const user = await this.UserRepository.findById({userId: idParse})

    if(user != null) return user
    
    CreateCustomError.USER_NOT_FOUND()
  }

  async findByUsername({username}: {username: UsernameDto}): Promise<UserModel> {
    if(!username) CreateCustomError.USER_NOT_FOUND()

    const userParse = await usernameSchema.parseAsync(username)

    const user = await this.UserRepository.findByUserName({username: userParse})

    if(user != null) return user
    
    CreateCustomError.USER_NOT_FOUND()
  }

  async create({user}: {user: authUserCredentialRegister}): Promise<UserModel> {
    if(!user)CreateCustomError.USER_NOT_FOUND()

    const newUser = User.create({user})

    const userParse = await userSchema.parseAsync(newUser)

    if(!userParse) CreateCustomError.USER_NOT_FOUND()

    return await this.UserRepository.create({user: userParse})
  }

  async update({user}:{user: UserModelUpdate}): Promise<UserModel> {
      if(!user || !user.id) CreateCustomError.USER_NOT_FOUND()

      const userParse = await userUpdateSchema.parseAsync(user)

      if(!userParse) CreateCustomError.USER_NOT_FOUND()
  
      const userInDb = await this.UserRepository.findById({userId: userParse.id})
  
      if(!userInDb) CreateCustomError.USER_NOT_FOUND()
  
      return await this.UserRepository.update({userId: userInDb.id, userUpdates: userParse})
    }

  async delete({userId}: {userId: UserIdDto}): Promise<true |false> {
    if(!userId || !this.UserRepository) CreateCustomError.USER_NOT_FOUND()

    const idParse = await idSchema.parseAsync(userId)
    
    const userFinded = this.UserRepository.findById({userId: idParse})

    if(!userFinded) CreateCustomError.USER_NOT_FOUND()

    return await this.UserRepository.delete({userId})
  }
}