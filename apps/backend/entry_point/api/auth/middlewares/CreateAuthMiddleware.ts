import { cookieConfig } from '@config/cookieConfig.js'
import type { JwtRepositoryDto } from '@src/auth/application/port/JwtRepositoryDto.js'
import type { AuthUserSession } from '@src/auth/domain/repositories/AuthSessionDto.js'
import { Token } from "@src/auth/domain/services/jwtSchemas.js"
import { JwtFactory } from '@src/auth/infrastructure/integrations/JwtFactory.js'
import type { Request, Response, NextFunction } from 'express'

interface Session {
  user: object | null
}

// Extiende la interfaz Request para incluir session
declare module 'express-serve-static-core' {
  interface Request {
    session?: Session
  }
}

export class CreateAuthMiddleware {
  private JwtRepository: JwtRepositoryDto

  constructor ({JwtRepository}: {JwtRepository: JwtRepositoryDto}) {
    this.JwtRepository = JwtRepository
  }
    
  async authMiddleware(req: Request, res: Response, next: NextFunction) {
    const {accessToken} = req.cookies

    // Inicializa la sesión si no existe
    if (!req.session) {
      req.session = { user: null }
    }

    // Continúa con el siguiente middleware
    if (!accessToken) return next()

    try {
      const dataAccessToken = await JwtFactory.validateAccess({token: accessToken})
      const {id, username, email}: AuthUserSession = dataAccessToken
      req.session = {user: {id, username, email}}

      next()
    } catch (error) {
      if(!error) return next()
      const {refreshToken} = req.cookies
      if(!refreshToken) return next()
        
      try {
        const dataRefreshToken = await JwtFactory.validateRefresh({token: refreshToken})
        const {jwtId} = dataRefreshToken
        const refreshTokenDB = await this.JwtRepository.findById({jwtId})
        if(!refreshTokenDB) return next()

        const dataRefreshTokenDB = await JwtFactory.validateRefresh({token: refreshTokenDB})
        
        if(!dataRefreshTokenDB || !dataRefreshTokenDB.revoke) return next()
        
        
        const {id, username, email}: AuthUserSession = dataRefreshTokenDB

        const newAccesToken = await JwtFactory.createAccess({id, username, email})

        res
          .cookie(Token.access_token, newAccesToken, cookieConfig.refreshToken)

        req.session = {user: {id, username, email}}
        next()
      } catch (refreshError) {
      if(refreshError instanceof Error) {
        console.log('❌ Error con refresh token:', refreshError.message)
      }
      next()
    }
    }
  }
}
