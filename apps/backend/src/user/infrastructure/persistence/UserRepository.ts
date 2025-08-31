import type { AuthUserCredentialRegister } from "@src/auth/domain/repositories/AuthSessionDto"
import type { UserRepositoryDto } from "@src/user/application/port/UserRepositoryDto.d.js"
import type { UserIdDto, UserModelUpdate, UsernameDto } from "@src/user/domain/repositories/UserModel.d.js"

export class UserRepository implements UserRepositoryDto {
  findById( {userId}: {userId: UserIdDto} ) {

  }

  findByUserName( {username}: {username: UsernameDto} ) {

  }

  create({user}: {user: AuthUserCredentialRegister}) {

  }

  update({userId, userUpdates}: {userId: UserIdDto, userUpdates:UserModelUpdate}) {

  }

  delete({userId}: {userId: UserIdDto}) {

  }
}