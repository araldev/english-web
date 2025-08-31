import type { AuthUserCredentialRegister } from "@src/auth/domain/repositories/AuthSessionDto.js"
import type { UserIdDto, UserModel, UserModelUpdate, UsernameDto } from "@src/user/domain/repositories/UserModel.js"

export interface UserManagmentDto {
  findById({userId}: {userId: UserIdDto}): Promise<UserModel>

  findByUsername({username}: {username: UsernameDto}): Promise<UserModel>
  
  create({user}: {user: AuthUserCredentialRegister}): Promise<UserModel> 
  
  update({user}:{user: UserModelUpdate}): Promise<UserModel> 

  delete({userId}: {userId: UserIdDto}): Promise<true |false> 
}