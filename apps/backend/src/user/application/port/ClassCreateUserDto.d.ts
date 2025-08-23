import {UserIdDto, UsernameDto, EmailDto, PasswordDto, RoleDto, SubscriptionDto} from '@src/user/domain/repositories/UserModel'

export interface ClassCreateUserDto {
  id: UserIdDto;
  username: UsernameDto;
  email: EmailDto;
  password: PasswordDto;
  role: RoleDto
  permission?: string[]
  subscription?: SubscriptionDto
  invitedBy?: UsernameDto
}
