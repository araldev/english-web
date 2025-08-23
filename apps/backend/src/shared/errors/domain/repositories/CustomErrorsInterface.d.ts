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
  'UNSECURE_PASSWORD' =  UNSECURE_PASSWORD,
  'INVALID_CREDENTIALS' = INVALID_CREDENTIALS,
  'INVALID_EMAIL' = INVALID_EMAIL,
  'USERNAME_TAKEN' = USERNAME_TAKEN,
  'INTERNAL_ERROR' = INTERNAL_ERROR
}

export type TypeCode =
  | CodeErrors.UNSECURE_PASSWORD
  | CodeErrors.INVALID_CREDENTIALS
  | CodeErrors.INVALID_EMAIL
  | CodeErrors.USERNAME_TAKEN
  | CodeErrors.INTERNAL_ERROR