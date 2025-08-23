import type {UserModelUpdate, RoleDto, SubscriptionDto, UserIdDto, UsernameDto, EmailDto, PasswordDto, UserModel} from '@src/user/domain/repositories/UserModel'
import type {UserRepositoryDto} from '@src/user/application/port/UserRepositoryDto'
import type {ClassUpdateUserDto} from '@src/user/application/port/ClassUpdateUserDto'

export class UpdateUser implements ClassUpdateUserDto {
  id?: UserIdDto
  username?: UsernameDto
  password?: PasswordDto
  email?: EmailDto
  role?: RoleDto
  permission?: string[] 
  subscription?: SubscriptionDto 
  invitedBy?: string 

  async execute({user, UserDB}:{user: UserModelUpdate, UserDB: UserRepositoryDto}): Promise<UserModel | null> {
    if(!user || !user.id) return null

    const userDb = await UserDB.findById({id: user.id})

    if(!userDb) return null

    return await UserDB.update({userId: userDb.id, userUpdates: user})
  }
}