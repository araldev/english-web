import { CustomError } from '@src/shared/errors/domain/aggregate/CustomErrors.js'
import type { CustomErrorInterface } from '@src/shared/errors/domain/repositories/CustomErrorsInterface.js'
import type { Response, Request, NextFunction } from 'express'

export function errorMiddleware(err: CustomErrorInterface | Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof CustomError) {
    // Respuesta con el mensaje y un status code personalizado (ej: 400)
    return res.status(err.statusCode || 400).json({
      error: true,
      code: err.code,
      message: err.message,
      statusCode: err.statusCode || 400,
    })
  }

  return res.status( 400 ).json({
      error: true,
      message: err.message,
  })
}