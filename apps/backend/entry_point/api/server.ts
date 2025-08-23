import {PORT} from "@/config/serverConfig"
import app from './app'

// arrancar servidor
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