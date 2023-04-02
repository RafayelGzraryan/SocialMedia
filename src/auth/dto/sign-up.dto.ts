import { Role } from '../../../common/enums/users.role';
import { IsAlphanumeric, IsEmail, IsEnum, IsNumber, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto {
    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsAlphanumeric()
    @MinLength(4)
    password: string;

    @ApiProperty({ enum: Role, required: false, default: Role.User })
    @IsEnum(Role)
    role?: Role;
}
