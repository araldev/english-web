import express from 'express'
import { authRouter } from '@api/auth/routes/authRouter.js'
import cookieParser from 'cookie-parser'
import { CreateAuthMiddleware } from '@api/auth/middlewares/CreateAuthMiddleware.js'
import type { JwtRepositoryDto } from '@src/auth/application/port/JwtRepositoryDto.js'
import type { UserRepositoryDto } from '@/src/user/application/port/UserRepositoryDto.d.ts'
import { errorMiddleware } from '@src/shared/errors/infrastructure/middlewares/errorMiddleware.js'
import { corsMiddleware } from '@/src/shared/errors/infrastructure/middlewares/corsMiddleware'

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
  app.disable('x-powered-by')
  const authMiddleware = new CreateAuthMiddleware({ JwtRepository: tokenClientRepository })
  
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(corsMiddleware())
  app.use(cookieParser())
  app.use(authMiddleware.authMiddleware)

  app.get('/', (req, res) => {
    res.status(200).send('<h1>Auth API</h1>')
  })
  
  app.use('/auth', authRouter({ userClientRepository, tokenClientRepository }))

  app.use(errorMiddleware)

  app.use((req, res) => {
    res.status(404).send('<h1>404 Not Found</h1>')
  })

  return app
}

export default createApp