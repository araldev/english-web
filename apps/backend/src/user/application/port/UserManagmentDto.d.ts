import type { authUserCredentialRegister } from "@src/auth/domain/repositories/AuthSessionDto.js"
import type { UserIdDto, UserModel, UserModelUpdate, UsernameDto } from "@src/user/domain/repositories/UserModel.js"
import type { UserRepositoryDto } from "@src/user/application/port/UserRepositoryDto.js"

export interface UserManagmentDto {
  UserRepository: UserRepositoryDto

  findById({userId}: {userId: UserIdDto}): Promise<UserModel>

  findByUsername({username}: {username: UsernameDto}): Promise<UserModel>
  
  create({user}: {user: authUserCredentialRegister}): Promise<UserModel> 
  
  update({user}:{user: UserModelUpdate}): Promise<UserModel> 

  delete({userId}: {userId: UserIdDto}): Promise<true |false> 
}