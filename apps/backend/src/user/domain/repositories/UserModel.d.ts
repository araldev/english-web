import {z} from 'zod'

/* -------- Esquemas -------- */

// 1. id (UUID v4) → se genera automáticamente
export const idSchema = z
  .string()
  .uuid()
  .default(() => crypto.randomUUID())

// 2. username: alfanumérico, 3-20 carácteres
export const usernameSchema = z
  .string()
  .min(3, 'Mínimo 3 carácteres')
  .max(20, 'Máximo 20 carácteres')
  .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guión bajo')

// 3. email: formato válido
export const emailSchema = z.string().email('Email inválido')

// 4. password: mínimo 6 carácteres
export const passwordSchema = z.string().min(6, 'Mínimo 6 carácteres')

// 5. subscription
export const subscriptionSchema = z.union([
  z.literal("premium"),
  z.literal("basic")
])

// 6. Role
export const roleSchema = z.union([z.literal(Role.admin), z.literal(Role.user), z.literal(Role.guest)])


/* ------------ Enums ------------ */
export enum Role {
  admin = "admin",
  user = "user",
  guest = "guest"
}

// Interfaz para usuario admin
export interface AdminUserModel extends BaseUserModel {
  role: "admin";
  permission: string[];
}

// Interfaz para usuario normal
export interface NormalUserModel extends BaseUserModel {
  role: "user";
  subscription: SubscriptionDto;
}

// Interfaz para usuario invitado
export interface GuestUserModel extends BaseUserModel {
  role: "guest";
  invitedBy?: UsernameDto;
}

/* -------- Esquemas usuario base -------- */

export const baseUserSchema = z.object({
  id: idSchema,
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema
})

/* -------- Esquemas usuario final -------- */

export const userSchema = z.discriminatedUnion("role", [
  baseUserSchema.extend({ role: z.literal(Role.admin), permission: z.array(z.string()) }),
  baseUserSchema.extend({ role: z.literal(Role.user), subscription: subscriptionSchema }),
  baseUserSchema.extend({ role: z.literal(Role.guest), invitedBy: usernameSchema.optional() }),
])

export const userUpdateSchema = z.discriminatedUnion("role", [
  baseUserSchema.partial().extend({ id: idSchema, role: z.literal(Role.admin), permission: z.array(z.string()).optional() }),
  baseUserSchema.partial().extend({ id: idSchema, role: z.literal(Role.user), subscription: subscriptionSchema.optional() }),
  baseUserSchema.partial().extend({ id: idSchema, role: z.literal(Role.guest), invitedBy: usernameSchema.optional() }),
])

/* -------- Tipos inferidos Aggregates -------- */

export type UserModel = z.infer<typeof userSchema>
export type UserModelUpdate = z.infer<typeof userUpdateSchema>


/* -------- Tipos inferidos Value_Objects -------- */

export type RoleDto = z.infer<typeof roleSchema>
export type SubscriptionDto = z.infer<typeof subscriptionSchema>
export type UserIdDto = z.infer<typeof idSchema>;
export type UsernameDto = z.infer<typeof usernameSchema>;
export type EmailDto = z.infer<typeof emailSchema>;
export type PasswordDto = z.infer<typeof passwordSchema>;

/* -------- Interfaces -------- */

// Interfaz base común para todos los usuarios
interface BaseUserModel {
  id: UserIdDto;
  username: UsernameDto;
  email: EmailDto;
  password: PasswordDto;
}

export interface ClassBaseUserDto {
  id: UserIdDto;
  username: UsernameDto;
  email: EmailDto;
  password: PasswordDto;
  role: RoleDto
  permission?: string[]
  subscription?: SubscriptionDto
  invitedBy?: UsernameDto
}
