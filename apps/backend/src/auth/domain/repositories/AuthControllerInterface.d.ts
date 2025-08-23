import type {Request, Response} from 'express'
import type {UserModel} from '../../../user/domain/repositories/UserModel'

export interface AuthControllerInterface {
  userModel: UserModel
  login: (req: Request, res: Response) => Promise<Response>
  register: (req: Request, res: Response) => Promise<Response>
}