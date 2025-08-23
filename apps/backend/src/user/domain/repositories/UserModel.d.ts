import {z} from 'zod'

/* -------- Esquemas -------- */

// 1. id (UUID v4); opcional → se genera automáticamente
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

/* -------- Esquemas usuario base -------- */

export const baseUserSchema = z.object({
  id: idSchema,
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema
})

/* -------- Tipos inferidos Value_Objects -------- */

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

export type RoleDto = "admin" | "user" | "guest"

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

export interface ClassUpdateBaseUserDto<I extends UserModelUpdate, D> extends Partial<ClassBaseUserDto> {
  execute({user, UserDB}:{ user: I, UserDB: D}): Promise<I> | I
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

// Unión de interfaces para representar cualquier tipo de usuario
export type UserModel = AdminUserModel | NormalUserModel | GuestUserModel;

// Versión para update (campos opcionales)
export type UserModelUpdate = Partial<UserModel>;