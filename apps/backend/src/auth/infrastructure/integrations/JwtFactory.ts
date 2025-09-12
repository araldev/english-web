import { REFRESH_TOKEN_SECRET, ACCESS_TOKEN_SECRET } from '@config/jwtConfig.js'
import type { JwtDto, JwtPayloadDto } from '@src/auth/domain/repositories/JwtDto.js'
import { jwtModelSchema, jwtPayloadSchema } from '@src/auth/domain/services/jwtSchemas.js'
import { CreateCustomError } from '@src/shared/errors/application/CreateCustomError.js'
import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'


export class JwtFactory  {
  static async createRefresh(payload: JwtPayloadDto): Promise<JwtDto> {
    const payloadParse = await jwtPayloadSchema.parseAsync(payload)
    if(!REFRESH_TOKEN_SECRET) CreateCustomError.INTERNAL_ERROR()

    const token = jwt.sign(
      {
        jwtId: crypto.randomUUID(),
        revoke: false,
        ...payloadParse
      },
      REFRESH_TOKEN_SECRET,
      {
        expiresIn: '30d'
      }
    )
    
    return token
  }

  static async validateRefresh({ token }: {token: JwtDto}) {
    if(!token) CreateCustomError.INVALID_CREDENTIALS()
    if(!REFRESH_TOKEN_SECRET) CreateCustomError.INTERNAL_ERROR()
    
    const tokenVerified = jwt.verify(
      token,
      REFRESH_TOKEN_SECRET
    )
      
    return await jwtModelSchema.parseAsync(tokenVerified)
  }

  static async createAccess(payload: JwtPayloadDto): Promise<JwtDto> {
    const payloadParse = await jwtPayloadSchema.parseAsync(payload)
    if(!ACCESS_TOKEN_SECRET) CreateCustomError.INTERNAL_ERROR()

    const token = jwt.sign(
      {
        jwtId: crypto.randomUUID(),
        ...payloadParse
      },
      ACCESS_TOKEN_SECRET,
      {
        expiresIn: '10m'
      }
    )
  
    return token
  }

  static async validateAccess({ token }: {token: JwtDto}) {
    if(!token) CreateCustomError.INVALID_CREDENTIALS()
    if(!ACCESS_TOKEN_SECRET) CreateCustomError.INTERNAL_ERROR()
    
    const tokenVerified = jwt.verify(
      token,
      ACCESS_TOKEN_SECRET
    )

    return await jwtModelSchema.parseAsync(tokenVerified)
  }
}
