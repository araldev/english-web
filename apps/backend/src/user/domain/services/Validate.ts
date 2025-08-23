import {z} from "zod"
import type {UserIdModel, UsernameModel, EmailModel, PasswordModel} from '@src/user/domain/repositories/UserModel'
import {idSchema, usernameSchema, emailSchema, passwordSchema} from '@src/user/domain/repositories/UserModel'

export class Validate {

  private static async username({username}: {username: UsernameModel}) {
    try {
      if (!username) throw new Error('Write an valid username')
      await usernameSchema.parseAsync(username)
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error()
      }
    }
  }

  private static password({password}: {password: PasswordModel}) {
    if(!password) throw new Error('Write a valid password')
  }

  static credencials() {
    this.username()
    this.password()
  }
}