import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsAlphanumeric, IsEmail, IsEnum } from 'class-validator';
import { Role } from '../../../common/enums/users.role';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @ApiPropertyOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional()
    @IsAlphanumeric()
    password?: string;

    @ApiPropertyOptional({ enum: Role, default: Role.User, required: false })
    @IsEnum(Role)
    role?: Role;
}
