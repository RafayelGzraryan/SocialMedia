import { SetMetadata } from "@nestjs/common";
import { Role } from "../enums/users.role";

export const UserRoles = (...roles: Role[]) => SetMetadata("roles", roles);