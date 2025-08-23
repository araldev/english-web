import {UserModel,UserModelUpdate, UserIdDto} from '@src/user/domain/repositories/UserModel'

export interface UserRepositoryDto {
  findById( {id}: {id: UserIdDto} ): Promise<UserModel> | UserModel
  update({userId, userUpdates}: {userId: UserIdDto, userUpdates:UserModelUpdate}): Promise<UserModel> | UserModel
}