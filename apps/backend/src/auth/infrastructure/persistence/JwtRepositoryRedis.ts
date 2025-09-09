import { createClient } from 'redis'
import { REDIS_CONFIG, ttlSeconds } from '@/config/redisServerConfig.js'
import { CreateCustomError } from '@src/shared/errors/application/CreateCustomError.js'
import type { JwtRepositoryDto } from '@src/auth/application/port/JwtRepositoryDto.js'
import type { JwtCacheRepoDto, JwtDto, JwtIdDto } from '@src/auth/domain/repositories/JwtDto.js'
import type { UserIdDto } from '@src/user/domain/repositories/UserModel.d.ts'

export class JwtRepositoryRedis implements JwtRepositoryDto {
  private redis: ReturnType<typeof createClient>

  private constructor ({ clientRedis }: {clientRedis: ReturnType<typeof createClient>}) {
    this.redis = clientRedis
  }

  static create = async () => {
    const client = createClient(REDIS_CONFIG)

    return new JwtRepositoryRedis({ clientRedis: client })
  }

  /* ------------------ Conexión con reintentos y timeout ------------------ */ 
  connect = async ({ retries = 5, delay = 2000 }) => {
    let attempts = 0

    while (!this.redis.isOpen && attempts < retries) {
      try {
        await this.redis.connect()
        console.log('✅ Conectado a Redis')

        /* ------------------ Manejo de errores global ------------------ */ 
        this.redis.on('error', (err) => {
          console.error('❌ Redis Client Error:', err)
        })

        return true
      } catch (err) {
        attempts++
        console.error(`❌ Error al conectar a Redis (intento ${attempts}):`, err)
        
        if (attempts >= retries) {
          throw CreateCustomError.INTERNAL_ERROR()
        }
        /* ------  Controlar cuando vuelve a intentar reconectarse ------ */
        await new Promise(res => setTimeout(res, delay))
      }
    }
  }

  disconnect = async () => {
    try {
      await this.redis.quit()
      return true
    } catch(error) {
      throw CreateCustomError.INTERNAL_ERROR()
    }
  }

  findById = async ({ userId, jwtId }: {userId: UserIdDto, jwtId: JwtIdDto}) => {
    return await this.redis.get(`userId:${userId}:${jwtId}`)
  }

  findAllById = async ({ userId }: {userId: UserIdDto}) => {
    // Busca todas las keys que empiecen con "userId:<userId>:"
    const keysJwtId = await this.redis.keys(`userId:${userId}:*`)

    // Obtén todos los valores
    const tokens = await Promise.all(keysJwtId.map(async (keyJwtId) => {
      const refreshToken = await this.redis.get(keyJwtId)
      const jwtIdOnly = keyJwtId.split(':')[2]
      if(!refreshToken || !jwtIdOnly) return
      return { jwtId: jwtIdOnly, refreshToken }
    }))

    const tokensParse = tokens.filter(token => token != null)

    return tokensParse
  }

  insert = async ({ jwtId, userId, refreshToken }: JwtCacheRepoDto) => {
    const isCreated = await this.redis.set(`userId:${userId}:${jwtId}`, refreshToken, { EX: ttlSeconds })

    if(!isCreated) CreateCustomError.INTERNAL_ERROR()

    return { jwtId, userId, refreshToken }
  }

  update = async ({ jwtId, userId, refreshToken }: JwtCacheRepoDto) => {
    const isCreated = await this.redis.set(`userId:${userId}:${jwtId}`, refreshToken, { EX: ttlSeconds })
    if(!isCreated) CreateCustomError.INTERNAL_ERROR()

    return { jwtId, userId, refreshToken }
  }

  delete = async ({ userId, jwtId }: {userId: UserIdDto, jwtId: JwtIdDto}) => {
    const isDeleted = await this.redis.del(`userId:${userId}:${jwtId}`)
    return isDeleted !== 0 ? true : false
  }

  deleteAll = async ({ userId }: {userId: UserIdDto}) => {
    const keysJwtId = await this.redis.keys(`userId:${userId}:*`)

    if (keysJwtId.length === 0) return false

    const multi = this.redis.multi()

    keysJwtId.forEach(key => multi.del(key))

    const results = await multi.exec()
    const isAllDeleted = results.every(res => Number(res) !== 0)

    return isAllDeleted
  }
}
