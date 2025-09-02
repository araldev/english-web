import type { CookieOptions } from "express"
import { NODE_ENV } from "@/config/globalConfig.js"

export const cookieConfig: {
  refreshToken: CookieOptions,
  accessToken: CookieOptions
} = {
  refreshToken: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30dias --> milisegundos
    secure: NODE_ENV === "production" ? true : false,
    sameSite:"strict"
  },
  accessToken: {
    httpOnly: true,
    maxAge: 1000 * 60 * 10, // 10min --> milisegundos
    secure:NODE_ENV === "production" ? true : false,
    sameSite:"strict"
  }
}