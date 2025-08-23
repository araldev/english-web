import {CustomError} from '@src/shared/errors/aggregate/CustomErrors'
import {CodeError} from '@/src/shared/errors/aggregate/repositories/CustomErrorsInterface'

export class CreateCustomError {
   static INTERNAL_ERROR() {
      return new CustomError({
        code: CodeError.INTERNAL_ERROR,
        message: "Server Issues",
        statusCode: 500
      })
    }

    static INVALID_CREDENTIALS() {
      return new CustomError({
        code: CodeError.INVALID_CREDENTIALS,
        message: "Insert a valid username or password",
        statusCode: 401
      })
    }
    static INVALID_EMAIL() {
      return new CustomError({
        code: CodeError.INVALID_EMAIL,
        message: "Invalid Email",
        statusCode: 404
      })
    }
    static USERNAME_TAKEN() {
      return new CustomError({
        code: CodeError.USERNAME_TAKEN,
        message: "This username already exists",
        statusCode: 400
      })
    }
    static UNSECURE_PASSWORD() {
      return new CustomError({
        code: CodeError.UNSECURE_PASSWORD,
        message: "Your password is unsecure",
        statusCode: 400
      })
    }
}