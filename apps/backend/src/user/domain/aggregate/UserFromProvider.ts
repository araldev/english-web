import type { AuthUserCredentialProvider } from '@src/auth/domain/repositories/AuthSessionDto.js'
import { CreateCustomError } from '@src/shared/errors/application/CreateCustomError.js'
import type { ClassBaseUserDto, UserModelFromProvider } from '@src/user/domain/repositories/UserModel.d.ts'
import { Role, Subscription, userSchemaFromProvider } from '@src/user/domain/services/userSchema.js'
import type { RoleDto, SubscriptionDto, UserIdDto, UsernameDto, EmailDto, PasswordDto, PermissionDto } from '@src/user/domain/repositories/UserModel.js'

export class UserFromProvider implements ClassBaseUserDto {
  providerId: string
  provider: string
  picture?: string
  id: UserIdDto
  username: UsernameDto
  password: PasswordDto | undefined | null
  email: EmailDto
  role: RoleDto
  permission?: PermissionDto
  subscription?: SubscriptionDto
  invitedBy?: string

  private constructor(user: UserModelFromProvider) {
    this.providerId = user.providerId
    this.provider = user.provider
    this.picture = user.picture
    this.id = user.id 
    this.username = user.username
    this.email = user.email
    this.password = user.password
    this.role = user.role 

    if (user.role === Role.admin && user.permission) {
      this.permission = user.permission 
    } else if (user.role === Role.user && user.subscription) {
      this.subscription = user.subscription 
    } else if (user.role === Role.guest && user.invitedBy != null) {
      this.invitedBy = user.invitedBy 
    }
  }

  static create = async ({ user }: {user: AuthUserCredentialProvider}): Promise<UserFromProvider> => {
    if(!user) CreateCustomError.USER_NOT_FOUND()

    const newUser = {
      id: crypto.randomUUID().toString(),
      role: Role.user,
      subscription: Subscription.basic,
      ...user
    }

    const userParse = await userSchemaFromProvider.parseAsync(newUser)

    if(!userParse) CreateCustomError.USER_NOT_FOUND()

    return new UserFromProvider(userParse)
  }
}