import {z} from 'zod'
import {jwtPayloadSchema, jwtIdSchema, jwtSchema, jwtIatSchema, jwtExpSchema, jwtModelSchema} from '@src/auth/domain/services/jwtSchemas'

/* -------------- Value_Objects Types -------------- */
export type JwtPayloadDto = z.infer<typeof jwtPayloadSchema>
export type  JwtIdDto = z.infer<typeof jwtIdSchema>
export type  JwtDto = z.infer<typeof jwtSchema>
export type  JwtIatDto = z.infer<typeof jwtIatSchema>
export type  JwtExpDto = z.infer<typeof jwtExpSchema>

/* -------------- Aggreggate Types -------------- */
export type JwtModelDto = z.infer<typeof jwtModelSchema>

/* -------------- Enums -------------- */

export enum Token {
  access_token = "access_token",
  refresh_token = "refresh_token"
}