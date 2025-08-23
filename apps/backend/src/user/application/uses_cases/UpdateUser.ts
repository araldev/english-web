import type {UserModelUpdate, ClassUpdateBaseUserDto, RoleDto, SubscriptionDto, UserIdDto, UsernameDto, EmailDto, PasswordDto, UserModel} from '@src/user/domain/repositories/UserModel'

export class UpdateUser<I extends UserModelUpdate, D> implements ClassUpdateBaseUserDto<I, D > {
  id?: UserIdDto
  username?: UsernameDto
  password?: PasswordDto
  email?: EmailDto
  role?: RoleDto
  permission?: string[] 
  subscription?: SubscriptionDto 
  invitedBy?: string 
  
  private constructor(user: UserModelUpdate) {
    if (user.id) this.id = user.id
    if (user.username) this.username = user.username
    if(user.email) this.email = user.email
    if(user.password) this.password = user.password
    if(user.role) this.role = user.role

    if (user.role === "admin" && user.permission) {
      this.permission = user.permission
    } else if (user.role === "user" && user.subscription) {
      this.subscription = user.subscription
    } else if (user.role === "guest" && user.invitedBy !== undefined) {
      this.invitedBy = user.invitedBy
    }
  }

  async execute({user, UserDB}:{user: I, UserDB: D}) {
    return await UserDB.findById({user.id})
  }
}