import type { UserModel } from '@src/user/domain/repositories/UserModel'
import {User} from '@src/user/domain/aggregate/User'

export class CreateUser {
  admin(user: UserModel) {
    return new User(user)
  }

  user(user: UserModel){
    return new User(user)
  }

  guest(user: UserModel){
    return new User(user)
  }
}