import express from 'express'
import {AuthRouter} from '@api/auth/routes/authRouter.js'
import cookieParser from 'cookie-parser'
import { CreateAuthMiddleware } from '@api/auth/middlewares/CreateAuthMiddleware.js'
import type { JwtRepositoryDto } from '@src/auth/application/port/JwtRepositoryDto.js'

export function createApp(
  {
    tokenClientRepository
  }
  : {
    tokenClientRepository: JwtRepositoryDto
  }
) {
  const app = express()
  const authMiddleware = new CreateAuthMiddleware({JwtRepository: tokenClientRepository})
  
  app.use(express.json())
  app.use(cookieParser())
  app.use(authMiddleware.authMiddleware)
  
  app.post('/auth', AuthRouter)

  return app
}

export default createApp