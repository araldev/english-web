import {ClassCreateUserDto} from './ClassCreateUserDto'
import {UserRepositoryDto} from './UserRepositoryDto'
import {UserModelUpdate, UserModel } from '@src/user/domain/repositories/UserModel'

export interface ClassUpdateUserDto extends Partial<ClassCreateUserDto> {
  execute({user, UserDB}:{ user: UserModelUpdate, UserDB: UserRepositoryDto}): Promise<UserModel | null> | UserModel | null
}