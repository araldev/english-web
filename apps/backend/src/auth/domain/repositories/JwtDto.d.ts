import {z} from 'zod'
import {jwtPayloadSchema, jwtIdSchema, jwtSchema, jwtIatSchema, jwtExpSchema, jwtModelSchema, JwtCacheRepoSchema, jwtRevokeSchema} from '@src/auth/domain/services/jwtSchemas.js'

/* -------------- Value_Objects Types -------------- */
export type JwtPayloadDto = z.infer<typeof jwtPayloadSchema>
export type  JwtIdDto = z.infer<typeof jwtIdSchema>
export type JwtRevokeDto = z.infer<typeof jwtRevokeSchema>
export type  JwtDto = z.infer<typeof jwtSchema>
export type  JwtCacheRepoDto = z.infer<typeof JwtCacheRepoSchema>
export type  JwtIatDto = z.infer<typeof jwtIatSchema>
export type  JwtExpDto = z.infer<typeof jwtExpSchema>

/* -------------- Aggreggate Types -------------- */
export type JwtModelDto = z.infer<typeof jwtModelSchema>