import type { authUserCredentialRegister } from "@/src/auth/domain/repositories/AuthSessionDto"
import type { UserIdDto, UserModel, UserModelUpdate, UsernameDto } from "../../domain/repositories/UserModel"
import type { UserRepositoryDto } from "./UserRepositoryDto"

export interface UserManagmentDto {
  UserRepository: UserRepositoryDto

  findById({userId}: {userId: UserIdDto}): Promise<UserModel>

  findByUsername({username}: {username: UsernameDto}): Promise<UserModel>
  
  create({user}: {user: authUserCredentialRegister}): Promise<UserModel> 
  
  update({user}:{user: UserModelUpdate}): Promise<UserModel> 

  delete({userId}: {userId: UserIdDto}): Promise<true |false> 
}