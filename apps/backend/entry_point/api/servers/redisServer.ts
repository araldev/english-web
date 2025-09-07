import { CreateCustomError } from '@/src/shared/errors/application/CreateCustomError.js'
import { createServer } from '@api/createServer.js'
import { JwtRepositoryRedis } from '@src/auth/infrastructure/persistence/JwtRepositoryRedis.js'
import { UserRepositoryTursoPrisma } from '@/src/user/infrastructure/persistence/UserRepositoryTurso.js'

export async function createRedisServer() {
  try {
    const tokenClientRepository = await JwtRepositoryRedis.create()
    if (!tokenClientRepository) CreateCustomError.INTERNAL_ERROR()
    const isConnected = await tokenClientRepository.connect({})
    if (!isConnected) CreateCustomError.INTERNAL_ERROR()

    const userClientRepository = await UserRepositoryTursoPrisma.connect()
    if (!userClientRepository) CreateCustomError.INTERNAL_ERROR()
  
    createServer({ tokenClientRepository, userClientRepository })
  } catch (error) {
    
  }
}

createRedisServer()