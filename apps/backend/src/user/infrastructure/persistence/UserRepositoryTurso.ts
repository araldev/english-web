import type { AuthUserCredentialRegister } from "@src/auth/domain/repositories/AuthSessionDto"
import type { UserRepositoryDto } from "@src/user/application/port/UserRepositoryDto.d.js"
import type { UserIdDto, UserModel, UserModelUpdate, UsernameDto } from "@src/user/domain/repositories/UserModel.d.js"
import {PrismaClient} from '@/prisma/generated'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import {TURSO_AUTH_TOKEN, TURSO_DATABASE_URL} from '@/config/prisma-turso-serverConfig.js'

export class UserRepositoryTursoPrisma implements UserRepositoryDto {
  private readonly prisma: PrismaClient

  private constructor (
    {
      clientTursoPrisma

    }: {
      clientTursoPrisma: PrismaClient
    }
  ) {
    this.prisma = clientTursoPrisma
  }

  static async connect() {
    const adapter = new PrismaLibSQL({
      url: TURSO_DATABASE_URL,
      authToken: TURSO_AUTH_TOKEN,
    })
    const prisma = new PrismaClient({ adapter })

    return new UserRepositoryTursoPrisma({ clientTursoPrisma: prisma})
  }

  async findById( {userId}: {userId: UserIdDto} ): Promise<UserModel | null> {
    const userDb = await this.prisma.user.findUnique({
      where: { id: userId }
    })

    if (!userDb) return null

  const user = Object.fromEntries(
    Object.entries(userDb).filter(([_, value]) => value != null)
  ) as UserModel

  return user
  }

  async findByUserName( {username}: {username: UsernameDto} ) {
    const userDb = await this.prisma.user.findUnique({
      where: { username }
    })

    if (!userDb) return null

  const user = Object.fromEntries(
    Object.entries(userDb).filter(([_, value]) => value != null)
  ) as UserModel

  return user
  }

  async create({user}: {user: AuthUserCredentialRegister}) {
    const userDb = await this.prisma.user.create({
      data: user
    }) as UserModel

    return userDb
  }

  async update({userId, userUpdates}: {userId: UserIdDto, userUpdates:UserModelUpdate}) {
    const userDbUpdated = await this.prisma.user.update({
      where: {
        id: userId
      },
      data: userUpdates
    }) as UserModel

    return userDbUpdated
  }

  async delete({userId}: {userId: UserIdDto}) {
    const isDeleted = await this.prisma.user.delete({
      where: { id: userId }
    })

    return isDeleted != null ? true : false
  }

  async disconnect() {
  try {    
    await this.prisma.$disconnect()
    console.log("⚡ Prisma se ha desconectado...")
    return true
  } catch (error) {
    console.error("❌ Error al desconectar Prisma:", error)
    return false
  }
}
}