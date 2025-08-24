import { CreateCustomError } from '@/src/shared/errors/application/CreateCustomError'
import { type UserModel, type ClassBaseUserDto, userSchema, Role} from '@src/user/domain/repositories/UserModel'
import type {RoleDto, SubscriptionDto, UserIdDto, UsernameDto, EmailDto, PasswordDto} from '@src/user/domain/repositories/UserModel'

export class User implements ClassBaseUserDto {
  id: UserIdDto
  username: UsernameDto
  password: PasswordDto
  email: EmailDto
  role: RoleDto
  permission?: string[]
  subscription?: SubscriptionDto
  invitedBy?: string

  private constructor(user: UserModel) {
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

  static async create({user}: {user: UserModel}): Promise<ClassBaseUserDto> {
    if(!user) CreateCustomError.USER_NOT_FOUND()

    const userParse = await userSchema.parseAsync(user)

    if(!userParse) CreateCustomError.USER_NOT_FOUND()

    return new User(userParse)
  }
}