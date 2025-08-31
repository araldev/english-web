import { CreateCustomError } from "@/src/shared/errors/application/CreateCustomError.js"
import { createServer } from "@api/createServer.js"
import { JwtRepositoryRedis } from "@src/auth/infrastructure/persistence/JwtRepositoryRedis.js"

const tokenClientRepository = await JwtRepositoryRedis.connect({})
if (!tokenClientRepository) CreateCustomError.INTERNAL_ERROR()
  
createServer({tokenClientRepository, userClientRepository})