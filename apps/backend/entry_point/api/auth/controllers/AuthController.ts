import { cookieConfig } from '@config/cookieConfig.js'
import type { JwtRepositoryDto } from '@src/auth/application/port/JwtRepositoryDto.js'
import type { AuthUserService } from '@src/auth/application/use-cases/AuthUserService.js'
import type { AuthUserCredential, AuthUserCredentialRegister, AuthUserSession } from '@src/auth/domain/repositories/AuthSessionDto.js'
import { type JwtModelDto } from '@src/auth/domain/repositories/JwtDto.d.js'
import { Token } from '@src/auth/domain/services/jwtSchemas.js'
import { JwtFactory } from '@src/auth/infrastructure/integrations/JwtFactory.js'
import { CreateCustomError } from '@src/shared/errors/application/CreateCustomError.js'
import type { NextFunction, Request, Response } from 'express'

export class AuthController {
  private readonly authUserService: AuthUserService
  private readonly tokenClientRepository: JwtRepositoryDto

  constructor (
    {
      authUserService,
      tokenClientRepository
    }
    : {
      authUserService: AuthUserService,
      tokenClientRepository: JwtRepositoryDto
    }
  ) {
    this.authUserService = authUserService
    this.tokenClientRepository= tokenClientRepository
  }  
  
  register = async (
    req: Request<unknown, unknown, AuthUserCredentialRegister>, 
    res: Response<AuthUserSession & {message: string}>,
    next: NextFunction
  ) => {
    try {
      const { username, password, email } = req.body
      const userSession = await this.authUserService.register({ username, password, email })
      const { id } = userSession
  
      const refreshToken = await JwtFactory.createRefresh(userSession)
      const { jwtId } = await JwtFactory.validateRefresh({ token: refreshToken })
      this.tokenClientRepository.insert({ jwtId, userId: id, refreshToken })
  
      const accessToken = await JwtFactory.createAccess(userSession)
      if(!refreshToken || !accessToken) CreateCustomError.INVALID_CREDENTIALS()
  
      res
        .cookie(Token.refresh_token, refreshToken, cookieConfig.refreshToken)
        .cookie(Token.access_token, accessToken, cookieConfig.accessToken)
        .json({ id, username, email, message: 'User registered successfully' })
    } catch (error) {
      next(error)
    }
  }

  login = async (
    req: Request<unknown, unknown, AuthUserCredential>, 
    res: Response<AuthUserSession & {message: string}>,
    next: NextFunction
  ) => {
    try {
      const { username, password } = req.body
      const userSession = await this.authUserService.login({ username, password })
      const { email, id } = userSession
  
      const refreshToken = await JwtFactory.createRefresh(userSession)
      const { jwtId } = await JwtFactory.validateRefresh({ token: refreshToken })
      this.tokenClientRepository.insert({ jwtId, userId: id, refreshToken })
      const accessToken = await JwtFactory.createAccess(userSession)
      if(!accessToken || !refreshToken) CreateCustomError.INVALID_CREDENTIALS()
  
      res
        .cookie(Token.refresh_token, refreshToken, cookieConfig.refreshToken)
        .cookie(Token.access_token, accessToken, cookieConfig.accessToken)
        .json({ id, username, email, message: 'User login successfully' })
    } catch (error) {
      next(error)
    }
  }

  logout = async (
    req: Request & {cookies: JwtModelDto},
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { refreshToken } = req.cookies
      const { jwtId, id: userId, username } = await JwtFactory.validateRefresh({ token: refreshToken })
  
      this.tokenClientRepository.delete({ jwtId, userId })
  
      res
        .clearCookie(Token.refresh_token)
        .clearCookie(Token.access_token)
        .json({ username, message: 'Succesful logout' })
    } catch (error) {
      next(error)
    }
  }

  me = (
    req: Request & {cookies: JwtModelDto},
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userSession = req.session?.user
      console.log('userSession', userSession)
      if (userSession) {
        return res.json(userSession)
      }
      return res.status(403).json({ error: true, message: 'You need to login' })
    } catch (error) {
      next(error)
    }
  }
}