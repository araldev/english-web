import express from 'express'
import {authRouter} from '@api/auth/routes/authRouter.js'
import cookieParser from 'cookie-parser'
import { CreateAuthMiddleware } from '@api/auth/middlewares/CreateAuthMiddleware.js'
import type { JwtRepositoryDto } from '@src/auth/application/port/JwtRepositoryDto.js'
import type { UserRepositoryDto } from '@/src/user/application/port/UserRepositoryDto.d.ts'

export function createApp(
  {
    tokenClientRepository,
    userClientRepository
  }
  : {
    tokenClientRepository: JwtRepositoryDto,
    userClientRepository: UserRepositoryDto
  }
) {
  const app = express()
  const authMiddleware = new CreateAuthMiddleware({JwtRepository: tokenClientRepository})
  
  app.use(express.json())
  app.use(cookieParser())
  app.use(authMiddleware.authMiddleware)
  
  app.post('/auth', authRouter({userClientRepository, tokenClientRepository}))

  return app
}

export default createApp