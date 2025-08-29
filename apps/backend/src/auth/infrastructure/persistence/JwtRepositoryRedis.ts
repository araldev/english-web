import { createClient } from 'redis'
import {REDIS_CONFIG} from '@config/serverConfig.js'
import { CreateCustomError } from '@src/shared/errors/application/CreateCustomError.js'
import type { JwtRepositoryDto } from '@src/auth/application/port/JwtRepositoryDto.js'
import type { JwtCacheRepoDto, JwtIdDto } from '@src/auth/domain/repositories/JwtDto.js'

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

  async findById({jwtId}: {jwtId: JwtIdDto}) {
    return await this.redis.get(jwtId)
  }

  async create({jwtId, refreshToken}: JwtCacheRepoDto) {
    const isCreated = await this.redis.set(jwtId, refreshToken)
    if(!isCreated) CreateCustomError.INTERNAL_ERROR()

    return {jwtId, refreshToken}
  }

  async update({jwtId, refreshToken}: JwtCacheRepoDto) {
    const isCreated = await this.redis.set(jwtId, refreshToken)
    if(!isCreated) CreateCustomError.INTERNAL_ERROR()

    return {jwtId, refreshToken}
  }

  async delete({jwtId}: {jwtId: JwtIdDto}) {
    const isDeleted = await this.redis.del(jwtId)
    return isDeleted !== 0 ? true : false
  }
}
