import { REFRESH_TOKEN_SECRET, ACCESS_TOKEN_SECRET } from '@/config/jwtConfig'
import type {JwtModelDto, JwtDto, JwtPayloadDto} from '@/src/auth/domain/repositories/JwtDto'
import {jwtModelSchema, jwtPayloadSchema} from '@/src/auth/domain/services/jwtSchemas'
import { CreateCustomError } from '@/src/shared/errors/application/CreateCustomError'
import jwt from 'jsonwebtoken'

export class JwtFactory  {
  async createRefresh(payload: JwtPayloadDto): Promise<JwtModelDto> {
    const payloadParse = await jwtPayloadSchema.parseAsync(payload)
    if(!payloadParse) CreateCustomError.INVALID_CREDENTIALS()
    if(!REFRESH_TOKEN_SECRET) CreateCustomError.INTERNAL_ERROR()

    const token = jwt.sign(
      payloadParse,
      REFRESH_TOKEN_SECRET,
      {
        expiresIn: "30d"
      }
    )

    return await jwtModelSchema.parseAsync(token)
  }

  async validateRefresh({token}: {token: JwtDto}) {
    if(!token) CreateCustomError.INVALID_CREDENTIALS()
    if(!REFRESH_TOKEN_SECRET) CreateCustomError.INTERNAL_ERROR()
    
    const tokenVerified = jwt.verify(
      token,
      REFRESH_TOKEN_SECRET
    )
    
    return await jwtModelSchema.parseAsync(tokenVerified)
  }

  async createAccess(payload: JwtPayloadDto): Promise<JwtModelDto> {
    const payloadParse = await jwtPayloadSchema.parseAsync(payload)
    if(!payloadParse) CreateCustomError.INVALID_CREDENTIALS()
    if(!ACCESS_TOKEN_SECRET) CreateCustomError.INTERNAL_ERROR()

    const token = jwt.sign(
      payloadParse,
      ACCESS_TOKEN_SECRET,
      {
        expiresIn: "30d"
      }
    )

    return await jwtModelSchema.parseAsync(token)
  }

  async validateAccess({token}: {token: JwtDto}) {
    if(!token) CreateCustomError.INVALID_CREDENTIALS()
    if(!ACCESS_TOKEN_SECRET) CreateCustomError.INTERNAL_ERROR()
    
    const tokenVerified = jwt.verify(
      token,
      ACCESS_TOKEN_SECRET
    )
    
    return await jwtModelSchema.parseAsync(tokenVerified)
  }
}
