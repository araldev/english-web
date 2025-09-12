import type { AuthUserCredentialProvider, AuthUserCredentialRegister } from '@src/auth/domain/repositories/AuthSessionDto.js'
import type { UserModel, UserModelUpdate, UserIdDto, UsernameDto, EmailDto, UserModelFromProvider } from '@src/user/domain/repositories/UserModel.js'

export interface UserRepositoryDto {
  findByProviderId({ providerId }: {providerId: string}): Promise<UserModelFromProvider | null>
  createWithProvider({ user }: {user: AuthUserCredentialProvider}): Promise< UserModelFromProvider >
  findByEmail({ email }: {email: EmailDto}): Promise<UserModel | UserModelFromProvider | null>
  findById({ userId }: {userId: UserIdDto}): Promise<UserModel | UserModelFromProvider | null>
  findByUserName({ username }: {username: UsernameDto}): Promise<UserModel | UserModelFromProvider | null>
  create({ user }: {user: AuthUserCredentialRegister}): Promise<UserModel | UserModelFromProvider>
  update({ userId, userUpdates }: {userId: UserIdDto, userUpdates:UserModelUpdate}): Promise<UserModel | UserModelFromProvider> 
  delete({ userId }: {userId: UserIdDto}): Promise<boolean>
  disconnect(): Promise<boolean>
}