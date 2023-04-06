import { Role } from '../../../common/enums/users.role';
import { IsAlphanumeric, IsEmail, IsEnum } from 'class-validator';

export class CreateUserDto {
    @IsEmail()
    email: string;

    @IsAlphanumeric()
    password: string;

    @IsEnum(Role)
    role: Role;
}
