import type { AuthUserCredentialRegister } from '@src/auth/domain/repositories/AuthSessionDto.js'
import type { UserModel, UserModelUpdate, UserIdDto, UsernameDto, EmailDto } from '@src/user/domain/repositories/UserModel.js'

export interface UserRepositoryDto {
  findByEmail({ email }: {email: EmailDto}): Promise<UserModel | null>
  findById({ userId }: {userId: UserIdDto}): Promise<UserModel | null>
  findByUserName({ username }: {username: UsernameDto}): Promise<UserModel | null>
  create({ user }: {user: AuthUserCredentialRegister}): Promise<UserModel>
  update({ userId, userUpdates }: {userId: UserIdDto, userUpdates:UserModelUpdate}): Promise<UserModel> 
  delete({ userId }: {userId: UserIdDto}): Promise<boolean>
  disconnect(): Promise<boolean>
}