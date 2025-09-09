import type { AuthUserCredentialRegister } from '@src/auth/domain/repositories/AuthSessionDto.js'
import type { EmailDto, UserIdDto, UserModel, UserModelUpdate, UsernameDto } from '@src/user/domain/repositories/UserModel.js'

export interface UserManagmentDto {
  findByEmail({ email }: {email: EmailDto}): Promise<UserModel | null>

  findById({ userId }: {userId: UserIdDto}): Promise<UserModel | null>

  findByUsername({ username }: {username: UsernameDto}): Promise<UserModel | null>
  
  create({ user }: {user: AuthUserCredentialRegister}): Promise<UserModel> 
  
  update({ user }:{user: UserModelUpdate}): Promise<UserModel> 

  delete({ userId }: {userId: UserIdDto}): Promise<true |false> 
}