import { CustomError } from '@src/shared/errors/domain/aggregate/CustomErrors.js'
import { CodeError } from '@/src/shared/errors/domain/services/CustomErrorsEnums.js'

export class CreateCustomError {
  static INTERNAL_ERROR(): never {
    throw new CustomError({
      code: CodeError.INTERNAL_ERROR,
      message: 'Server Issues',
      statusCode: 500
    })
  }

  static USER_ALREADY_EXISTS(): never {
    throw new CustomError({
      code: CodeError.USER_ALREADY_EXISTS,
      message: 'User already exists',
      statusCode: 400
    })
  }

  static USER_NOT_FOUND(): never {
    throw new CustomError({
      code: CodeError.USER_NOT_FOUND,
      message: 'User not found',
      statusCode: 404
    })
  }

  static INVALID_CREDENTIALS(): never {
    throw new CustomError({
      code: CodeError.INVALID_CREDENTIALS,
      message: 'Insert a valid username or password',
      statusCode: 401
    })
  }

  static INVALID_EMAIL(): never {
    throw new CustomError({
      code: CodeError.INVALID_EMAIL,
      message: 'Invalid Email',
      statusCode: 400
    })
  }

  static USERNAME_TAKEN(): never {
    throw new CustomError({
      code: CodeError.USERNAME_TAKEN,
      message: 'This username already exists',
      statusCode: 400
    })
  }

  static UNSECURE_PASSWORD(): never {
    throw new CustomError({
      code: CodeError.UNSECURE_PASSWORD,
      message: 'Your password is unsecure',
      statusCode: 400
    })
  }
}