import { Router } from 'express'
import {AuthController} from '@api/auth/controllers/authController.js'
import type { UserRepositoryDto } from '@src/user/application/port/UserRepositoryDto.js'
import { AuthUserService } from '@/src/auth/application/use-cases/AuthUserService.js'
import type { JwtRepositoryDto } from '@/src/auth/application/port/JwtRepositoryDto.d.ts'

export function authRouter(
  {
    tokenClientRepository,
    userClientRepository
  }
  : {
    tokenClientRepository: JwtRepositoryDto,
    userClientRepository: UserRepositoryDto
  }
 ) {
  return () => {
    const authRouter = Router()

    const authUserService = new AuthUserService({userClientRepository})
    const authController = new AuthController({authUserService, tokenClientRepository})
  
    authRouter.post('/login', authController.login)
    authRouter.post('/register', authController.register)
    authRouter.post('/logout', authController.logout)
  }
}