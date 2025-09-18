import { z } from 'zod'
import { userSchema, userUpdateSchema, emailSchema, permissionSchema, roleSchema, subscriptionSchema, userIdSchema, usernameSchema, passwordSchema, userUpdateSchemaFromProvider, userSchemaFromProvider } from '@src/user/domain/services/userSchema.js'

/* -------- Tipos inferidos Aggregates -------- */

export type UserModel = z.infer<typeof userSchema>
export type UserModelUpdate = z.infer<typeof userUpdateSchema>
export type UserModelFromProvider = z.infer<typeof userSchemaFromProvider>
export type UserModelUpdateFromProvider = z.infer<typeof userUpdateSchemaFromProvider>

/* -------- Tipos inferidos Value_Objects -------- */

export type PermissionDto = z.infer<typeof permissionSchema>
export type RoleDto = z.infer<typeof roleSchema>
export type SubscriptionDto = z.infer<typeof subscriptionSchema>
export type UserIdDto = z.infer<typeof userIdSchema>;
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
  password: PasswordDto | undefined | null;
  role: RoleDto
  permission?: PermissionDto
  subscription?: SubscriptionDto
  invitedBy?: UsernameDto
}
