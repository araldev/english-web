import { z } from 'zod'

/* ------------ Enums ------------ */
export enum Role {
  admin = 'admin',
  user = 'user',
  guest = 'guest'
}

export enum Subscription {
  premium = 'premium',
  basic = 'basic'
}

export enum Permission {
  all = 'all',
  write = 'write',
  read = 'read',
  none = 'none'
}

/* -------- Esquemas -------- */

// 1. id (UUID v4) → se genera automáticamente
export const userIdSchema = z
  .string()
  .uuid()
  .default(() => crypto.randomUUID())

// 2. username: alfanumérico, 3-20 carácteres
export const usernameSchema = z
  .string()
  .min(3, 'Mínimo 3 carácteres')
  .max(30, 'Máximo 30 carácteres')
  .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guión bajo')

// 3. email: formato válido
export const emailSchema = z.string().email('Email inválido')

// 4. password: mínimo 6 carácteres
export const passwordSchema = z.string().min(6, 'Mínimo 6 carácteres')

// 5. subscription
export const subscriptionSchema = z.union([
  z.literal(Subscription.premium),
  z.literal(Subscription.basic)
])

// 6. Role
export const roleSchema = z.union([
  z.literal(Role.admin),
  z.literal(Role.user),
  z.literal(Role.guest)
])

// 7. Permissions
export const permissionSchema = z.union([
  z.literal(Permission.all),
  z.literal(Permission.read),
  z.literal(Permission.write),
  z.literal(Permission.none),
])

/* -------- Esquemas usuario base -------- */

export const baseUserSchema = z.object({
  providerId: z.string().optional(),
  provider: z.string().optional(),
  id: userIdSchema,
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema
})

/* -------- Esquemas usuario final -------- */

export const userSchema = z.discriminatedUnion('role', [
  baseUserSchema.extend({ role: z.literal(Role.admin), permission: permissionSchema }),
  baseUserSchema.extend({ role: z.literal(Role.user), subscription: subscriptionSchema }),
  baseUserSchema.extend({ role: z.literal(Role.guest), invitedBy: usernameSchema.optional() }),
])

export const userUpdateSchema = z.discriminatedUnion('role', [
  baseUserSchema.partial().extend({ role: z.literal(Role.admin), permission: permissionSchema.optional() }),
  baseUserSchema.partial().extend({ role: z.literal(Role.user), subscription: subscriptionSchema.optional() }),
  baseUserSchema.partial().extend({ role: z.literal(Role.guest), invitedBy: usernameSchema.optional() }),
])