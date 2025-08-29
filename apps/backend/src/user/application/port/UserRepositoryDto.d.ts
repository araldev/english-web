import type { authUserCredentialRegister } from '@src/auth/domain/repositories/AuthSessionDto.js'
import type {UserModel, UserModelUpdate, UserIdDto, UsernameDto} from '@src/user/domain/repositories/UserModel.js'

export interface UserRepositoryDto {
  connect(retries: number , delay: number) 
  findById( {id}: {userId: UserIdDto} ): Promise<UserModel | null>
  findByUserName( {username}: {username: UsernameDto} ): Promise<UserModel | null>
  create({user}: {user: authUserCredentialRegister}): Promise<UserModel>
  update({userId, userUpdates}: {userId: UserIdDto, userUpdates:UserModelUpdate}): Promise<UserModel> 
  delete({userId}: {userId: UserIdDto}): Promise<boolean>
}