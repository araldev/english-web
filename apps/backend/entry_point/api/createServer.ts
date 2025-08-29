import {PORT} from "@config/serverConfig.js"
import createApp from '@api/createApp.js'
import type { JwtRepositoryDto } from "@src/auth/application/port/JwtRepositoryDto.js"

export function createServer({tokenClientRepository}: {tokenClientRepository: JwtRepositoryDto}) {
  // arrancar servidor
  const app = createApp({tokenClientRepository})
  
  const server = app.listen(PORT, () => {
    console.log(`✅ Servidor Express iniciado en http://localhost:${PORT}`)
  })
  
  // detener servidor con Ctrl+C o señales
  process.on("SIGINT", () => {
    console.log("🛑 Servidor detenido manualmente (Ctrl+C)")
    server.close(() => {
      console.log("Servidor cerrado correctamente")
      process.exit(0)
    })
  })
  
  process.on("SIGTERM", () => {
    console.log("🛑 Servidor detenido por señal SIGTERM")
    server.close(() => {
      console.log("Servidor cerrado correctamente")
      process.exit(0)
    })
  })
}