import { CustomError } from '@src/shared/errors/domain/aggregate/CustomErrors.js'
import type {CustomErrorInterface} from '@src/shared/errors/domain/repositories/CustomErrorsInterface.js'

export function errorMiddleware(err: CustomErrorInterface) {
  if(err instanceof CustomError){
    throw new Error(err.message)
  }
}