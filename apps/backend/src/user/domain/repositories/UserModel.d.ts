import {z} from 'zod'
import {userSchema, userUpdateSchema, emailSchema, permissionSchema, roleSchema, subscriptionSchema, idSchema, usernameSchema, passwordSchema} from '@src/user/domain/services/userSchema.js'

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

/* -------- Tipos inferidos Aggregates -------- */

export type UserModel = z.infer<typeof userSchema>
export type UserModelUpdate = z.infer<typeof userUpdateSchema>


/* -------- Tipos inferidos Value_Objects -------- */

export type PermissionDto = z.infer<typeof permissionSchema>
export type RoleDto = z.infer<typeof roleSchema>
export type SubscriptionDto = z.infer<typeof subscriptionSchema>
export type UserIdDto = z.infer<typeof idSchema>;
export type UsernameDto = z.infer<typeof usernameSchema>;
export type EmailDto = z.infer<typeof emailSchema>;
export type PasswordDto = z.infer<typeof passwordSchema>;

/* -------- Interfaces -------- */

// Interfaz base común para todos los usuarios
export interface BaseUserModel {
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
  permission?: PermissionDto
  subscription?: SubscriptionDto
  invitedBy?: UsernameDto
}
