import type { UserIdDto } from '@src/user/domain/repositories/UserModeld.ts'
import type {JwtDto, JwtCacheRepoDto, JwtIdDto} from '@src/auth/domain/repositories/JwtDto.js'

export interface JwtRepositoryDto {
  findById({userId, jwtId}: {userId: UserIdDto, jwtId: JwtIdDto}) : Promise<JwtDto | null>
  findAllById({userId}: {userId: UserIdDto}) : Promise<Array<Record<JwtIdDto, JwtDto>>>
  insert({jwtId, userId, refreshToken}: JwtCacheRepoDto): Promise<JwtCacheRepoDto> 
  update({jwtId, userId, refreshToken}: JwtCacheRepoDto): Promise<JwtCacheRepoDto>
  delete({userId, jwtId}: {userId: UserIdDto, jwtId: JwtIdDto}): Promise<boolean>
  deleteAll({userId}: {userId: UserIdDto}): Promise<boolean>
}