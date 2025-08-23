import { Router } from 'express'
import {AuthController} from '@api/auth/controllers/AuthController'
import type {UserModel} from '@src/user/domain/repositories/UserModel'

export function AuthRouter({userModel}: {userModel: UserModel}) {
  const authRouter = Router()

  const authController = new AuthController({userModel})

  authRouter.post('/login', authController.login)
  authRouter.post('/register', authController.register)
}