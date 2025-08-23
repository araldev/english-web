import type {Request, Response} from 'express'
import type {UserModel} from '@src/user/domain/repositories/UserModel' 
import type {AuthControllerInterface} from '@src/auth/domain/repositories/AuthControllerInterface'

export class AuthController implements AuthControllerInterface {
  userModel: UserModel
  
  constructor ({userModel}: {userModel: UserModel}) {
    this.userModel = userModel
  }

  async login(req: Request, res: Response): Promise<Response> {
    const {username, password} = req.body
    
    return res.status(400).json({message: "Invalid username or password"})
  }

  async register(req:Request, res: Response): Promise<Response> {
    const {username, password} = req.body

    return res.status(400).json({message: "Invalid username or password"})
  }
}