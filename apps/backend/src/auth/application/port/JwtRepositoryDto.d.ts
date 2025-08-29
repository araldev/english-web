import type {JwtIdDto, JwtDto, JwtCacheRepoDto} from '@src/auth/domain/repositories/JwtDto.js'

export interface JwtRepositoryDto {
  findById({jwtId}: {jwtId: JwtIdDto}): Promise<JwtDto | null>
  create({jwtId, refreshToken}: JwtCacheRepoDto): Promise<JwtCacheRepoDto> 
  update({jwtId, refreshToken}: JwtCacheRepoDto): Promise<JwtCacheRepoDto>
  delete({jwtId}: {jwtId: JwtIdDto}): Promise<boolean>
}