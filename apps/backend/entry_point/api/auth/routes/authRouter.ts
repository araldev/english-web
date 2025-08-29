import { Router } from 'express'
import {AuthController} from '@api/auth/controllers/authController.js'
import type { UserRepositoryDto } from '@src/user/application/port/UserRepositoryDto.js'

export function AuthRouter({userRepository}: {userRepository: UserRepositoryDto}) {
  const authRouter = Router()

  const authController = new AuthController({userRepository})

  authRouter.post('/login', authController.login)
  authRouter.post('/register', authController.register)
}