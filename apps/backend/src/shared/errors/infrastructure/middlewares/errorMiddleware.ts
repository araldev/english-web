import {CustomError} from '@src/shared/errors/aggregate/CustomErrors'
import type {CustomErrorInterface} from '@/src/shared/errors/aggregate/repositories/CustomErrorsInterface'

export function errorMiddleware(err: CustomErrorInterface) {
  if(err instanceof CustomError){
    throw new Error(err.message)
  }
}