import type { UserModel, ClassBaseUserDto} from '@src/user/domain/repositories/UserModel'
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

  constructor(user: UserModel) {
    this.id = user.id
    this.username = user.username
    this.email = user.email
    this.password = user.password
    this.role = user.role

    if (user.role === "admin" && user.permission) {
      this.permission = user.permission
    } else if (user.role === "user" && user.subscription) {
      this.subscription = user.subscription
    } else if (user.role === "guest" && user.invitedBy !== undefined) {
      this.invitedBy = user.invitedBy
    }
  }

  
}