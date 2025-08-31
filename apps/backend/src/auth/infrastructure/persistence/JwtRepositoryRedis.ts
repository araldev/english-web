import { createClient } from 'redis'
import {REDIS_CONFIG} from '@config/serverConfig.js'
import { CreateCustomError } from '@src/shared/errors/application/CreateCustomError.js'
import type { JwtRepositoryDto } from '@src/auth/application/port/JwtRepositoryDto.js'
import type { JwtCacheRepoDto, JwtIdDto } from '@src/auth/domain/repositories/JwtDto.js'
import type { UserIdDto } from '@src/user/domain/repositories/UserModel.d.ts'

export class JwtRepositoryRedis implements JwtRepositoryDto {
  private redis: ReturnType<typeof createClient>

  private constructor ({clientRedis}: {clientRedis: ReturnType<typeof createClient>}) {
    this.redis = clientRedis
  }

  /* ------------------ Conexión con reintentos y timeout ------------------ */ 
  static async connect({retries = 5, delay = 2000}) {
    const client = createClient(REDIS_CONFIG)
    let attempts = 0

    while (!client.isOpen && attempts < retries) {
      try {
        await client.connect()
        console.log("✅ Conectado a Redis")

        /* ------------------ Manejo de errores global ------------------ */ 
        client.on("error", (err) => {
          console.error("❌ Redis Client Error:", err)
        })

        return new JwtRepositoryRedis({ clientRedis: client})
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

  async findById({userId, jwtId}: {userId: UserIdDto, jwtId: JwtIdDto}) {
    return await this.redis.hGet(`userId:${userId}`, jwtId)
  }

  async findAllById({userId}: {userId: UserIdDto}) {
    const data = await this.redis.hGetAll(`userId:${userId}`)

    return Object.entries(data || {}).map(([jwtId, refreshToken]) => ({
      jwtId,
      refreshToken
    }))
  }

  async insert({jwtId, userId, refreshToken}: JwtCacheRepoDto) {
    const isCreated = await this.redis.hSet(`userId:${userId}`, { [jwtId]: refreshToken })
    if(!isCreated) CreateCustomError.INTERNAL_ERROR()

    return {jwtId, userId, refreshToken}
  }

  async update({jwtId, userId, refreshToken}: JwtCacheRepoDto) {
    const isCreated = await this.redis.hSet(`userId:${userId}`, { [jwtId]: refreshToken })
    if(!isCreated) CreateCustomError.INTERNAL_ERROR()

    return {jwtId, userId, refreshToken}
  }

  async delete({userId, jwtId}: {userId: UserIdDto, jwtId: JwtIdDto}) {
    const isDeleted = await this.redis.hDel(`userId:${userId}`, jwtId)
    return isDeleted !== 0 ? true : false
  }

  async deleteAll({userId}: {userId: UserIdDto}) {
    const isDeleted = await this.redis.del(`userId:${userId}`)
    return isDeleted !== 0 ? true : false
  }
}
