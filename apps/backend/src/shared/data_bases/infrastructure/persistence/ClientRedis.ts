import { createClient } from 'redis'
import {REDIS_CONFIG} from '@/config/serverConfig'
import { CreateCustomError } from '@/src/shared/errors/application/CreateCustomError'

const client = createClient(REDIS_CONFIG)

/* ------------------ Conexión con reintentos y timeout ------------------ */ 
export async function connectRedis(retries = 5, delay = 2000) {
  let attempts = 0

  while (!client.isOpen && attempts < retries) {
    try {
      await client.connect()
      console.log("✅ Conectado a Redis")
      return client
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
  return client
}

/* ------------------ Manejo de errores global ------------------ */ 
client.on("error", (err) => {
  console.error("❌ Redis Client Error:", err)
})