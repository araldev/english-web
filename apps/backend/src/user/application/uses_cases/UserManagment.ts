import type { UserModel, UserModelUpdate, UserIdDto } from '@src/user/domain/repositories/UserModel'
import { idSchema, userSchema, userUpdateSchema } from '@src/user/domain/repositories/UserModel'
import type {UserRepositoryDto} from '@src/user/application/port/UserRepositoryDto'
import type {UserManagmentDto} from '@src/user/application/port/UserManagmentDto'
import { CreateCustomError } from '@/src/shared/errors/application/CreateCustomError'
import {User} from '@src/user/domain/aggregate/User'

export class UserManagment implements UserManagmentDto {
  UserRepository: UserRepositoryDto

  constructor({UserRepository}: {UserRepository: UserRepositoryDto}) {
    if(!UserRepository) CreateCustomError.INTERNAL_ERROR()
    this.UserRepository = UserRepository
  }
  
  async findById({userId}: {userId: UserIdDto}): Promise<UserModel> {
    if(!userId) CreateCustomError.USER_NOT_FOUND()

    idSchema.parseAsync(userId)

    const user = await this.UserRepository.findById({userId})

    if (!user) CreateCustomError.USER_NOT_FOUND()

    return user
  }

  async create({user}: {user: UserModel}): Promise<UserModel> {
    if(!user)CreateCustomError.USER_NOT_FOUND()

    const newUser = User.create({user})

    const userParse = await userSchema.parseAsync(newUser)

    if(!userParse) CreateCustomError.USER_NOT_FOUND()

    return await this.UserRepository.insert({user: userParse})
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

    idSchema.parseAsync(userId)
    
    const userFinded = this.UserRepository.findById({userId: userId})

    if(!userFinded) CreateCustomError.USER_NOT_FOUND()

    return await this.UserRepository.delete({userId})
  }
}