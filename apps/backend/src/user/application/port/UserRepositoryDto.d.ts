import {UserModel,UserModelUpdate, UserIdDto} from '@src/user/domain/repositories/UserModel'

export interface UserRepositoryDto {
  findById( {id}: {userId: UserIdDto} ): Promise<UserModel> | UserModel
  insert({user}: {user: UserModel}): Promise<UserModel> | UserModel
  update({userId, userUpdates}: {userId: UserIdDto, userUpdates:UserModelUpdate}): Promise<UserModel> | UserModel
  delete({userId}: {userId: UserIdDto}): Promise<true | false> | true | false
}