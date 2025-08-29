import { cookieConfig } from "@config/cookieConfig.js"
import type { JwtRepositoryDto } from "@src/auth/application/port/JwtRepositoryDto.js"
import type { AuthUserService } from "@src/auth/application/use-cases/AuthUserService.js"
import type { AuthUserCredential, authUserCredentialRegister } from "@src/auth/domain/repositories/AuthSessionDto.js"
import { type JwtModelDto } from "@src/auth/domain/repositories/JwtDto.d.js"
import { Token } from "@src/auth/domain/services/jwtSchemas.js"
import { JwtFactory } from "@src/auth/infrastructure/integrations/JwtFactory.js"
import { CreateCustomError } from "@src/shared/errors/application/CreateCustomError.js"
import type {Request, Response} from 'express'

export class AuthController {
  authUserService: AuthUserService
  jwtRepository: JwtRepositoryDto

  constructor (
    {
      authUserService,
      jwtRepository
    }
    : {
      authUserService: AuthUserService,
      jwtRepository: JwtRepositoryDto
    }
  ) {
    this.authUserService = authUserService
    this.jwtRepository= jwtRepository
  }  
  async register(
    req: Request<unknown, unknown, authUserCredentialRegister>, 
    res: Response
  ) {
    const {username, password, email} = req.body
    const userSession = await this.authUserService.register({username, password, email})

    const refreshToken = await JwtFactory.createRefresh(userSession)
    if(!refreshToken) CreateCustomError.INVALID_CREDENTIALS()
    const accessToken = await JwtFactory.createAccess(userSession)
    if(!accessToken) CreateCustomError.INVALID_CREDENTIALS()

    res
    .cookie(Token.refresh_token, refreshToken, cookieConfig.refreshToken )
    .cookie(Token.access_token, accessToken, cookieConfig.accessToken )
    .json({username, password, email, message: 'User registered successfully'})
  }

  async login(
    req: Request<unknown, unknown, AuthUserCredential>, 
    res: Response
  ) {
    const {username, password} = req.body
    const userSession = await this.authUserService.login({username, password})
    const {email, id} = userSession

    const refreshToken = await this.jwtRepository.findById({id})
    if(!refreshToken) CreateCustomError.INVALID_CREDENTIALS()
    const accessToken = await JwtFactory.createAccess(userSession)
    if(!accessToken) CreateCustomError.INVALID_CREDENTIALS()

    res
    .cookie(Token.refresh_token, refreshToken, cookieConfig.refreshToken )
    .cookie(Token.access_token, accessToken, cookieConfig.accessToken )
    .json({ username, password, email, message: 'User login successfully'})
  }

  logout(
    req: Request & {cookies: JwtModelDto},
    res: Response
  ) {
    const {refreshToken} = req.cookies

    this.jwtRepository.findById({})

    res.
    clearCookie(Token.refresh_token)
    .clearCookie(Token.refresh_token)
  }
}