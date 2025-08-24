import  type { CustomErrorInterface, TypeCode, CustomParamsErrorInterface} from '@src/shared/errors/domain/repositories/CustomErrorsInterface'

export class CustomError  extends Error implements CustomErrorInterface {
  code: TypeCode
  message: string
  statusCode: number
  
  constructor({code, message, statusCode}: CustomParamsErrorInterface) {
    super()
    this.code = code
    this.message = message
    this.statusCode = statusCode
  }
}