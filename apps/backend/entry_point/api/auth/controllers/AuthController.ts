import { cookieConfig } from '@config/cookieConfig.js'
import type { JwtRepositoryDto } from '@src/auth/application/port/JwtRepositoryDto.js'
import type { AuthUserService } from '@src/auth/application/use-cases/AuthUserService.js'
import type { AuthUserCredential, AuthUserCredentialRegister, AuthUserSession } from '@src/auth/domain/repositories/AuthSessionDto.js'
import { type JwtModelDto } from '@src/auth/domain/repositories/JwtDto.d.js'
import { Token } from '@src/auth/domain/services/jwtSchemas.js'
import { JwtFactory } from '@src/auth/infrastructure/integrations/JwtFactory.js'
import { CreateCustomError } from '@src/shared/errors/application/CreateCustomError.js'
import type { NextFunction, Request, Response } from 'express'
import { OAuth2Client, type VerifyIdTokenOptions } from 'google-auth-library'
import { GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI, GOOGLE_SECRET_KEY } from '@/config/googleAuthConfi.js'
import { storeGoogle } from '@/config/googleAuthConfi.js' 
import { FRONTEND_URL } from '@config/globalConfig.js'

export class AuthController {
  private readonly authUserService: AuthUserService
  private readonly tokenClientRepository: JwtRepositoryDto
  private readonly oAuth2Client: OAuth2Client

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
    this.tokenClientRepository = tokenClientRepository
    this.oAuth2Client = new OAuth2Client({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_SECRET_KEY,
      redirectUri: GOOGLE_REDIRECT_URI,
    })
  }  

  authGoogle = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {    
    try {
      storeGoogle.authorizeUrl = this.oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
          'https://www.googleapis.com/auth/userinfo.profile',
          'https://www.googleapis.com/auth/userinfo.email',
        ],
        prompt: 'consent' // 🔹 fuerza a mostrar el modal de selección de cuenta
      })
  
      res.redirect(storeGoogle.authorizeUrl)
    } catch (error) {
      next(error)
    }
  }

  oauth2callback = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const code = req.query.code as string
      const { tokens } = await this.oAuth2Client.getToken(code)
      this.oAuth2Client.setCredentials(tokens)
      const { id_token: idToken } = tokens

      if(!idToken) CreateCustomError.INVALID_CREDENTIALS()

      const ticket = await this.oAuth2Client.verifyIdToken({
        idToken,
        audience: GOOGLE_CLIENT_ID
      })

      const payload = ticket.getPayload()
      console.log(payload)

      if(!payload) CreateCustomError.INVALID_CREDENTIALS()
      const {
        sub: providerId,
        given_name: username,
        picture,
        email
      } = payload
      const provider = 'google'

      if(!providerId || !username || !email || !provider) CreateCustomError.INVALID_CREDENTIALS()
        
      console.log('antes y provider --->', provider)
      const user = await this.authUserService.providerLogin({ username, provider, providerId, email, picture })
      console.log('despues')
      const { id } = user
  
      const refreshToken = await JwtFactory.createRefresh({ email, id, username, picture })
      const { jwtId } = await JwtFactory.validateRefresh({ token: refreshToken })
      this.tokenClientRepository.insert({ jwtId, userId: id, refreshToken })
      
      const accessToken = await JwtFactory.createAccess({ email, id, username, picture })

      if(!refreshToken || !accessToken) CreateCustomError.INTERNAL_ERROR()

      res
        .cookie(Token.refresh_token ,refreshToken, cookieConfig.refreshToken)
        .cookie(Token.access_token ,accessToken, cookieConfig.accessToken)
        .redirect(FRONTEND_URL)
    } catch (error) {
      console.error('❌ Error CRÍTICO en oauth2callback:', error)

      return res.redirect(FRONTEND_URL)
    }
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
      if(!refreshToken || !accessToken) CreateCustomError.INTERNAL_ERROR()
  
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
      if(!accessToken || !refreshToken) CreateCustomError.INTERNAL_ERROR()
  
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