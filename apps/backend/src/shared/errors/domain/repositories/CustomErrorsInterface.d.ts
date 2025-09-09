import { CodeError } from '@/src/shared/errors/domain/services/CustomErrorsEnums.js'

export type TypeCode =
  | CodeError.USER_ALREADY_EXISTS
  | CodeError.USER_NOT_FOUND
  | CodeError.UNSECURE_PASSWORD
  | CodeError.INVALID_CREDENTIALS
  | CodeError.INVALID_EMAIL
  | CodeError.USERNAME_TAKEN
  | CodeError.INTERNAL_ERROR

export interface CustomErrorInterface extends Error {
  code: TypeCode
  message: string | null
  statusCode: number | null
}

export interface CustomParamsErrorInterface {
  code: TypeCode
  message: string
  statusCode: number
}