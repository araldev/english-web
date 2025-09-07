import { PORT } from '@/config/globalConfig.js'
import createApp from '@api/createApp.js'
import type { JwtRepositoryDto } from '@src/auth/application/port/JwtRepositoryDto.js'
import type { UserRepositoryDto } from '@/src/user/application/port/UserRepositoryDto.d.ts'

export function createServer(
  {
    tokenClientRepository,
    userClientRepository
  }
  : {
    tokenClientRepository: JwtRepositoryDto,
    userClientRepository: UserRepositoryDto
  }
) {
  // arrancar servidor
  const app = createApp({ tokenClientRepository, userClientRepository })
  
  const server = app.listen(PORT, () => {
    console.log(`✅ Servidor Express iniciado en http://localhost:${PORT}`)
  })
  
  // detener servidor con Ctrl+C o señales
  process.on('SIGINT', () => {
    console.log('🛑 Servidor detenido manualmente (Ctrl+C)')
    tokenClientRepository.disconnect()
    server.close(() => {
      console.log('Servidor cerrado correctamente')
      process.exit(0)
    })
  })
  
  process.on('SIGTERM', () => {
    console.log('🛑 Servidor detenido por señal SIGTERM')
    tokenClientRepository.disconnect()
    server.close(() => {
      console.log('Servidor cerrado correctamente')
      process.exit(0)
    })
  })
}