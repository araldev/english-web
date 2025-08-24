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

export enum CodeError {
  USER_NOT_FOUND = "USER_NOT_FOUND",
  UNSECURE_PASSWORD =  "UNSECURE_PASSWORD",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  INVALID_EMAIL = "INVALID_EMAIL",
  USERNAME_TAKEN = "USERNAME_TAKEN",
  INTERNAL_ERROR = "INTERNAL_ERROR"
}

export type TypeCode =
  | CodeError.USER_NOT_FOUND
  | CodeError.UNSECURE_PASSWORD
  | CodeError.INVALID_CREDENTIALS
  | CodeError.INVALID_EMAIL
  | CodeError.USERNAME_TAKEN
  | CodeError.INTERNAL_ERROR