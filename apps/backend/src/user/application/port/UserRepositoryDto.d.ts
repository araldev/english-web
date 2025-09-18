import type { AuthUserCredentialProvider, AuthUserCredentialRegister } from '@src/auth/domain/repositories/AuthSessionDto.js'
import type { UserModel, UserModelUpdate, UserIdDto, UsernameDto, EmailDto, UserModelFromProvider, UserModelUpdateFromProvider } from '@src/user/domain/repositories/UserModel.js'

export interface UserRepositoryDto {
  findByProviderId({ providerId }: {providerId: string}): Promise<UserModelFromProvider | null>

  findByEmail({ email }: {email: EmailDto}): Promise<UserModel | UserModelFromProvider | null>

  findById({ userId }: {userId: UserIdDto}): Promise<UserModel | UserModelFromProvider | null>

  findByUserName({ username }: {username: UsernameDto}): Promise<UserModel | UserModelFromProvider | null>

  createWithProvider({ user }: {user: UserModelFromProvider}): Promise< UserModelFromProvider >

  create({ user }: {user: UserModel}): Promise<UserModel>

  update({ userId, userUpdates }: {userId: UserIdDto, userUpdates:UserModelUpdate | UserModelUpdateFromProvider}): Promise<UserModel | UserModelFromProvider> 

  delete({ userId }: {userId: UserIdDto}): Promise<boolean>

  disconnect(): Promise<boolean>
}