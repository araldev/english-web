import type { UserRepositoryDto } from '@src/user/application/port/UserRepositoryDto.d.js'
import type { EmailDto, UserIdDto, UserModel, UserModelFromProvider, UserModelUpdate, UserModelUpdateFromProvider, UsernameDto } from '@src/user/domain/repositories/UserModel.d.js'
import { PrismaClient } from '@/prisma/generated'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { TURSO_AUTH_TOKEN, TURSO_DATABASE_URL } from '@/config/prisma-turso-serverConfig.js'

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

  static connect = async () => {
    const adapter = new PrismaLibSQL({
      url: TURSO_DATABASE_URL,
      authToken: TURSO_AUTH_TOKEN,
    })
    const prisma = new PrismaClient({ adapter })
    console.log('✅ Conectado a Prisma')

    return new UserRepositoryTursoPrisma({ clientTursoPrisma: prisma })
  }

  findByProviderId = async ({ providerId }: {providerId: string}) => {
    const userDb = await this.prisma.user.findUnique({
      where: { providerId }
    })

    if (!userDb) return null
    
    const user = Object.fromEntries(
      Object.entries(userDb as UserModelFromProvider | UserModel).filter(([key ,value]) => value != null && key !== 'password')
    ) as UserModelFromProvider

    return user
  }

  findByEmail = async ({ email }:{ email: EmailDto}) => {
    const userDb = await this.prisma.user.findUnique({
      where: { email }
    })

    if (!userDb) return null

    const user = Object.fromEntries(
      Object.entries(userDb).filter(([_,value]) => value != null)
    ) as UserModel

    return user
  }

  findById = async ({ userId }: {userId: UserIdDto}): Promise<UserModel | null> => {
    const userDb = await this.prisma.user.findUnique({
      where: { id: userId }
    })

    if (!userDb) return null

    const user = Object.fromEntries(
      Object.entries(userDb).filter(([_, value]) => value != null)
    ) as UserModel

    return user
  }

  findByUserName = async ({ username }: {username: UsernameDto}) => {
    const userDb = await this.prisma.user.findUnique({
      where: { username }
    })

    if (!userDb) return null

    const user = Object.fromEntries(
      Object.entries(userDb).filter(([_, value]) => value != null)
    ) as UserModel

    return user
  }

  createWithProvider = async ({ user }: {user: UserModelFromProvider}) => {
    console.log('creando userFromProvider en DB',   JSON.stringify(user, null, 2))
    const userDb = await this.prisma.user.create({
      data: user
    }) as UserModelFromProvider

    console.log('despues de crear userFromProvider en DB')
    return userDb
  }

  create = async ({ user }: {user: UserModel}) => {
    const userDb = await this.prisma.user.create({
      data: user
    }) as UserModel

    return userDb
  }

  update = async ({ userId, userUpdates }: {userId: UserIdDto, userUpdates:UserModelUpdate | UserModelUpdateFromProvider}) => {
    const userDbUpdated = await this.prisma.user.update({
      where: {
        id: userId
      },
      data: userUpdates
    }) as UserModel

    return userDbUpdated
  }

  delete = async ({ userId }: {userId: UserIdDto}) => {
    const isDeleted = await this.prisma.user.delete({
      where: { id: userId }
    })

    return isDeleted != null ? true : false
  }

  disconnect = async () => {
    try {    
      await this.prisma.$disconnect()
      console.log('⚡ Prisma se ha desconectado...')
      return true
    } catch (error) {
      console.error('❌ Error al desconectar Prisma:', error)
      return false
    }
  }
}