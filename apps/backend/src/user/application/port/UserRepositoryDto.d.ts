import {UserModel, UserIdDto} from '@src/user/domain/repositories/UserModel'

export interface UserRepositoryDto {
  findById( {id}: UserIdDto ): Promise<UserModel> | UserModel
}