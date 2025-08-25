import {RefreshTokenIdDto, RefreshTokenDto} from '@src/auth/domain/repositories/'

export interface RefreshTokenRepositoryDto {
  findById({id}: {id: RefreshTokenIdDto}): Promise<RefreshTokenDto | null>
  create({refreshToken}: {refreshToken: RefreshTokenDto}): Promise<RefreshTokenDto> 
  update({id, refreshToken}: {id: RefreshTokenIdDto, refreshToken: RefreshTokenDto}): Promise<RefreshTokenDto>
  delete({id}: {id: RefreshTokenIdDto}): Promise<boolean>
}