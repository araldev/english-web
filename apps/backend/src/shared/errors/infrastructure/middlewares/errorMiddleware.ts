import type { AuthUserCredentialRegister } from '@/src/auth/domain/repositories/AuthSessionDto.d.ts'
import { CustomError } from '@src/shared/errors/domain/aggregate/CustomErrors.js'
import type { CustomErrorInterface } from '@src/shared/errors/domain/repositories/CustomErrorsInterface.js'
import type { Response, Request, NextFunction } from 'express'
import { ZodError } from 'zod'
import type { IResZodError } from '@src/shared/errors/infrastructure/http/ErrorResponse.d.ts'

export function errorMiddleware(err: CustomErrorInterface | Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ZodError) {
    const errorParse: IResZodError = {}
    err.issues.forEach(e => {
      errorParse.code = e.path[0]?.toString() as keyof AuthUserCredentialRegister
      errorParse.message = e.message 
    })
    return res.status(400).json({
      error: true,
      type: 'ZodError',
      code: errorParse.code,
      message: errorParse.message,
      statusCode: 400
    })
  }
  
  if (err instanceof CustomError) {
    // Respuesta con el mensaje y un status code personalizado (ej: 400)
    return res.status(err.statusCode || 400).json({
      error: true,
      type: 'CustomError',
      code: err.code,
      message: err.message,
      statusCode: err.statusCode || 400,
    })
  }

  return res.status(500).json({
    error: true,
    message: 'Internal server error',
  })
}