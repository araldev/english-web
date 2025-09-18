import type { AuthUserCredentialProvider, AuthUserCredentialRegister } from '@src/auth/domain/repositories/AuthSessionDto.js'
import type { EmailDto, UserIdDto, UserModel, UserModelFromProvider, UserModelUpdate, UserModelUpdateFromProvider, UsernameDto } from '@src/user/domain/repositories/UserModel.js'

export interface UserManagmentDto {
  findByProviderId({ providerId }: {providerId: string}): Promise<UserModelFromProvider | null>

  findByEmail({ email }: {email: EmailDto}): Promise<UserModel | UserModelFromProvider | null>
  
  findById({ userId }: {userId: UserIdDto}): Promise<UserModel | UserModelFromProvider | null>
  
  findByUsername({ username }: {username: UsernameDto}): Promise<UserModel| UserModelFromProvider | null>
  
  createWithProvider({ user }: {user: AuthUserCredentialProvider}): Promise< UserModelFromProvider>
  
  create({ user }: {user: AuthUserCredentialRegister}): Promise<UserModel> 
  
  updateFromProvider({ user }:{user: UserModelUpdateFromProvider}): Promise<UserModelFromProvider> 

  update({ user }:{user: UserModelUpdate}): Promise<UserModel> 

  delete({ userId }: {userId: UserIdDto}): Promise<true |false> 
}